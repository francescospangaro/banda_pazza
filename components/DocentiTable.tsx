import React, {useMemo, useState} from "react";
import { Column, useSortBy, useTable } from "react-table";
import GenericTable from "@/components/GenericTable";
import {Button} from "react-bootstrap";
import {Docente} from "@/types/api/admin/docente";

type Props = {
    content: Docente[],
    onEdit?: (docente: Docente) => Promise<any>,
    scrollable?: boolean,
}

type TableDocente = Docente & {
    editable: boolean,
}

export default function DocentiTable({content, onEdit, scrollable}: Props) {
    const [editingDocenti, setEditingDocenti] = useState(new Set<number>());
    const tableData: TableDocente[] = useMemo(() => content.map(docente => { return {
        ...docente,
        editable: true,
    }}), [content]);

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

    return <GenericTable<TableDocente> table={useTable({
        columns,
        data: tableData,
        autoResetHiddenColumns: false,
        scrollable: scrollable,
    }, useSortBy)} />;
}
