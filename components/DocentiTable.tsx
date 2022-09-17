import React, {useMemo, useState} from "react";
import {Column} from "react-table";
import GenericTable from "./GenericTable";
import {Button} from "react-bootstrap";
import {Docente} from "../pages/api/admin/docente";

type Props = {
    content: Docente[],
    onEdit?: (docente: Docente) => Promise<any>,
}

type TableDocente = Docente & {
    editable: boolean,
}

export default function DocentiTable({content, onEdit}: Props) {
    const [editingDocenti, setEditingDocenti] = useState(new Set<number>());
    const tableData: TableDocente[] = content.map(docente => { return {
        ...docente,
        editable: true,
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
                Header: "",
                accessor: "editable",
                Cell: (props) => {
                    const docenteId = props.row.original.id;
                    return <Button size="sm"
                                   className="w-100"
                                   disabled={editingDocenti.has(docenteId)}
                                   onClick={async () => {
                                       if(!onEdit)
                                           return;

                                       setEditingDocenti(docenti => {
                                           const newDocenti = new Set(docenti);
                                           newDocenti.add(docenteId);
                                           return newDocenti;
                                       });

                                       await onEdit(props.row.original)

                                       setEditingDocenti(docenti => {
                                           const newDocenti = new Set(docenti);
                                           newDocenti.delete(docenteId);
                                           return newDocenti;
                                       });
                                   }}>Edit</Button>
                },
            },
        ],
        [onEdit, editingDocenti, setEditingDocenti]
    );

    return <GenericTable<TableDocente> options={{
        columns,
        data: tableData,
        autoResetHiddenColumns: false,
    }} />;
}
