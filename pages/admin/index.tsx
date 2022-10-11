import type { NextPage } from "next";
import styles from "@/styles/Home.module.css";

import { prisma } from "@/lib/database";
import React, { useMemo, useState } from "react";
import Layout from "@/components/Layout";
import LezioniAdvancedTable from "@/components/LezioniAdvancedTable";

import requireAuth from "@/lib/auth";
import useSWR from "swr";
import { Container, Col, Row, Form, Button } from "react-bootstrap";
import AddLezioniModal from "@/components/AddLezioniModal";
import DeleteLezioniModal from "@/components/DeleteLezioniModal";
import FilterModal from "@/components/FilterModal";
import { LezioneFilter } from "@/types/api/admin/lezioni";
import { isOverlapError } from "@/types/api/admin/lezione";
import { z } from "zod";
import { zodFetch } from "@/lib/fetch";
import * as LezioniApi from "@/types/api/lezioni";
import * as LezioniAdminApi from "@/types/api/admin/lezioni";
import * as LezioneApi from "@/types/api/admin/lezione";

type Props = {
  docenti: {
    id: number;
    fullName: string;
  }[];
  alunni: {
    id: number;
    docenteId: number;
    fullName: string;
  }[];
};

export const getServerSideProps = requireAuth<Props>(async () => {
  return {
    props: {
      docenti: (await prisma.docente.findMany({ where: { admin: false } })).map(
        (d) => {
          return {
            id: d.id,
            fullName: d.nome + " " + d.cognome,
          };
        }
      ),
      alunni: (await prisma.alunno.findMany({})).map((d) => {
        return {
          id: d.id,
          docenteId: d.docenteId,
          fullName: d.nome + " " + d.cognome,
        };
      }),
    },
  };
}, true);

