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

type Props = {
  docenti: (Docente & {
    hoursToBePaid: number;
    eurosToBePaid: number;
    eurosPaid: number;
  })[];
};

export const getServerSideProps = requireAuth<Props>(async () => {
  const docenteIdToMinutes: Map<
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
          hoursToBePaid:
            (docenteIdToMinutes.get(docente.id)?.nonPaidMinutes ?? 0) / 60,
          eurosToBePaid:
            ((docenteIdToMinutes.get(docente.id)?.nonPaidMinutes ?? 0) / 60) *
            docente.stipendioOrario,
          eurosPaid:
            ((docenteIdToMinutes.get(docente.id)?.paidMinutes ?? 0) / 60) *
            docente.stipendioOrario,
        };
      }),
    },
  };
}, true);

const Home: NextPage<Props> = (props) => {
  const [docenti, setDocenti] = useState(props.docenti);

  return (
    <>
      <Layout requiresAuth>
        <Container fluid className={styles.container}>
          <main className={styles.main}>
            <PagamentiTable
              scrollable
              content={docenti}
              onPay={async (docente) => {
                const { res } = await zodFetch("/api/admin/payments", {
                  method: "POST",
                  body: {
                    value: { docenteId: docente.id },
                    validator: PaymentsApi.Post.RequestValidator,
                  },
                  responseValidator: PaymentsApi.Post.ResponseValidator,
                });

                if (res.ok) {
                  setDocenti((docenti) => {
                    const newArr = [...docenti];
                    const prevDocenteIdx = newArr.findIndex(
                      (d) => d.id === docente.id
                    );
                    const prevDocente = newArr[prevDocenteIdx];
                    newArr[prevDocenteIdx] = {
                      ...docente,
                      hoursToBePaid: 0,
                      eurosToBePaid: 0,
                      eurosPaid:
                        prevDocente.eurosPaid + prevDocente.eurosToBePaid,
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
