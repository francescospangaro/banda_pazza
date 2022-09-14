import React, {useMemo, useState} from "react";
import {Column} from "react-table";
import GenericTable from "./GenericTable";

export type Alunno = {
    id: number,
    nome: string,
    cognome: string,
    email: string,
    cf: string,
}

type Props = {
    content: Alunno[],
}

export default function AlunniTable({content}: Props) {

    const columns = useMemo<Column<Alunno>[]>(
        () => [
            {
                Header: "Nome",
                accessor: "nome",
            },
            {
                Header: "Cognome",
                accessor: "cognome",
            },
            {
                Header: "Codice Fiscale",
                accessor: "cf",
            },
            {
                Header: "Email",
                accessor: "email",
            },
        ],
        []
    );

    return <GenericTable<Alunno> options={{
        columns,
        data: content,
        autoResetHiddenColumns: false,
    }} />;
}
