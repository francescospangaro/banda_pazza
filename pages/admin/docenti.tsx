import requireAuth from "../../lib/auth";
import {NextPage} from "next";
import React, {useState} from "react";
import Layout from "../../components/Layout"
import {Button, Col, Container, Row} from "react-bootstrap"
import {Docente} from "../api/admin/docente";
import DocentiTable from "../../components/DocentiTable";
import DocenteModal, {AddProps, EditProps} from "../../components/DocenteModal";
import styles from "../../styles/Home.module.css";
import {prisma} from "../../lib/database"

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
    const [docenti, setDocenti] = useState(props.docenti);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingDocente, setEditingDocente] = useState<Docente | null>(null);

    return <>
        <Layout requiresAuth>
            <Container fluid className={styles.container}>
                <main className={styles.main}>
                    <DocentiTable scrollable content={docenti} onEdit={async docente => {
                        setEditingDocente(docente);
                        setShowEditModal(true);
                    }}/>

                    <Row className="w-100 justify-content-center flex-grow-0 flex-shrink-1">
                        <Col className="col-md-auto col-12 mb-3">
                            <Button className="w-100" onClick={() => setShowAddModal(true) }>Aggiungi</Button>
                        </Col>
                    </Row>
                </main>
            </Container>
        </Layout>

        <DocenteModal<AddProps> show={showAddModal}
                                handleClose={() => setShowAddModal(false)}
                                handleSubmit={async (docente) => {
                                    const res = await fetch('/api/admin/docente', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify(docente)
                                    });

                                    if(res.ok) {
                                        const docente = await res.json();
                                        setDocenti(docenti => [...docenti, {
                                            id: Number(docente.id),
                                            ...docente,
                                        }]);
                                        return {success: true, errMsg: ''};
                                    }

                                    if(res.status === 400)
                                        return { success: false, errMsg: "Parametri non validi" };
                                    return { success: false, errMsg: "Errore non previsto" };
                                }} />
        <DocenteModal<EditProps> show={showEditModal}
                                 docente={editingDocente!}
                                 handleClose={() => {
                                     setShowEditModal(false);
                                     setEditingDocente(null);
                                 }}
                                 handleSubmit={async (editedDocenteFields) => {
                                     const res = await fetch('/api/admin/docente', {
                                         method: 'PUT',
                                         headers: { 'Content-Type': 'application/json' },
                                         body: JSON.stringify(editedDocenteFields)
                                     });

                                     if(res.ok) {
                                         const docente = await res.json();
                                         setDocenti(docenti => {
                                             const newArr = [ ...docenti ];
                                             newArr[newArr.findIndex(d => d.id === docente.id)] = docente;
                                             return newArr;
                                         });
                                         return {success: true, errMsg: ''};
                                     }

                                     if(res.status === 404)
                                         return { success: false, errMsg: "Impossibile trovare il docente" };
                                     if(res.status === 400)
                                         return { success: false, errMsg: "Parametri non validi" };
                                     return { success: false, errMsg: "Errore non previsto" };
                                 }} />
    </>;
}

export default Home
