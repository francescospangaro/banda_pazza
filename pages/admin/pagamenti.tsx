import requireAuth from "@/lib/auth";
import { NextPage } from "next";
import React, { useState } from "react";
import Layout from "@/components/Layout";
import { Button, Col, Container, Row } from "react-bootstrap";
import { Docente } from "@/types/api/admin/docente";
import PagamentiTable from "@/components/PagamentiTable";
import styles from "@/styles/Home.module.css";
import { prisma } from "@/lib/database";
import { zodFetch } from "@/lib/fetch";
import * as PaymentsApi from "@/types/api/admin/payments";

type Props = {
  docenti: (Docente & { hoursDone: number } & { euros: number } & {
    eurosPaid: number;
  })[];
};

export const getServerSideProps = requireAuth<Props>(async () => {
  const docenteIdToMinutes: Map<number, number> = (
    await prisma.$queryRaw<
      {
        docenteId: unknown;
        minutes: unknown;
      }[]
    >`
        SELECT docenteId                                                as docenteId,
               SUM(TIMESTAMPDIFF(MINUTE, orarioDiInizio, orarioDiFine)) as minutes
        FROM Lezione
        WHERE paid = false
          AND (libretto = "PRESENTE" OR libretto = "ASSENTE_NON_GIUSTIFICATO")
          AND orarioDiFine < CAST(${new Date().toJSON()} as DATETIME)
        GROUP BY Lezione.docenteId
    `
  )
    .map((entry) => {
      return {
        docenteId: Number(entry.docenteId),
        minutes: Number(entry.minutes ?? 0),
      };
    })
    .reduce((map, entry) => {
      map.set(entry.docenteId, entry.minutes);
      return map;
    }, new Map<number, number>());

  const paidLessons: Map<number, number> = (
    await prisma.$queryRaw<
      {
        docenteId: unknown;
        minutes: unknown;
      }[]
    >`
        SELECT docenteId                                                as docenteId,
               SUM(TIMESTAMPDIFF(MINUTE, orarioDiInizio, orarioDiFine)) as minutes
        FROM Lezione
        WHERE paid = true
          AND (libretto = "PRESENTE" OR libretto = "ASSENTE_NON_GIUSTIFICATO")
          AND orarioDiFine < CAST(${new Date().toJSON()} as DATETIME)
        GROUP BY Lezione.docenteId
    `
  )
    .map((entry) => {
      return {
        docenteId: Number(entry.docenteId),
        minutes: Number(entry.minutes ?? 0),
      };
    })
    .reduce((map, entry) => {
      map.set(entry.docenteId, entry.minutes);
      return map;
    }, new Map<number, number>());

  return {
    props: {
      docenti: (await prisma.docente.findMany({})).map((docente) => {
        return {
          id: docente.id,
          nome: docente.nome,
          cognome: docente.cognome,
          email: docente.email,
          cf: docente.cf,
          hoursDone: (docenteIdToMinutes.get(docente.id) ?? 0) / 60,
          euros:
            ((docenteIdToMinutes.get(docente.id) ?? 0) / 60) *
            docente.stipendioOrario, // TODO: actually use the hourly rate
          eurosPaid:
            ((paidLessons.get(docente.id) ?? 0) / 60) * docente.stipendioOrario, // TODO: actually use the hourly rate
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
                    newArr[newArr.findIndex((d) => d.id === docente.id)] = {
                      ...docente,
                      hoursDone: 0,
                      euros: 0,
                      eurosPaid: 0,
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
