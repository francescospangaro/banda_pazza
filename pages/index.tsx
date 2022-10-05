import type {NextPage} from 'next'
import styles from '@/styles/Home.module.css'
import {User} from "@/types/api/user";

import React, {useState} from "react";
import Layout from "@/components/Layout"
import LezioniTable from "@/components/LezioniTable";

import requireAuth from "@/lib/auth"
import useSWR from "swr";
import {Lezione} from "@/types/api/lezioni";
import {Container, Col, Row, Form, Button} from "react-bootstrap"
import RecuperaLezioneModal from "@/components/RecuperaLezioniModal";
import * as LezioniDaGiustificareApi from "@/types/api/lezioni-da-giustificare"
import { isOverlapError } from "@/types/api/admin/lezione";

type Props = {
    docente: User;
}

export const getServerSideProps = requireAuth(async (ctx) => {
    return {
        props: {
            docente: ctx.req.session.user
        }
    }
})

const Home: NextPage<Props> = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [showRecuperiModal, setShowRecuperiModal] = useState(false);
    const {data: lezioni, mutate: mutateLezioni} = useSWR<Lezione[]>(
        '/api/lezioni/' + currentDate.toLocaleDateString(
            'en-US',
            {year: "numeric", month: "numeric", day: "numeric"},
        ), () => {
            return fetch("/api/lezioni", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    from: (() => {
                        const startOfDay = new Date(currentDate);
                        startOfDay.setHours(0, 0, 0, 0);
                        return startOfDay;
                    })(),
                    to: (() => {
                        const endOfDay = new Date(currentDate);
                        endOfDay.setHours(23, 59, 59, 9999);
                        return endOfDay;
                    })(),
                })
            }).then(r => r.json()).then(lezioni => lezioni.map((lezione: any) => {
                return {
                    ...lezione,
                    orarioDiInizio: new Date(lezione.orarioDiInizio),
                    orarioDiFine: new Date(lezione.orarioDiFine),
                    recuperataDa: lezione.recuperataDa ? {
                        ...lezione.recuperataDa,
                        orarioDiInizio: new Date(lezione.recuperataDa.orarioDiInizio),
                        orarioDiFine: new Date(lezione.recuperataDa.orarioDiFine),
                    } : undefined,
                    recuperoDi: lezione.recuperoDi ? {
                        ...lezione.recuperoDi,
                        orarioDiInizio: new Date(lezione.recuperoDi.orarioDiInizio),
                        orarioDiFine: new Date(lezione.recuperoDi.orarioDiFine),
                    } : undefined,
                }
            }));
        });
    const {data: lezioniDaRecuperare, mutate: mutateLezioniDaGiustificare} = useSWR<Lezione[]>(
        '/api/lezioni-da-giustificare',
        (url: string) => {
            return fetch(url, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            }).then(r => r.json()).then(lezioni => lezioni.map((lezione: any) => {
                return {
                    ...lezione,
                    orarioDiInizio: new Date(lezione.orarioDiInizio),
                    orarioDiFine: new Date(lezione.orarioDiFine),
                }
            }));
        });

    return <>
        <Layout requiresAuth loading={!lezioni}>
            <Container fluid className={styles.container}>
                <main className={styles.main}>
                    {(lezioniDaRecuperare?.length ?? 0) > 0 && (
                        <Row className="align-items-center">
                            <div className="alert alert-danger" role="alert">
                                Hai lezioni da recuperare!
                            </div>
                        </Row>
                    )}
                    <Row className="gap-3 mb-3 w-100">
                        <Col xs="12" md="auto">
                            <Form.Control type="date"
                                          value={currentDate?.toLocaleDateString(
                                              'en-CA',
                                              {year: "numeric", month: "2-digit", day: "2-digit"},
                                          )}
                                          className="w-100"
                                          onChange={(e) => {
                                              setCurrentDate(new Date(e.currentTarget.value));
                                          }} />
                        </Col>
                        <Col xs="12" md="auto" className="ms-auto">
                            <Button className="w-100"
                                    disabled= {(lezioniDaRecuperare?.length ?? 0) <= 0}
                                    onClick={() => setShowRecuperiModal(true)}
                            >
                                Recupera
                            </Button>
                        </Col>
                    </Row>
                    <LezioniTable scrollable content={lezioni ?? []} onEditLezione={async (editedLezioneFields) => {
                        const res = await fetch('/api/lezioni', {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(editedLezioneFields)
                        });

                        if(res.ok) {
                            await mutateLezioni();
                            await mutateLezioniDaGiustificare();
                            return {success: true, errMsg: ''};
                        }

                        if(res.status === 404)
                            return { success: false, errMsg: "Impossibile trovare la lezione" };

                        if(res.status === 400) {
                            const { err } = await res.json();
                            if(isOverlapError(err)) {
                                return {
                                    success: false,
                                    errMsg: "Ci sono " + err.count + " sovrapposizioni",
                                };
                            }

                            return { success: false, errMsg: "Parametri non validi" };
                        }

                        return { success: false, errMsg: "Errore non previsto" };
                    }} />
                </main>
            </Container>
        </Layout>

        <RecuperaLezioneModal show={showRecuperiModal}
                              handleClose={() => setShowRecuperiModal(false)}
                              lezioniDaRecuperare={lezioniDaRecuperare ?? []}
                              handleSubmit={async (lezioneGiustificata) => {
                                  const requestBody: LezioniDaGiustificareApi.Post.Request = lezioneGiustificata;
                                  const res = await fetch('/api/lezioni-da-giustificare', {
                                      method: 'POST',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify(requestBody)
                                  });

                                  if(res.ok) {
                                      await mutateLezioni();
                                      await mutateLezioniDaGiustificare();
                                      return {success: true, errMsg: ''};
                                  }

                                  if(res.status === 400) {
                                      const { err } = (await res.json()) as LezioniDaGiustificareApi.Post.Response;
                                      if(isOverlapError(err))
                                          return {
                                              success: false,
                                              errMsg: "Ci sono " +  err.count + " sovrapposizioni",
                                          };
                                      return { success: false, errMsg: "Parametri non validi" };
                                  }

                                  return { success: false, errMsg: "Errore non previsto" };
                              }} />
    </>;
}

export default Home
