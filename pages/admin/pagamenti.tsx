import requireAuth from "@/lib/auth";
import { NextPage } from "next";
import React, { useState } from "react";
import Layout from "@/components/Layout";
import { Container } from "react-bootstrap";
import { Docente } from "@/types/api/admin/docente";
import PagamentiTable from "@/components/PagamentiTable";
import styles from "@/styles/Home.module.css";
import { prisma } from "@/lib/database";
import { zodFetch } from "@/lib/fetch";
import * as PaymentsApi from "@/types/api/admin/payments";
import Form from "react-bootstrap/Form";
import { getCurrentSemesters } from "@/lib/semesters";

type Props = {
  docenti: (Docente & {
    hoursToBePaidFirst: number;
    hoursToBePaidSecond: number;
    hoursToBePaidThird: number;
    eurosToBePaidFirst: number;
    eurosToBePaidSecond: number;
    eurosToBePaidThird: number;
  })[];
};

const semesters = getCurrentSemesters();

export const getServerSideProps = requireAuth<Props>(async () => {
  const docenteIdToMinutes: Map<
    number,
    { paidMinutes: number; nonPaidMinutes: number }
  >[] = await Promise.all(
    semesters.map(async ({ start, end }) => {
      return (
        await prisma.$queryRaw<
          {
            docenteId: unknown;
            minutes: unknown;
            paid: unknown;
          }[]
        >`
          SELECT "docenteId"                        as "docenteId",
                 SUM(EXTRACT(EPOCH FROM "orarioDiFine"-"orarioDiInizio")) as minutes,
                 "paid"                             as paid
          FROM "Lezione"
          WHERE ("libretto" = 'PRESENTE' OR "libretto" = 'ASSENTE_NON_GIUSTIFICATO')
            AND "orarioDiFine" < DATE(CAST(${new Date().toJSON()}))
            AND "orarioDiFine" BETWEEN (DATE(CAST(${start.toJSON()}))) AND (DATE(CAST(${end.toJSON()})))
          GROUP BY "Lezione"."docenteId", "Lezione"."paid"
        `
      )
        .map((entry) => {
          return {
            docenteId: Number(entry.docenteId),
            minutes: Number(entry.minutes ?? 0),
            paid: Boolean(entry.paid),
          };
        })
        .reduce((map, entry) => {
          map.set(entry.docenteId, {
            paidMinutes: entry.paid
              ? entry.minutes
              : map.get(entry.docenteId)?.paidMinutes ?? 0,
            nonPaidMinutes: !entry.paid
              ? entry.minutes
              : map.get(entry.docenteId)?.nonPaidMinutes ?? 0,
          });
          return map;
        }, new Map<number, { paidMinutes: number; nonPaidMinutes: number }>());
    })
  );

  return {
    props: {
      docenti: (await prisma.docente.findMany({})).map((docente) => {
        return {
          id: docente.id,
          nome: docente.nome,
          cognome: docente.cognome,
          email: docente.email,
          cf: docente.cf,
          stipendioOrario: docente.stipendioOrario,
          //hours
          hoursToBePaidFirst:
            (docenteIdToMinutes[0].get(docente.id)?.nonPaidMinutes ?? 0) / 60,
          hoursToBePaidSecond:
            (docenteIdToMinutes[1].get(docente.id)?.nonPaidMinutes ?? 0) / 60,
          hoursToBePaidThird:
            (docenteIdToMinutes[2].get(docente.id)?.nonPaidMinutes ?? 0) / 60,
          //euros to pay
          eurosToBePaidFirst:
            ((docenteIdToMinutes[0].get(docente.id)?.nonPaidMinutes ?? 0) /
              60) *
            docente.stipendioOrario,
          eurosToBePaidSecond:
            ((docenteIdToMinutes[1].get(docente.id)?.nonPaidMinutes ?? 0) /
              60) *
            docente.stipendioOrario,
          eurosToBePaidThird:
            ((docenteIdToMinutes[2].get(docente.id)?.nonPaidMinutes ?? 0) /
              60) *
            docente.stipendioOrario,
        };
      }),
    },
  };
}, true);

const Home: NextPage<Props> = (props) => {
  const [fullDocenti, setFullDocenti] = useState(props.docenti);
  const [trimestre, setTrimestre] = useState(1);
  const docenti = fullDocenti.map((d) => {
    const {
      hoursToBePaidFirst,
      hoursToBePaidSecond,
      hoursToBePaidThird,
      eurosToBePaidFirst,
      eurosToBePaidSecond,
      eurosToBePaidThird,
      ...doc
    } = d;
    return {
      ...doc,
      hoursToBePaid:
        trimestre === 1
          ? d.hoursToBePaidFirst
          : trimestre === 2
          ? d.hoursToBePaidSecond
          : d.hoursToBePaidThird,
      eurosToBePaid:
        trimestre === 1
          ? d.eurosToBePaidFirst
          : trimestre === 2
          ? d.eurosToBePaidSecond
          : d.eurosToBePaidThird,
    };
  });

  return (
    <>
      <Layout requiresAuth>
        <Container fluid className={styles.container}>
          <main className={styles.main}>
            <Form.Select
              aria-label="Selezione trimestre"
              onChange={async (event) => {
                let trimestre = Number(event.target.value);
                setTrimestre(trimestre);
              }}
            >
              {semesters.map(({ start, end }, index) => (
                <option
                  key={index}
                  value={index + 1}
                  selected={trimestre === index + 1}
                >
                  {["Primo", "Secondo", "Terzo"][index]} Trimestre (
                  {start.toLocaleDateString(undefined, {
                    month: "long",
                    year: "numeric",
                  })}{" "}
                  -{" "}
                  {end.toLocaleDateString(undefined, {
                    month: "long",
                    year: "numeric",
                  })}
                  )
                </option>
              ))}
            </Form.Select>
            <PagamentiTable
              scrollable
              content={docenti}
              onPay={async (docente) => {
                const { res } = await zodFetch("/api/admin/payments", {
                  method: "POST",
                  body: {
                    value: {
                      docenteId: docente.id,
                      dataInizio: semesters[trimestre - 1].start,
                      dataFine: semesters[trimestre - 1].end,
                    },
                    validator: PaymentsApi.Post.RequestValidator,
                  },
                  responseValidator: PaymentsApi.Post.ResponseValidator,
                });

                if (res.ok) {
                  setFullDocenti((docenti) => {
                    const newArr = [...docenti];
                    const prevDocenteIdx = newArr.findIndex(
                      (d) => d.id === docente.id
                    );
                    const prevDocente = newArr[prevDocenteIdx];
                    newArr[prevDocenteIdx] = {
                      ...prevDocente,
                      //uncomment to have the hours reset on pay
                      hoursToBePaidFirst:
                        /*  trimestre === 1 ? 0 : */ prevDocente.hoursToBePaidFirst,
                      hoursToBePaidSecond:
                        /*  trimestre === 2 ? 0 : */ prevDocente.hoursToBePaidSecond,
                      hoursToBePaidThird:
                        /*  trimestre === 3 ? 0 : */ prevDocente.hoursToBePaidThird,
                      eurosToBePaidFirst:
                        trimestre === 1 ? 0 : prevDocente.hoursToBePaidFirst,
                      eurosToBePaidSecond:
                        trimestre === 2 ? 0 : prevDocente.eurosToBePaidSecond,
                      eurosToBePaidThird:
                        trimestre === 3 ? 0 : prevDocente.eurosToBePaidThird,
                    };
                    return newArr;
                  });
                }
              }}
            />
          </main>
        </Container>
      </Layout>
    </>
  );
};

export default Home;
