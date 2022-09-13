import {useTable, useSortBy, Column, CellProps} from "react-table";
import React, {useMemo} from "react";
import {Table, Thead, Tbody, Tr, Th, Td} from "react-super-responsive-table";
import {Libretto} from ".prisma/client"
import useMediaQuery from "@restart/hooks/useMediaQuery";
import {Form} from "react-bootstrap";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faSort, faSortUp, faSortDown} from '@fortawesome/free-solid-svg-icons'

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
    onSelectLezione?: (lezione: Lezione, selected: boolean) => void;
}

export default function LezioniAdvancedTable({content, onSelectLezione}: Props) {
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

    const {getTableProps, getTableBodyProps, headerGroups, rows, prepareRow} =
        useTable(
            {
                initialState: {
                    sortBy: [{ id: "orarioDiInizio", }],
                },
                columns,
                data: content,
                autoResetHiddenColumns: false,
            },
            useSortBy
        );

    const isNotMobile = useMediaQuery("(min-width: 768px)")
    return (
        <Table className="table table-striped table-hover kill-table-header" {...getTableProps()} >
            {isNotMobile && (<Thead>
                <Tr>
                    {headerGroups.map((headerGroup) => (
                        headerGroup.headers.map((column) => (
                            <Th {...column.getHeaderProps(column.getSortByToggleProps())} >
                                {column.render("Header")}
                                <span className="ms-2" style={{ alignSelf: "end" }}>
                                    <FontAwesomeIcon icon={column.isSorted ? column.isSortedDesc ?
                                        faSortDown : faSortUp : faSort} size="2xs"/>
                                </span>
                            </Th>
                        ))
                    ))}
                </Tr>
            </Thead>)}
            <Tbody {...getTableBodyProps()}>
                {rows.map((row) => {
                    prepareRow(row);
                    return (
                        <Tr {...row.getRowProps()}>
                            {row.cells.map((cell) => {
                                return (
                                    <Td {...cell.getCellProps()}>
                                        {cell.render("Cell")}
                                    </Td>
                                );
                            })}
                        </Tr>
                    );
                })}
            </Tbody>

            <style jsx global>{`
                .responsiveTable.kill-table-header td.pivoted {
                  padding-left: 10px !important;
                }
            `}</style>
        </Table>
    );
}
