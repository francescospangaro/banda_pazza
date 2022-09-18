import {Column} from "react-table";
import React, {useMemo} from "react";
import GenericTable from "./GenericTable"
import {Form} from "react-bootstrap"
import {Lezione, Libretto} from "../pages/api/lezioni"

type Props = {
    content: Lezione[],
    onEditLezione?: (editedLezioniField: { id: number } & Partial<Lezione>) => Promise<any>,
    scrollable?: boolean,
}

type TableLezione = {
    id: number,
    alunni: string,
    orarioDiInizio: Date,
    orarioDiFine: Date,
    libretto?: Libretto | null,
    note?: string,
}

export default function LezioniTable({content, scrollable, onEditLezione}: Props) {
    const tableData = content.map(lezione => { return {
        id: lezione.id,
        alunni: lezione.alunni.map(alunno => alunno.nome + ' ' + alunno.cognome).join(', '),
        orarioDiInizio: lezione.orarioDiInizio,
        orarioDiFine: lezione.orarioDiFine,
        libretto: lezione.libretto,
        note: lezione.note,
    }});
    const columns = useMemo<Column<TableLezione>[]>(
        () => [
            {
                Header: "Nome",
                accessor: "alunni",
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
                accessor: "libretto",
                Cell: (props) => {
                    return <Form.Select className="w-100"
                                        size="sm"
                                        value={props.row.original.libretto ?? ''}
                                        onChange={async (e) => {
                                            if(onEditLezione)
                                                await onEditLezione({
                                                    id: props.row.original.id,
                                                    libretto: e.target.value === '' ? null : e.target.value as Libretto,
                                                });
                                        }}
                    >
                        <option value="">---</option>
                        <option value="PRESENTE">Presente</option>
                        <option value="ASSENTE_GIUSTIFICATO">Assente Giustificato</option>
                        <option value="ASSENTE_NON_GIUSTIFICATO">Assente non giustificato</option>
                        <option value="LEZIONE_SALTATA">Lezione saltata</option>
                    </Form.Select>;
                },
            },
            {
                Header: "Note",
                accessor: "note",
                Cell: (props) => {
                    return <Form.Control as="textarea"
                                         rows={1}
                                         className="w-100"
                                         style={{resize: "vertical"}}
                                         size="sm"
                                         onChange={async (e) => {
                                             if(onEditLezione)
                                                 await onEditLezione({
                                                     id: props.row.original.id,
                                                     note: e.target.value,
                                                 });
                                         }}
                    >
                        {props.row.original.note}
                    </Form.Control>;
                },
            },
        ],
        [onEditLezione]
    );

    return <GenericTable<TableLezione> options={{
        columns,
        data: tableData,
        autoResetHiddenColumns: false,
        scrollable: scrollable,
    }} />;
}
