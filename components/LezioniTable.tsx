import {Column} from "react-table";
import React, {useMemo} from "react";
import GenericTable from "./GenericTable"
import {Libretto} from ".prisma/client"

export type Content = {
    nome: string,
    cognome: string,
    orarioDiInizio: Date,
    orarioDiFine: Date,
    risultato: Libretto,
    note: string,
}

type Props = {
    content: Content[],
    scrollable?: boolean,
}

export default function LezioniTable({content, scrollable}: Props) {
    const columns = useMemo<Column<Content>[]>(
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
                Header: "Orario",
                accessor: "orarioDiInizio",
                Cell: (props) => {
                    return <div>{
                        props.row.original.orarioDiInizio.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) +
                        '-' +
                        props.row.original.orarioDiFine.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
                    }</div>
                },
            },
            {
                Header: "Risultato",
                accessor: "risultato",
                Cell: () => {
                    return <select className="w-100">
                        <option value="PRESENTE">---</option>
                        <option value="PRESENTE">Presente</option>
                        <option value="ASSENTE_GIUSTIFICATO">Assente Giustificato</option>
                        <option value="ASSENTE_NON_GIUSTIFICATO">Assente non giustificato</option>
                        <option value="LEZIONE_SALTATA">Lezione saltata</option>
                    </select>;
                },
            },
            {
                Header: "Note",
                accessor: "note",
                Cell: () => {
                    return <textarea className="w-100" style={{
                        resize: "vertical"
                    }}></textarea>;
                },
            },
        ],
        []
    );

    return <GenericTable<Content> options={{
        columns,
        data: content,
        autoResetHiddenColumns: false,
        scrollable: scrollable,
    }} />;
}
