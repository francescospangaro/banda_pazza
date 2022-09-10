import type {NextPage} from 'next'
import styles from '../styles/Home.module.css'
import {User} from "./api/user";

import React, {useState} from "react";
import Layout from "../components/Layout"
import LezioniTable from "../components/LezioniTable";
import DatePicker from "react-datepicker";
import Image from 'next/image';

import requireAuth from "../lib/auth"
import useSWR from "swr";
import {Lezione} from "./api/lezioni";
import {Libretto} from ".prisma/client"
import {Container, Col, Row, Button} from "react-bootstrap"

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

const Home: NextPage<Props> = (props) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const {data: lezioni} = useSWR<Lezione[]>(
        '/api/lezioni/' + currentDate.toLocaleDateString(
            'en-US',
            {year: "numeric", month: "numeric", day: "numeric"},
        ), (url: string) => {
            return fetch("/api/lezioni", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    from: (() => {
                        const startOfDay = new Date(currentDate);
                        startOfDay.setHours(0, 0, 0, 0);
                        console.log(startOfDay);
                        return startOfDay;
                    })(),
                    to: (() => {
                        const endOfDay = new Date(currentDate);
                        endOfDay.setHours(23, 59, 59, 9999);
                        console.log(endOfDay);
                        return endOfDay;
                    })(),
                })
            }).then(r => r.json()).then(lezioni => lezioni.map((lezione: any) => {
                return {
                    ...lezione,
                    orario: new Date(lezione.orario),
                }
            }));
        });

    return (
        <Layout>
            <Container fluid className={styles.container}>
                <main className={styles.main}>
                    <Row className="gap-3 mb-3 align-items-center">
                        <Col xs="12" md="auto">
                            <DatePicker className="w-100" selected={currentDate} onChange={(target: Date) => {setCurrentDate(target)}} />
                        </Col>
                        <Col xs="12" md="auto">
                            <Button variant="secondary" size="sm" className="w-100">Aggiungi</Button>
                        </Col>
                    </Row>
                    <LezioniTable content={lezioni?.map(lezione => {
                        return {
                            nome: lezione.alunno.nome,
                            cognome: lezione.alunno.cognome,
                            orario: lezione.orario,
                            risultato: Libretto.PRESENTE,
                            note: '',
                        }
                    }) ?? []} />
                </main>

                <footer className={styles.footer}>
                    <a
                        href="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Corpo Musicale M. G. Nava – musica per passione dal 1920
                        <span className={styles.logo}>
                        <Image src="/logo.svg" alt="Logo" width={16} height={16} />
                        </span>
                    </a>
                </footer>
            </Container>
        </Layout>
    );
}

export default Home
