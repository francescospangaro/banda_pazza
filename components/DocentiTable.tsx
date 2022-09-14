import React, {useMemo, useState} from "react";
import {Column} from "react-table";
import GenericTable from "./GenericTable";
import {Button} from "react-bootstrap";

export type Docente = {
    id: number,
    nome: string,
    cognome: string,
    email: string,
    cf: string,
}

type Props = {
    content: Docente[],
    onResetPasswordFor?: (docente: Docente) => Promise<any>,
}

type TableDocente = Docente & {
    resettable: boolean,
}

export default function DocentiTable({content, onResetPasswordFor}: Props) {
    const [resettingDocenti, setResettingDocenti] = useState(new Set<number>());
    const tableData: TableDocente[] = content.map(docente => { return {
        ...docente,
        resettable: true,
    }})

    const columns = useMemo<Column<TableDocente>[]>(
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
            {
                Header: "Password",
                accessor: "resettable",
                Cell: (props) => {
                    const docenteId = props.row.original.id;
                    return <Button size="sm"
                                   disabled={resettingDocenti.has(docenteId)}
                                   onClick={async () => {
                                       if(!onResetPasswordFor)
                                           return;

                                       setResettingDocenti(docenti => {
                                           const newDocenti = new Set(docenti);
                                           newDocenti.add(docenteId);
                                           return newDocenti;
                                       });

                                       await onResetPasswordFor(props.row.original)

                                       setResettingDocenti(docenti => {
                                           const newDocenti = new Set(docenti);
                                           newDocenti.delete(docenteId);
                                           return newDocenti;
                                       });
                                   }}>Reset</Button>
                },
            },
        ],
        [onResetPasswordFor, resettingDocenti, setResettingDocenti]
    );

    return <GenericTable<TableDocente> options={{
        columns,
        data: tableData,
        autoResetHiddenColumns: false,
    }} />;
}
