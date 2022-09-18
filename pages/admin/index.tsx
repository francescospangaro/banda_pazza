import type {NextPage} from 'next'
import styles from '../../styles/Home.module.css'

import { prisma } from '../../lib/database'
import React, {useState} from "react";
import Layout from "../../components/Layout"
import LezioniAdvancedTable from "../../components/LezioniAdvancedTable";

import requireAuth from "../../lib/auth"
import useSWR from "swr";
import {Lezione} from "../api/admin/lezioni";
import {Container, Col, Row, Form, Button} from "react-bootstrap"
import AddLezioniModal from "../../components/AddLezioniModal";
import DeleteLezioniModal from "../../components/DeleteLezioniModal";
import FilterModal, {Filter} from "../../components/FilterModal";

type Props = {
    docenti: {
        id: number,
        fullName: string,
    }[],
    alunni: {
        id: number,
        fullName: string,
    }[],
}

export const getServerSideProps = requireAuth<Props>(async () => {
    return {
        props: {
            docenti: (await prisma.docente.findMany({})).map(d => { return {
                id: d.id,
                fullName: d.nome + ' ' + d.cognome,
            }}),
            alunni: (await prisma.alunno.findMany({})).map(d => { return {
                id: d.id,
                fullName: d.nome + ' ' + d.cognome,
            }}),
        }
    }
}, true)

const Home: NextPage<Props> = (props) => {
    const [selectedLezioni, setSelectedLezioni] = useState(new Set<number>());
    const [filter, setFilter] = useState<Filter>({
        docente: {
            nome: '',
            cognome: '',
        },
        alunno: {
            nome: '',
            cognome: '',
        },
        startDate: new Date() as (Date | undefined | null),
        endDate: undefined as (Date | undefined | null),
    });
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const {data: lezioni, mutate: mutateLezioni, isValidating} = useSWR<Lezione[]>(
        ['/api/admin/lezioni', filter],
        () => {
            return fetch("/api/admin/lezioni", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(filter)
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

    return <>
        <Layout requiresAuth loading={isValidating}>
            <Container fluid className={styles.container}>
                <main className={styles.main}>
                    <Row className="mb-3 w-100 align-items-center">
                        <Form className="row g-3 gy-md-1 justify-content-center flex-grow-0 flex-shrink-1" onSubmit={(e) => {
                            e.preventDefault()
                        }}>
                        </Form>
                    </Row>

                    <Row className="mb-3 w-100 flex-grow-0 flex-shrink-1">
                        <Col className="col-md-auto col-12 mb-3">
                            <Button className="w-100" onClick={() => setShowAddModal(true)}>Aggiungi</Button>
                        </Col>
                        <Col className="col-md-auto col-12 mb-3">
                            <Button className="w-100" variant="danger" onClick={() => setShowDeleteModal(true)}>Elimina</Button>
                        </Col>
                        <Col xs="12" md="auto" className="ms-auto">
                            <Button className="w-100" variant="secondary" onClick={() => setShowFilterModal(true)}>Filtra</Button>
                        </Col>
                    </Row>

                    <LezioniAdvancedTable scrollable
                                          content={lezioni?.map(lezione => { return {
                                              ...lezione,
                                              selectable: true,
                                              selected: selectedLezioni.has(lezione.id),
                                          }}) ?? []}
                                          onSelectLezione={(lezione, selected) => {
                                              setSelectedLezioni(lezioni => {
                                                  const newLezioni = new Set(lezioni);
                                                  if(selected)
                                                      newLezioni.add(lezione.id);
                                                  else
                                                      newLezioni.delete(lezione.id);
                                                  return newLezioni;
                                              })
                                          }}
                                          onEditLezione={async (editedLezioneFields) => {
                                              const res = await fetch('/api/lezioni', {
                                                  method: 'PUT',
                                                  headers: { 'Content-Type': 'application/json' },
                                                  body: JSON.stringify(editedLezioneFields)
                                              });

                                              if(res.ok) {
                                                  await mutateLezioni();
                                                  return {success: true, errMsg: ''};
                                              }

                                              if(res.status === 404)
                                                  return { success: false, errMsg: "Impossibile trovare la lezione" };
                                              if(res.status === 400)
                                                  return { success: false, errMsg: "Parametri non validi" };
                                              return { success: false, errMsg: "Errore non previsto" };
                                          }} />
                </main>
            </Container>
        </Layout>

        <FilterModal filter={filter}
                     show={showFilterModal}
                     handleClose={() => setShowFilterModal(false)}
                     handleSubmit={filter => {setFilter(filter)}} />
        <AddLezioniModal docenti={props.docenti}
                         alunni={props.alunni}
                         show={showAddModal}
                         handleClose={ () => setShowAddModal(false) }
                         handleSubmit={ async lezioni => {
                             const res = await fetch('/api/admin/lezione', {
                                 method: 'POST',
                                 headers: { 'Content-Type': 'application/json' },
                                 body: JSON.stringify(lezioni)
                             });

                             if(res.ok) {
                                 await mutateLezioni();
                                 return {success: true, errMsg: ''};
                             }

                             if(res.status === 400) {
                                 const { err } = await res.json();
                                 if(err?.type === 'overlap')
                                     return {
                                         success: false,
                                         errMsg: "Ci sono " +  err?.count + " sovrapposizioni",
                                     };

                                 return { success: false, errMsg: "Parametri non validi" };
                             }

                             return { success: false, errMsg: "Errore non previsto" };
                         }} />
        <DeleteLezioniModal show={showDeleteModal}
                         handleClose={ () => setShowDeleteModal(false) }
                         handleSubmit={ async () => {
                             const res = await fetch('/api/admin/lezione', {
                                 method: 'DELETE',
                                 headers: { 'Content-Type': 'application/json' },
                                 body: JSON.stringify(Array.from(selectedLezioni.keys()))
                             });

                             if(res.ok) {
                                 await mutateLezioni();
                                 return {success: true, errMsg: ''};
                             }

                             if(res.status === 400)
                                 return { success: false, errMsg: "Parametri non validi" };
                             return { success: false, errMsg: "Errore non previsto" };
                         }} />
    </>;
}

export default Home
