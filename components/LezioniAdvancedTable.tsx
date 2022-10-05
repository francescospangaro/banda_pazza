import React, {useMemo} from "react";
import GenericTable from "@/components/GenericTable"
import TextareaAutosize from "react-textarea-autosize"
import {Form} from "react-bootstrap";
import {Column} from "react-table";
import {Lezione} from "@/types/api/admin/lezioni"
import {Libretto} from "@/types/api/lezioni"

type TableLezione = {
    in: Lezione,
    id: number,
    docente: string,
    docenteId: number,
    alunni: string,
    orarioDiInizio: Date,
    orarioDiFine: Date,
    libretto?: Libretto | null,
    note?: string,
    recuperataDa?: {id: number, orarioDiInizio: Date, orarioDiFine: Date},
    recuperoDi?: {id: number, orarioDiInizio: Date, orarioDiFine: Date},
    selectable: boolean,
    selected: boolean,
}

type Props = {
    content: (Lezione & { selectable: boolean, selected: boolean, })[]
    onSelectLezione?: (lezione: Lezione, selected: boolean) => void,
    onEditLezione?: (editedLezioniField: { id: number } & Partial<Lezione>) => Promise<any>,
    scrollable?: boolean,
}

export default function LezioniAdvancedTable({content, onSelectLezione, onEditLezione, scrollable}: Props) {
    const tableData = content.map(lezione => { return {
        in: lezione,
        id: lezione.id,
        docente: lezione.docente.nome + ' ' + lezione.docente.cognome,
        docenteId: lezione.docente.id,
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
        selectable: lezione.selectable,
        selected: lezione.selected,
    }});
    const columns = useMemo<Column<TableLezione>[]>(
        () => [
            {
                accessor: "selected",
                Cell: (props) => {
                    return <Form.Check
                        disabled={!props.row.original.selectable}
                        checked={props.row.original.selected}
                        type="checkbox"
                        label=""
                        onChange={(e) => {
                            if(onSelectLezione) onSelectLezione(props.row.original.in, e.target.checked);
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
                accessor: "alunni",
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
                    return <TextareaAutosize disabled
                                             className="form-control"
                                             style={{resize: "none"}}
                                             value={props.row.original.note} />;
                },
            },
        ],
        [onSelectLezione, onEditLezione]
    );

    return (
        <GenericTable<TableLezione> options={{
            initialState: {
                sortBy: [{ id: "orarioDiInizio", }],
            },
            columns,
            data: tableData,
            autoResetHiddenColumns: false,
            scrollable: scrollable,
        }} />
    );
}
