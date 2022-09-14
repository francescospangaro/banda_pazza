import type {NextPage} from 'next'
import styles from '../../styles/Home.module.css'

import { prisma } from '../../lib/database'
import React, {useState} from "react";
import Layout from "../../components/Layout"
import LezioniAdvancedTable from "../../components/LezioniAdvancedTable";

import requireAuth from "../../lib/auth"
import useSWR from "swr";
import {Lezione} from "../api/admin/lezioni";
import {Libretto} from ".prisma/client"
import {Container, Col, Row, Form, Button} from "react-bootstrap"
import AddLezioniModal from "../../components/AddLezioniModal";
import DeleteLezioniModal from "../../components/DeleteLezioniModal";
import useMediaQuery from "@restart/hooks/useMediaQuery";

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

export const getServerSideProps = requireAuth<Props>(async (ctx) => {
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
    const [filter, setFilter] = useState({
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
    const [showAddModal, setShowAddModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const {data: lezioni, mutate: mutateLezioni, isValidating} = useSWR<Lezione[]>(
        ['/api/admin/lezioni', filter],
        (url: string) => {
            return fetch("/api/admin/lezioni", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(filter)
            }).then(r => r.json()).then(lezioni => lezioni.map((lezione: any) => {
                return {
                    ...lezione,
                    orarioDiInizio: new Date(lezione.orarioDiInizio),
                    orarioDiFine: new Date(lezione.orarioDiFine),
                }
            }));
        });

    const isDesktop = useMediaQuery("(min-width: 992px)")
    return <>
        <Layout requiresAuth loading={isValidating}>
            <Container fluid className={styles.container}>
                <main className={styles.main}>
                    <Row className="mb-3 w-100 align-items-center">
                        <Form className="row g-3 justify-content-center flex-grow-0 flex-shrink-1" onSubmit={(e) => {
                            e.preventDefault()
                            setFilter({
                                docente: {
                                    nome: e.currentTarget.nomeDocente.value,
                                    cognome: e.currentTarget.cognomeDocente.value,
                                },
                                alunno: {
                                    nome: e.currentTarget.nomeAlunno.value,
                                    cognome: e.currentTarget.cognomeAlunno.value,
                                },
                                startDate: e.currentTarget.startDate.value ? new Date(e.currentTarget.startDate.value) : null,
                                endDate: e.currentTarget.startDate.value ? new Date(e.currentTarget.endDate.value) : null,
                            })
                        }}>
                            <Col className="col-md-2 col-12">
                                <Form.Label>Data inizio</Form.Label>
                                <Form.Control className="w-100" type="date" name="startDate" defaultValue={filter.startDate?.toLocaleDateString(
                                    'en-CA',
                                    {year: "numeric", month: "2-digit", day: "2-digit"},
                                )} size="sm" />
                            </Col>

                            <Col className="col-md-2 col-12">
                                <Form.Label>Data fine</Form.Label>
                                <Form.Control className="w-100" type="date" name="endDate" defaultValue={filter.endDate?.toLocaleDateString(
                                    'en-CA',
                                    {year: "numeric", month: "2-digit", day: "2-digit"},
                                )} size="sm" />
                            </Col>

                            <Col className="col-md-2 col-12">
                                <Form.Label>Nome Docente</Form.Label>
                                <Form.Control type="text" className="w-100" name="nomeDocente" defaultValue={filter.docente.nome} size="sm" />
                            </Col>

                            <Col className="col-md-2 col-12">
                                <Form.Label>Cognome Docente</Form.Label>
                                <Form.Control type="text" className="w-100" name="cognomeDocente" defaultValue={filter.docente.cognome} size="sm" />
                            </Col>

                            <Col className="col-md-2 col-12">
                                <Form.Label>Nome Alunno</Form.Label>
                                <Form.Control type="text" className="w-100" name="nomeAlunno" defaultValue={filter.alunno.nome} size="sm" />
                            </Col>

                            <Col className="col-md-2 col-12">
                                <Form.Label>Cognome Alunno</Form.Label>
                                <Form.Control type="text" className="w-100" name="cognomeAlunno" defaultValue={filter.alunno.cognome} size="sm" />
                            </Col>

                            <Col className="col-md-2 col-12">
                                <Button className="w-100" type="submit" size="sm">Filtra</Button>
                            </Col>
                        </Form>
                    </Row>

                    <Row
                        className={"mb-3 align-items-start flex-grow-1 flex-shrink-1" + (isDesktop ? ' overflow-auto' : '')}
                        style={{ width: "fit-content"}}
                    >
                        <LezioniAdvancedTable content={lezioni?.map(lezione => {
                            return {
                                id: lezione.id,
                                docente: lezione.docente.nome + ' ' + lezione.docente.cognome,
                                docenteId: lezione.docente.id,
                                alunno: lezione.alunno.nome + ' ' + lezione.alunno.cognome,
                                alunnoId: lezione.alunno.id,
                                orarioDiInizio: lezione.orarioDiInizio,
                                orarioDiFine: lezione.orarioDiFine,
                                risultato: Libretto.PRESENTE,
                                note: '',
                                selectable: true,
                                selected: selectedLezioni.has(lezione.id),
                            }
                        }) ?? []} onSelectLezione={(lezione, selected) => {
                            setSelectedLezioni(lezioni => {
                                const newLezioni = new Set(lezioni);
                                if(selected)
                                    newLezioni.add(lezione.id);
                                else
                                    newLezioni.delete(lezione.id);
                                return newLezioni;
                            })
                        }} />
                    </Row>

                    <Row className="mb-3 w-100 justify-content-center flex-grow-0 flex-shrink-1">
                        <Col className="col-md-auto col-12 mb-3">
                            <Button className="w-100" onClick={() => setShowAddModal(true) }>Aggiungi</Button>
                        </Col>

                        <Col className="col-md-auto col-12 mb-3">
                            <Button className="w-100" onClick={() => setShowDeleteModal(true) }>Elimina</Button>
                        </Col>
                    </Row>
                </main>
            </Container>
        </Layout>

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
                                 mutateLezioni();
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
                                 mutateLezioni();
                                 return {success: true, errMsg: ''};
                             }

                             if(res.status === 400)
                                 return { success: false, errMsg: "Parametri non validi" };
                             return { success: false, errMsg: "Errore non previsto" };
                         }} />
    </>;
}

export default Home
