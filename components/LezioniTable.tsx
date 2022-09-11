import {useTable, useSortBy, Column} from "react-table";
import React, {useMemo} from "react";
import {Table, Thead, Tbody, Tr, Th, Td} from "react-super-responsive-table";
import {Libretto} from ".prisma/client"
import useMediaQuery from "@restart/hooks/useMediaQuery";

export type Content = {
    nome: string,
    cognome: string,
    orario: Date,
    risultato: Libretto,
    note: string,
}

type Props = {
    content: Content[]
}

export default function LezioniTable({content}: Props) {
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
                accessor: "orario",
                Cell: (props) => {
                    return <div>{props.row.original.orario.toLocaleTimeString()}</div>
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

    const {getTableProps, getTableBodyProps, headerGroups, rows, prepareRow} =
        useTable(
            {
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