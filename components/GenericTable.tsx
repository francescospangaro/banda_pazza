import React from "react";
import {useTable, useSortBy, Column, TableOptions} from "react-table";
import {Table, Thead, Tbody, Tr, Th, Td} from "react-super-responsive-table";
import {Row} from "react-bootstrap";
import useMediaQuery from "@restart/hooks/useMediaQuery";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faSort, faSortDown, faSortUp} from "@fortawesome/free-solid-svg-icons";

export default function GenericTable<T extends object = {}>({ options }: { options: TableOptions<T> & { scrollable?: boolean} }) {

    const {getTableProps, getTableBodyProps, headerGroups, rows, prepareRow} = useTable(options, useSortBy);

    const isNotMobile = useMediaQuery("(min-width: 768px)")
    const isDesktop = useMediaQuery("(min-width: 992px)")
    const table = (
        <Table className="table table-striped table-hover kill-table-header" {...getTableProps()} >
            {isNotMobile && (<Thead>
                <Tr>
                    {headerGroups.map((headerGroup) => (
                        headerGroup.headers.map((column) => {
                            const { key, ...restColumn } = column.getHeaderProps(column.getSortByToggleProps({
                                style: { whiteSpace: "nowrap" }
                            }));
                            return (
                                <Th
                                    key={key}
                                    {...restColumn}
                                >
                                    {column.render("Header")}
                                    <span className="ms-2" style={{ alignSelf: "end" }}>
                                    <FontAwesomeIcon icon={column.isSorted ? column.isSortedDesc ?
                                        faSortDown : faSortUp : faSort} size="2xs"/>
                                </span>
                                </Th>
                            );
                        })
                    ))}
                </Tr>
            </Thead>)}
            <Tbody {...getTableBodyProps()}>
                {rows.map((row) => {
                    prepareRow(row);
                    const { key, ...restRowProps } = row.getRowProps();
                    return (
                        <Tr key={key} {...restRowProps}>
                            {row.cells.map((cell) => {
                                const { key, ...restCellProps } = cell.getCellProps();
                                return (
                                    <Td key={key} {...restCellProps}>
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
                .responsiveTable.kill-table-header td.pivoted .tdBefore {
                  display: none;
                }
            `}</style>
        </Table>
    );

    if(options.scrollable !== true)
        return table;

    return <Row
        className={"align-items-start flex-grow-1 flex-shrink-1" + (isDesktop ? ' overflow-auto' : '')}
        style={{ width: "100%", minWidth: "fit-content" }}
    >
        {table}
    </Row>;
}