const Home: NextPage<Props> = (props) => {
  const [selectedLezioni, setSelectedLezioni] = useState(new Set<number>());
  const [filter, setFilter] = useState<LezioneFilter>({
    docente: {
      nome: "",
      cognome: "",
    },
    alunno: {
      nome: "",
      cognome: "",
    },
    startDate: new Date(),
    endDate: undefined as Date | undefined | null,
  });
  const [page, setPage] = useState<number>(0);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  type LezioniAdminApiResponse = z.infer<
    typeof LezioniAdminApi.Post.ResponseValidator
  >;
  const {
    data: { lezioni } = {},
    mutate: mutateLezioni,
    isValidating: isValidatingLezioni,
  } = useSWR<LezioniAdminApiResponse>(
    ["/api/admin/lezioni", filter, page],
    async () => {
      const { parser } = await zodFetch("/api/admin/lezioni", {
        method: "POST",
        body: {
          validator: LezioniAdminApi.Post.RequestValidator,
          value: { ...filter, page },
        },
        responseValidator: LezioniAdminApi.Post.ResponseValidator,
      });
      return await parser();
    }
  );

  const {
    data: { pageCount, pageSize } = { pageSize: 1, pageCount: 1 },
    isValidating: isValidatingPages,
  } = useSWR<LezioniAdminApiResponse>(
    ["/api/admin/lezioni", filter],
    async () => {
      const { parser } = await zodFetch("/api/admin/lezioni", {
        method: "POST",
        body: {
          validator: LezioniAdminApi.Post.RequestValidator,
          value: { ...filter, page: 0, pageOnly: true },
        },
        responseValidator: LezioniAdminApi.Post.ResponseValidator,
      });
      return await parser();
    }
  );

  return (
    <>
      <Layout requiresAuth loading={isValidatingLezioni || isValidatingPages}>
        <Container fluid className={styles.container}>
          <main className={styles.main}>
            <Row className="mb-3 w-100 align-items-center">
              <Form
                className="row g-3 gy-md-1 justify-content-center flex-grow-0 flex-shrink-1"
                onSubmit={(e) => {
                  e.preventDefault();
                }}
              ></Form>
            </Row>

            <Row className="mb-3 w-100 flex-grow-0 flex-shrink-1">
              <Col className="col-md-auto col-12 mb-3">
                <Button className="w-100" onClick={() => setShowAddModal(true)}>
                  Aggiungi
                </Button>
              </Col>
              <Col className="col-md-auto col-12 mb-3">
                <Button
                  className="w-100"
                  variant="danger"
                  onClick={() => setShowDeleteModal(true)}
                >
                  Elimina
                </Button>
              </Col>
              <Col xs="12" md="auto" className="ms-auto">
                <Button
                  className="w-100"
                  variant="secondary"
                  onClick={() => setShowFilterModal(true)}
                >
                  Filtra
                </Button>
              </Col>
            </Row>

            <LezioniAdvancedTable
              scrollable
              pageIndex={page}
              pageCount={pageCount}
              pageSize={pageSize}
              fetchPage={(page) => {
                setPage(page);
              }}
              content={useMemo(
                () =>
                  lezioni?.map((lezione) => {
                    return {
                      ...lezione,
                      selectable: true,
                      selected: selectedLezioni.has(lezione.id),
                    };
                  }) ?? [],
                [selectedLezioni, lezioni]
              )}
              onSelectLezione={(lezione, selected) => {
                setSelectedLezioni((lezioni) => {
                  const newLezioni = new Set(lezioni);
                  if (selected) newLezioni.add(lezione.id);
                  else newLezioni.delete(lezione.id);
                  return newLezioni;
                });
              }}
              onEditLezione={async (editedLezioneFields) => {
                const { res } = await zodFetch("/api/lezioni", {
                  method: "PUT",
                  body: {
                    value: editedLezioneFields,
                    validator: LezioniApi.Put.RequestValidator,
                  },
                  responseValidator: LezioniApi.Put.ResponseValidator,
                });

                if (res.ok) {
                  await mutateLezioni();
                  return { success: true, errMsg: "" };
                }

                if (res.status === 404)
                  return {
                    success: false,
                    errMsg: "Impossibile trovare la lezione",
                  };
                if (res.status === 400)
                  return { success: false, errMsg: "Parametri non validi" };
                return { success: false, errMsg: "Errore non previsto" };
              }}
            />
          </main>
        </Container>
      </Layout>

      <FilterModal
        filter={filter}
        show={showFilterModal}
        handleClose={() => setShowFilterModal(false)}
        handleSubmit={(filter) => {
          setFilter(filter);
          setPage(0);
        }}
      />
      <AddLezioniModal
        docenti={props.docenti}
        alunni={props.alunni}
        show={showAddModal}
        handleClose={() => setShowAddModal(false)}
        handleSubmit={async (lezioni) => {
          const { res, parser } = await zodFetch("/api/admin/lezione", {
            method: "POST",
            body: {
              value: lezioni,
              validator: LezioneApi.Post.RequestValidator,
            },
            responseValidator: LezioneApi.Post.ResponseValidator,
          });

          if (res.ok) {
            await mutateLezioni();
            return { success: true, errMsg: "" };
          }

          if (res.status === 400) {
            const { err } = await parser();
            if (isOverlapError(err))
              return {
                success: false,
                errMsg: "Ci sono " + err.count + " sovrapposizioni",
              };

            return { success: false, errMsg: "Parametri non validi" };
          }

          return { success: false, errMsg: "Errore non previsto" };
        }}
      />
      <DeleteLezioniModal
        show={showDeleteModal}
        handleClose={() => setShowDeleteModal(false)}
        handleSubmit={async () => {
          const { res } = await zodFetch("/api/admin/lezione", {
            method: "DELETE",
            body: {
              value: Array.from(selectedLezioni.keys()),
              validator: LezioneApi.Delete.RequestValidator,
            },
            responseValidator: LezioneApi.Delete.ResponseValidator,
          });

          if (res.ok) {
            await mutateLezioni();
            return { success: true, errMsg: "" };
          }

          if (res.status === 400)
            return { success: false, errMsg: "Parametri non validi" };
          return { success: false, errMsg: "Errore non previsto" };
        }}
      />
    </>
  );
};

export default Home;
