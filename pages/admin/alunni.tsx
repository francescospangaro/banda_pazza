import requireAuth from "@/lib/auth";
import {NextPage} from "next";
import React, {useState} from "react";
import Layout from "@/components/Layout"
import {Button, Col, Container, Row} from "react-bootstrap"
import {Alunno} from "@/types/api/admin/alunno";
import {zodFetch} from "@/lib/fetch";
import * as AlunnoApi from "@/types/api/admin/alunno";
import {Docente} from "@/types/api/admin/docente";
import AlunniTable from "@/components/AlunniTable";
import AlunnoModal, {AddProps, EditProps} from "@/components/AlunnoModal";
import styles from "@/styles/Home.module.css";
import {prisma} from "@/lib/database"

type Props = {
    docenti: Docente[],
    alunni: Alunno[],
};

export const getServerSideProps = requireAuth<Props>(async () => {
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

    return <>
        <Layout requiresAuth>
            <Container fluid className={styles.container}>
                <main className={styles.main}>
                    <Row className="w-100 flex-grow-0 flex-shrink-1">
                        <Col className="col-md-auto col-12 mb-3">
                            <Button className="w-100" onClick={() => setShowAddModal(true) }>Aggiungi</Button>
                        </Col>
                    </Row>

                    <AlunniTable scrollable content={alunni} docenti={props.docenti} onEdit={async alunno => {
                        setEditingAlunno(alunno);
                        setShowEditModal(true);
                    }}/>
                </main>
            </Container>
        </Layout>

        <AlunnoModal<AddProps> show={showAddModal}
                               docenti={props.docenti}
                               handleClose={() => setShowAddModal(false)}
                               handleSubmit={async (alunno) => {
                                   const {res, parser} = await zodFetch('/api/admin/alunno', {
                                       method: 'POST',
                                       body: {
                                           value: alunno,
                                           validator: AlunnoApi.Post.RequestValidator,
                                       },
                                       responseValidator: AlunnoApi.Post.ResponseValidator,
                                   });

                                   if(res.ok) {
                                       const alunno = await parser();
                                       setAlunni(alunni => [...alunni, alunno]);
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
                                    const {res, parser} = await zodFetch('/api/admin/alunno', {
                                        method: 'PUT',
                                        body: {
                                            value: editedAlunnoFields,
                                            validator: AlunnoApi.Put.RequestValidator,
                                        },
                                        responseValidator: AlunnoApi.Put.ResponseValidator,
                                    });

                                    if(res.ok) {
                                        const alunno = await parser();
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
