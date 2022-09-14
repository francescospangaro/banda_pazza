import requireAuth from "../../lib/auth";
import {NextPage} from "next";
import React, {useState} from "react";
import Layout from "../../components/Layout"
import {Button, Col, Container, Row} from "react-bootstrap"
import DocentiTable, {Docente} from "../../components/DocentiTable";
import styles from "../../styles/Home.module.css";
import {prisma} from "../../lib/database"
import useMediaQuery from "@restart/hooks/useMediaQuery";

type Props = {
    docenti: Docente[],
};

export const getServerSideProps = requireAuth<Props>(async (ctx) => {
    return {
        props: {
            docenti: (await prisma.docente.findMany({})).map(docente => { return {
                id: docente.id,
                nome: docente.nome,
                cognome: docente.cognome,
                email: docente.email,
                cf: docente.cf,
            }})
        }
    }
}, true)

const Home: NextPage<Props> = (props) => {
    const [showAddModal, setShowAddModal] = useState(false);

    const isDesktop = useMediaQuery("(min-width: 992px)")
    return <>
        <Layout requiresAuth>
            <Container fluid className={styles.container}>
                <main className={styles.main}>
                    <Row
                        className={"mb-3 align-items-start flex-grow-1 flex-shrink-1" + (isDesktop ? ' overflow-auto' : '')}
                        style={{ width: "fit-content"}}
                    >
                        <DocentiTable content={props.docenti}/>
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
