import requireAuth from "../../lib/auth";
import {NextPage} from "next";
import React, {useState} from "react";
import Layout from "../../components/Layout"
import {Button, Col, Container, Row} from "react-bootstrap"
import {Alunno} from "../api/admin/alunno";
import {Docente} from "../api/admin/docente";
import AlunniTable from "../../components/AlunniTable";
import AlunnoModal, {AddProps, EditProps} from "../../components/AlunnoModal";
import styles from "../../styles/Home.module.css";
import {prisma} from "../../lib/database"
import useMediaQuery from "@restart/hooks/useMediaQuery";

type Props = {
    docenti: Docente[],
    alunni: Alunno[],
};

export const getServerSideProps = requireAuth<Props>(async (ctx) => {
    return {
        props: {
            docenti: await prisma.docente.findMany({}),
            alunni: (await prisma.alunno.findMany({})).map(alunno => { return {
                id: alunno.id,
                nome: alunno.nome,
                cognome: alunno.cognome,
                email: alunno.email,
                cf: alunno.cf,
                docenteId: alunno.docenteId,
            }}),
        }
    }
}, true)

const Home: NextPage<Props> = (props) => {
    const [alunni, setAlunni] = useState(props.alunni);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingAlunno, setEditingAlunno] = useState<Alunno | null>(null);

    const isDesktop = useMediaQuery("(min-width: 992px)")
    return <>
        <Layout requiresAuth>
            <Container fluid className={styles.container}>
                <main className={styles.main}>
                    <Row
                        className={"mb-3 align-items-start flex-grow-1 flex-shrink-1" + (isDesktop ? ' overflow-auto' : '')}
                        style={{ width: "100%", minWidth: "fit-content" }}
                    >
                        <AlunniTable content={alunni} docenti={props.docenti} onEdit={async alunno => {
                            setEditingAlunno(alunno);
                            setShowEditModal(true);
                        }}/>
                    </Row>

                    <Row className="w-100 justify-content-center flex-grow-0 flex-shrink-1">
                        <Col className="col-md-auto col-12 mb-3">
                            <Button className="w-100" onClick={() => setShowAddModal(true) }>Aggiungi</Button>
                        </Col>
                    </Row>
                </main>
            </Container>
        </Layout>

        <AlunnoModal<AddProps> show={showAddModal}
                               docenti={props.docenti}
                               handleClose={() => setShowAddModal(false)}
                               handleSubmit={async (alunno) => {
                                   const res = await fetch('/api/admin/alunno', {
                                       method: 'POST',
                                       headers: { 'Content-Type': 'application/json' },
                                       body: JSON.stringify(alunno)
                                   });

                                   if(res.ok) {
                                       const alunno = await res.json();
                                       setAlunni(alunni => [...alunni, {
                                           id: Number(alunno.id),
                                           ...alunno,
                                       }]);
                                       return {success: true, errMsg: ''};
                                   }

                                   if(res.status === 400)
                                       return { success: false, errMsg: "Parametri non validi" };
                                   return { success: false, errMsg: "Errore non previsto" };
                               }} />
        <AlunnoModal<EditProps> show={showEditModal}
                                docenti={props.docenti}
                                alunno={editingAlunno!}
                                handleClose={() => {
                                    setShowEditModal(false);
                                    setEditingAlunno(null);
                                }}
                                handleSubmit={async (editedAlunnoFields) => {
                                    const res = await fetch('/api/admin/alunno', {
                                        method: 'PUT',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify(editedAlunnoFields)
                                    });

                                    if(res.ok) {
                                        const alunno = await res.json();
                                        setAlunni(alunni => {
                                            const newArr = [ ...alunni ];
                                            newArr[newArr.findIndex(a => a.id === alunno.id)] = alunno;
                                            return newArr;
                                        });
                                        return {success: true, errMsg: ''};
                                    }

                                    if(res.status === 404)
                                        return { success: false, errMsg: "Impossibile trovare l'alunno" };
                                    if(res.status === 400)
                                        return { success: false, errMsg: "Parametri non validi" };
                                    return { success: false, errMsg: "Errore non previsto" };
                                }} />
    </>;
}

export default Home
