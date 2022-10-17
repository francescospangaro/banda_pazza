import requireAuth from "@/lib/auth";
import { NextPage } from "next";
import React, { useState } from "react";
import Layout from "@/components/Layout";
import { Button, Col, Container, Row } from "react-bootstrap";
import { Docente } from "@/types/api/admin/docente";
import DocentiTable from "@/components/DocentiTable";
import DocenteModal, { AddProps, EditProps } from "@/components/DocenteModal";
import styles from "@/styles/Home.module.css";
import { prisma } from "@/lib/database";
import { zodFetch } from "@/lib/fetch";
import * as DocenteApi from "@/types/api/admin/docente";
import * as PaymentsApi from "@/types/api/admin/payments";

type Props = {
  docenti: (Docente)[];
};


const Home: NextPage<Props> = (props) => {
  const [docenti, setDocenti] = useState(props.docenti);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingDocente, setEditingDocente] = useState<Docente | null>(null);

  return (
    <>
      <Layout requiresAuth>
        <Container fluid className={styles.container}>
          <main className={styles.main}>
            <Row className="w-100 flex-grow-0 flex-shrink-1">
              <Col className="col-md-auto col-12 mb-3">
                <Button className="w-100" onClick={() => setShowAddModal(true)}>
                  Aggiungi
                </Button>
              </Col>
            </Row>

            <DocentiTable
              scrollable
              content={docenti}
              onEdit={async (docente) => {
                setEditingDocente(docente);
                setShowEditModal(true);
              }}
            />
          </main>
        </Container>
      </Layout>

      <DocenteModal<AddProps>
        show={showAddModal}
        handleClose={() => setShowAddModal(false)}
        handleSubmit={async (docente) => {
          const { res, parser } = await zodFetch("/api/admin/docente", {
            method: "POST",
            body: {
              value: docente,
              validator: DocenteApi.Post.RequestValidator,
            },
            responseValidator: DocenteApi.Post.ResponseValidator,
          });

          if (res.ok) {
            const docente = await parser();
            setDocenti((docenti) => [...docenti, { ...docente, hoursDone: 0, euros: 0, eurosPaid: 0}]);
            return { success: true, errMsg: "" };
          }

          if (res.status === 400)
            return { success: false, errMsg: "Parametri non validi" };
          return { success: false, errMsg: "Errore non previsto" };
        }}
      />
      <DocenteModal<EditProps>
        show={showEditModal}
        docente={editingDocente!}
        handleClose={() => {
          setShowEditModal(false);
          setEditingDocente(null);
        }}
        handleSubmit={async (editedDocenteFields) => {
          const { res, parser } = await zodFetch("/api/admin/docente", {
            method: "PUT",
            body: {
              value: editedDocenteFields,
              validator: DocenteApi.Put.RequestValidator,
            },
            responseValidator: DocenteApi.Put.ResponseValidator,
          });

          if (res.ok) {
            const docente = await parser();
            setDocenti((docenti) => {
              const newArr = [...docenti];
              const prevDocenteIdx = newArr.findIndex(
                (d) => d.id === docente.id
              );
              const prevDocente = docenti[prevDocenteIdx];
              newArr[prevDocenteIdx] = {
                ...docente,
              };
              return newArr;
            });
            return { success: true, errMsg: "" };
          }

          if (res.status === 404)
            return { success: false, errMsg: "Impossibile trovare il docente" };
          if (res.status === 400)
            return { success: false, errMsg: "Parametri non validi" };
          return { success: false, errMsg: "Errore non previsto" };
        }}
      />
    </>
  );
};

export default Home;
