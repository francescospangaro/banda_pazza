import React, {useMemo} from "react";
import GenericTable from "./GenericTable"
import {Libretto} from ".prisma/client"
import {Form} from "react-bootstrap";
import {CellProps, Column} from "react-table";

export type Lezione = {
    id: number,
    docente: string,
    docenteId: number,
    alunno: string,
    alunnoId: number,
    orarioDiInizio: Date,
    orarioDiFine: Date,
    risultato: Libretto,
    note: string,
    selectable: boolean,
    selected: boolean,
}

type Props = {
    content: Lezione[]
    onSelectLezione?: (lezione: Lezione, selected: boolean) => void,
    scrollable?: boolean,
}

export default function LezioniAdvancedTable({content, onSelectLezione, scrollable}: Props) {
    const columns = useMemo<Column<Lezione>[]>(
        () => [
            {
                accessor: "selected",
                Cell: (props: CellProps<Lezione>) => {
                    return <Form.Check
                        disabled={!props.row.original.selectable}
                        checked={props.row.original.selected}
                        type="checkbox"
                        label=""
                        onChange={(e) => {
                            if(onSelectLezione) onSelectLezione(props.row.original, e.target.checked);
                        }}/>
                },
            },
            {
                Header: "Data",
                accessor: "orarioDiInizio",
                sortType: 'datetime',
                Cell: (props) => {
                    return <div>{
                        props.row.original.orarioDiInizio.toLocaleDateString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit' }) +
                        ', ' +
                        props.row.original.orarioDiInizio.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) +
                        '-' +
                        props.row.original.orarioDiFine.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
                    }</div>
                },
            },
            {
                Header: "Docente",
                accessor: "docente",
            },
            {
                Header: "Alunno",
                accessor: "alunno",
            },
            {
                Header: "Risultato",
                accessor: "risultato",
                Cell: () => {
                    return <select className="w-100">
                        <option value="">---</option>
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
        [onSelectLezione]
    );

    return (
        <GenericTable<Lezione> options={{
            initialState: {
                sortBy: [{ id: "orarioDiInizio", }],
            },
            columns,
            data: content,
            autoResetHiddenColumns: false,
            scrollable: scrollable,
        }} />
    );
}
