import { Column, useSortBy, useTable } from "react-table";
import React, {useMemo} from "react";
import GenericTable from "@/components/GenericTable"
import TextareaAutosize from "react-textarea-autosize"
import {Form} from "react-bootstrap"
import {Lezione, Libretto} from "@/types/api/lezioni"

type Props = {
    content: Lezione[],
    onEditLezione?: (editedLezioniField: { id: number, libretto?: Libretto | null }) => Promise<any>,
    scrollable?: boolean,
}

type TableLezione = {
    id: number,
    alunni: string,
    orarioDiInizio: Date,
    orarioDiFine: Date,
    libretto?: Libretto | null,
    note?: string,
    recuperataDa?: {id: number, orarioDiInizio: Date, orarioDiFine: Date},
    recuperoDi?: {id: number, orarioDiInizio: Date, orarioDiFine: Date},
    solfeggio: boolean,
}

export default function LezioniTable({content, scrollable, onEditLezione}: Props) {
    const tableData: TableLezione[] = useMemo(() => content.map(lezione => { return {
        id: lezione.id,
        alunni: lezione.alunni.map(alunno => alunno.nome + ' ' + alunno.cognome).join(', '),
        orarioDiInizio: lezione.orarioDiInizio,
        orarioDiFine: lezione.orarioDiFine,
        libretto: lezione.libretto,
        note: "" +
            (lezione.recuperoDi ?
                "Recupero del " + lezione.recuperoDi?.orarioDiInizio.toLocaleDateString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit' }) :
                "") +
            (lezione.recuperataDa && lezione.recuperoDi ? '\n' : '') +
            (lezione.recuperataDa ?
                "Recuperata il " + lezione.recuperataDa?.orarioDiInizio.toLocaleDateString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit' }) :
                ""),
        recuperataDa: lezione.recuperataDa,
        recuperoDi: lezione.recuperoDi,
        solfeggio: lezione.solfeggio,
    }}), [content]);
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
                                        disabled={!!props.row.original.recuperataDa}
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
                        {!props.row.original.solfeggio && (<>
                            <option value="ASSENTE_GIUSTIFICATO">Assente Giustificato</option>
                            <option value="ASSENTE_NON_GIUSTIFICATO">Assente non giustificato</option>
                        </>)}
                        <option value="LEZIONE_SALTATA">Lezione saltata</option>
                    </Form.Select>;
                },
            },
            {
                Header: "Note",
                accessor: "note",
                Cell: (props) => {
                    return <TextareaAutosize disabled
                                             className="form-control"
                                             style={{resize: "none"}}
                                             value={props.row.original.note} />;
                },
            },
        ],
        [onEditLezione]
    );

    return <GenericTable<TableLezione> table={useTable({
        columns,
        data: tableData,
        autoResetHiddenColumns: false,
        scrollable: scrollable,
    }, useSortBy)} />;
}
