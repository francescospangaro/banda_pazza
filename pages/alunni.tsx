import type { NextPage } from "next";
import Layout from "@/components/Layout";
import { Container } from "react-bootstrap";

import { prisma } from "@/lib/database";
import React, { ComponentPropsWithoutRef, useState } from "react";

import requireAuth from "@/lib/auth";
import Dropdown from "react-bootstrap/Dropdown";
import Form from "react-bootstrap/Form";
import styles from "@/styles/Home.module.css";
import useSWR from "swr";
import { zodFetch } from "@/lib/fetch";
import * as AlunnoApi from "@/types/api/alunno";
import { Alunno } from "@/types/api/alunno";
import TimetablesTable from "@/components/TimetablesTable";
import AlunnoForDocentiTable from "@/components/AlunnoForDocentiTable";

type Props = {
  alunni: {
    id: number;
    docenteId: number;
    fullName: string;
  }[];
};

export const getServerSideProps = requireAuth<Props>(async (ctx) => {
  return {
    props: {
      alunni: (
        await prisma.alunno.findMany({
          where: { docenteId: ctx.req.session.user?.id },
        })
      ).map((d) => {
        return {
          id: d.id,
          docenteId: d.docenteId,
          fullName: d.nome + " " + d.cognome,
        };
      }),
    },
  };
}, false);

const CustomMenu = React.forwardRef<
  HTMLDivElement | null,
  ComponentPropsWithoutRef<"div">
>(({ children, style, className, "aria-labelledby": labeledBy }, ref) => {
  const [value, setValue] = useState("");

  return (
    <div
      ref={ref}
      style={style}
      className={className}
      aria-labelledby={labeledBy}
    >
      <Form.Control
        autoFocus
        className="mx-3 my-2 w-auto"
        placeholder="Filtra alunni"
        onChange={(e) => setValue(e.target.value)}
        value={value}
      />
      <ul className="list-unstyled">
        {React.Children.toArray(children).filter(
          (child) =>
            !value ||
            !React.isValidElement(child) ||
            child.props.children.toLowerCase().startsWith(value)
        )}
      </ul>
    </div>
  );
});

CustomMenu.displayName = "Registro Elettronico";

const Home: NextPage<Props> = (props) => {
  const [alunno, setSelectedAlunno] = useState<number | null>(null);

  const {
    data: alunnoData,
    isValidating: isValidatingAlunno,
  } = useSWR<Alunno>(
    alunno ? ["/api/alunno", alunno] : null,
    async (url, alunno) => {
      const { parser } = await zodFetch(url, {
        method: "POST",
        body: {
          validator: AlunnoApi.Post.RequestValidator,
          value: { id: alunno },
        },
        responseValidator: AlunnoApi.Post.ResponseValidator,
      });
      return await parser();
    }
  );

  return (
    <Layout requiresAuth loading={isValidatingAlunno}>
      <Container fluid className={styles.container}>
        <Dropdown onSelect={(alunnoId) => {setSelectedAlunno(alunnoId ? Number(alunnoId) : null)}}>
          <Dropdown.Toggle id="dropdown-custom-components">
            Seleziona Alunno
          </Dropdown.Toggle>

          <Dropdown.Menu as={CustomMenu}>
            {props.alunni.map((alunno) => {
              return (
                <Dropdown.Item key={alunno.id} eventKey={alunno.id}>{alunno.fullName}</Dropdown.Item>
              );
            })}
          </Dropdown.Menu>
        </Dropdown>

        <TimetablesTable content={alunnoData ? [alunnoData] : []} />
        <AlunnoForDocentiTable scrollable content={alunnoData?.lezioni ?? []} />
      </Container>
    </Layout>
  );
};
export default Home;
