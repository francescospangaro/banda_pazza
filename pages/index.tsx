import type {GetServerSidePropsResult, NextPage} from 'next'
import styles from '@/styles/Home.module.css'
import {User} from "@/types/api/user";

import React, {useMemo, useState} from "react";
import Layout from "@/components/Layout"
import LezioniTable from "@/components/LezioniTable";

import requireAuth from "@/lib/auth"
import useSWR from "swr";
import {Lezione} from "@/types/api/lezioni";
import {Container, Col, Row, Form, Button} from "react-bootstrap"
import RecuperaLezioneModal from "@/components/RecuperaLezioniModal";
import {zodFetch} from "@/lib/fetch";
import * as LezioniApi from "@/types/api/lezioni"
import * as LezioniDaGiustificareApi from "@/types/api/lezioni-da-giustificare"
//import * as LezioniDaCompilareApi from "@/types/api/lezioni-da-compilare"
import {isOverlapError} from "@/types/api/admin/lezione";

type Props = {
    docente: User;
}

export const getServerSideProps = requireAuth<Props>(async (ctx): Promise<GetServerSidePropsResult<Props>> => {
    const docente = ctx.req.session.user!;
    if (docente?.admin)
        return {
            redirect: {
                permanent: true,
                destination: "/admin/"
            }
        };

    return {
        props: {
            docente: ctx.req.session.user!
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
        ), async () => {
            const {parser} = await zodFetch("/api/lezioni", {
                method: 'POST',
                body: {
                    value: {
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
                    },
                    validator: LezioniApi.Post.RequestValidator,
                },
                responseValidator: LezioniApi.Post.ResponseValidator,
            });
            const lezioni: Lezione[] = await parser();
            return lezioni;
        });
    const {data: lezioniDaRecuperare, mutate: mutateLezioniDaGiustificare} = useSWR<Lezione[]>(
        '/api/lezioni-da-giustificare',
        async (url: string) => {
            const {parser} = await zodFetch(url, {
                method: 'GET',
                headers: {'Content-Type': 'application/json'},
                responseValidator: LezioniDaGiustificareApi.Get.ResponseValidator,
            });
            return await parser();
        });
    const {data: finireLaCompilazione, mutate: mutateFinireLaCompilazione} = useSWR<Lezione[]>(
        '/api/lezioni-da-compilare',
        async (url: string) => {
            const {parser} = await zodFetch(url, {
                method: 'GET',
                headers: {'Content-Type': 'application/json'},
                responseValidator: LezioniDaGiustificareApi.Get.ResponseValidator,
            });
            return await parser();
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

                    {(finireLaCompilazione?.length ?? 0) > 0 && (
                        <Row className="align-items-center">
                            <div className="alert alert-warning" role="alert">
                                Devi finire di compilare il registro!
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
                                          }}/>
                        </Col>
                        <Col xs="12" md="auto" className="ms-auto">
                            <Button className="w-100"
                                    disabled={(lezioniDaRecuperare?.length ?? 0) <= 0}
                                    onClick={() => setShowRecuperiModal(true)}
                            >
                                Recupera
                            </Button>
                        </Col>
                    </Row>
                    <LezioniTable scrollable content={useMemo(() => lezioni ?? [], [lezioni])}
                                  onEditLezione={async (editedLezioneFields) => {
                                      const {res} = await zodFetch('/api/lezioni', {
                                          method: 'PUT',
                                          body: {
                                              value: editedLezioneFields,
                                              validator: LezioniApi.Put.RequestValidator,
                                          },
                                          responseValidator: LezioniApi.Put.ResponseValidator,
                                      });

                                      if (res.ok) {
                                          await mutateLezioni();
                                          await mutateLezioniDaGiustificare();
                                          await mutateFinireLaCompilazione();
                                          return {success: true, errMsg: ''};
                                      }

                                      if (res.status === 404)
                                          return {success: false, errMsg: "Impossibile trovare la lezione"};
                                      if (res.status === 400)
                                          return {success: false, errMsg: "Parametri non validi"};
                                      return {success: false, errMsg: "Errore non previsto"};
                                  }}/>
                </main>
            </Container>
        </Layout>

        <RecuperaLezioneModal show={showRecuperiModal}
                              handleClose={() => setShowRecuperiModal(false)}
                              lezioniDaRecuperare={lezioniDaRecuperare ?? []}
                              handleSubmit={async (lezioneGiustificata) => {
                                  const {res, parser} = await zodFetch('/api/lezioni-da-giustificare', {
                                      method: 'POST',
                                      body: {
                                          value: lezioneGiustificata,
                                          validator: LezioniDaGiustificareApi.Post.RequestValidator,
                                      },
                                      responseValidator: LezioniDaGiustificareApi.Post.ResponseValidator,
                                  });

                                  if (res.ok) {
                                      await mutateLezioni();
                                      await mutateLezioniDaGiustificare();
                                      return {success: true, errMsg: ''};
                                  }

                                  if (res.status === 400) {
                                      const {err} = await parser();
                                      if (isOverlapError(err))
                                          return {
                                              success: false,
                                              errMsg: "Ci sono " + err.count + " sovrapposizioni",
                                          };
                                      return {success: false, errMsg: "Parametri non validi"};
                                  }

                                  return {success: false, errMsg: "Errore non previsto"};
                              }}/>
    </>;
}

export default Home
