import React from "react";
import {useTable, useSortBy, Column, TableOptions} from "react-table";
import {Table, Thead, Tbody, Tr, Th, Td} from "react-super-responsive-table";
import useMediaQuery from "@restart/hooks/useMediaQuery";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faSort, faSortDown, faSortUp} from "@fortawesome/free-solid-svg-icons";

export default function GenericTable<T extends object = {}>({ options }: { options: TableOptions<T> }) {

    const {getTableProps, getTableBodyProps, headerGroups, rows, prepareRow} = useTable(options, useSortBy);

    const isNotMobile = useMediaQuery("(min-width: 768px)")
    return (
        <Table className="table table-striped table-hover kill-table-header" {...getTableProps()} >
            {isNotMobile && (<Thead>
                <Tr>
                    {headerGroups.map((headerGroup) => (
                        headerGroup.headers.map((column) => (
                            <Th {...column.getHeaderProps(column.getSortByToggleProps())} style={{ whiteSpace: "nowrap" }}>
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

            {/* eslint-disable-next-line react/no-unknown-property */}
            <style jsx global>{`
                .responsiveTable.kill-table-header td.pivoted {
                  padding-left: 10px !important;
                }
            `}</style>
        </Table>
    );
}
