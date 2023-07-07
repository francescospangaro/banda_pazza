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

let january: Date;
let may: Date;
let september: Date;

if (new Date().getMonth() < 9) {
  january = new Date(new Date().getFullYear(), 0, 1);
  may = new Date(new Date().getFullYear(), 4, 1);
  september = new Date(new Date().getFullYear() - 1, 8, 1);
} else {
  january = new Date(new Date().getFullYear() + 1, 0, 1);
  may = new Date(new Date().getFullYear() + 1, 4, 1);
  september = new Date(new Date().getFullYear(), 8, 1);
}

export const getServerSideProps = requireAuth<Props>(async () => {
  const docenteIdToMinutesFirst: Map<
    number,
    { paidMinutes: number; nonPaidMinutes: number }
  > = (
    await prisma.$queryRaw<
      {
        docenteId: unknown;
        minutes: unknown;
        paid: unknown;
      }[]
    >`
        SELECT docenteId                                                as docenteId,
               SUM(TIMESTAMPDIFF(MINUTE, orarioDiInizio, orarioDiFine)) as minutes,
               paid                                                     as paid
        FROM Lezione
        WHERE (libretto = 'PRESENTE' OR libretto = 'ASSENTE_NON_GIUSTIFICATO')
          AND orarioDiFine < CAST(${new Date().toJSON()} as DATETIME)
          AND orarioDiFine BETWEEN (CAST(${september.toJSON()} as DATETIME)) AND (CAST(${january.toJSON()} as DATETIME))
        GROUP BY Lezione.docenteId, Lezione.paid
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

  const docenteIdToMinutesSecond: Map<
    number,
    { paidMinutes: number; nonPaidMinutes: number }
  > = (
    await prisma.$queryRaw<
      {
        docenteId: unknown;
        minutes: unknown;
        paid: unknown;
      }[]
    >`
        SELECT docenteId                                                as docenteId,
               SUM(TIMESTAMPDIFF(MINUTE, orarioDiInizio, orarioDiFine)) as minutes,
               paid                                                     as paid
        FROM Lezione
        WHERE (libretto = 'PRESENTE' OR libretto = 'ASSENTE_NON_GIUSTIFICATO')
          AND orarioDiFine < CAST(${new Date().toJSON()} as DATETIME)
          AND orarioDiFine BETWEEN (CAST(${january.toJSON()} as DATETIME)) AND (CAST(${may.toJSON()} as DATETIME))
        GROUP BY Lezione.docenteId, Lezione.paid
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

  const docenteIdToMinutesThird: Map<
    number,
    { paidMinutes: number; nonPaidMinutes: number }
  > = (
    await prisma.$queryRaw<
      {
        docenteId: unknown;
        minutes: unknown;
        paid: unknown;
      }[]
    >`
        SELECT docenteId                                                as docenteId,
               SUM(TIMESTAMPDIFF(MINUTE, orarioDiInizio, orarioDiFine)) as minutes,
               paid                                                     as paid
        FROM Lezione
        WHERE (libretto = 'PRESENTE' OR libretto = 'ASSENTE_NON_GIUSTIFICATO')
          AND orarioDiFine < CAST(${new Date().toJSON()} as DATETIME)
          AND orarioDiFine BETWEEN (CAST(${may.toJSON()} as DATETIME)) AND (CAST(${september.toJSON()} as DATETIME))
        GROUP BY Lezione.docenteId, Lezione.paid
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
            (docenteIdToMinutesFirst.get(docente.id)?.nonPaidMinutes ?? 0) / 60,
          hoursToBePaidSecond:
            (docenteIdToMinutesSecond.get(docente.id)?.nonPaidMinutes ?? 0) /
            60,
          hoursToBePaidThird:
            (docenteIdToMinutesThird.get(docente.id)?.nonPaidMinutes ?? 0) / 60,
          //euros to pay
          eurosToBePaidFirst:
            ((docenteIdToMinutesFirst.get(docente.id)?.nonPaidMinutes ?? 0) /
              60) *
            docente.stipendioOrario,
          eurosToBePaidSecond:
            ((docenteIdToMinutesSecond.get(docente.id)?.nonPaidMinutes ?? 0) /
              60) *
            docente.stipendioOrario,
          eurosToBePaidThird:
            ((docenteIdToMinutesThird.get(docente.id)?.nonPaidMinutes ?? 0) /
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
              <option value="1" selected={trimestre == 1}>
                Primo Trimestre
              </option>
              <option value="2" selected={trimestre == 2}>
                Secondo Trimestre
              </option>
              <option value="3" selected={trimestre == 3}>
                Terzo Trimestre
              </option>
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
                      dataInizio:
                        trimestre === 1
                          ? september
                          : trimestre === 2
                          ? january
                          : may,
                      dataFine:
                        trimestre === 1
                          ? january
                          : trimestre === 2
                          ? may
                          : september,
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
