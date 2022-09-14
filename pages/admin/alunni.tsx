import requireAuth from "../../lib/auth";
import {NextPage} from "next";
import React, {useState} from "react";
import Layout from "../../components/Layout"
import {Button, Col, Container, Row} from "react-bootstrap"
import AlunniTable, {Alunno} from "../../components/AlunniTable";
import styles from "../../styles/Home.module.css";
import {prisma} from "../../lib/database"

type Props = {
    alunni: Alunno[],
};

export const getServerSideProps = requireAuth<Props>(async (ctx) => {
    return {
        props: {
            alunni: (await prisma.alunno.findMany({})).map(alunno => { return {
                id: alunno.id,
                nome: alunno.nome,
                cognome: alunno.cognome,
                email: alunno.email,
                cf: alunno.cf,
            }})
        }
    }
}, true)

const Home: NextPage<Props> = (props) => {
    const [showAddModal, setShowAddModal] = useState(false);

    return <>
        <Layout requiresAuth>
            <Container fluid className={styles.container}>
                <main className={styles.main}>
                    <Row className="mb-3 w-100 align-items-start overflow-auto flex-grow-1 flex-shrink-1">
                        <AlunniTable content={props.alunni}/>
                    </Row>

                    <Row className="mb-3 w-100 justify-content-center flex-grow-0 flex-shrink-1">
                        <Col className="col-md-auto col-12 mb-3">
                            <Button className="w-100" onClick={() => setShowAddModal(true) }>Aggiungi</Button>
                        </Col>
                    </Row>
                </main>
            </Container>
        </Layout>
    </>;
}

export default Home
