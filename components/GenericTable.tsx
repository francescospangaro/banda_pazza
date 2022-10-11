import React from "react";
import {TableInstance} from "react-table";
import {Table, Thead, Tbody, Tr, Th, Td} from "react-super-responsive-table";
import {Row} from "react-bootstrap";
import useMediaQuery from "@restart/hooks/useMediaQuery";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faSort, faSortDown, faSortUp} from "@fortawesome/free-solid-svg-icons";

export default function GenericTable<T extends object = {}>({ table: tableInstance, scrollable }: {
  table: TableInstance<T>,
  scrollable?: boolean
}) {
    const {getTableProps, getTableBodyProps, headerGroups, rows, prepareRow} = tableInstance;

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
                    const rows = row.cells.reduce((map, cell) => {
                      map.set(cell, cell.column.rowSpan ? cell.column.rowSpan({
                        ...tableInstance,
                        column: cell.column,
                        row,
                        cell,
                        value: cell.value,
                      }) : 1);
                      return map;
                    }, new Map<any, number>());
                    const maxRows = Array.from(rows.values()).reduce((p, v) => p > v ? p : v);

                    return Array.from(Array(maxRows).keys()).map(cellRowIndex => (
                      <Tr key={key + '_' + cellRowIndex} {...restRowProps}>
                        {row.cells.map((cell) => {
                          const {key, ...restCellProps} = cell.getCellProps();
                          const cellRows = (cell.column.rowSpan ? rows.get(cell) : undefined) ?? 1;
                          if(cellRows < cellRowIndex + 1)
                            return null;

                          const isLastRowCell = cellRows == cellRowIndex + 1;
                          const rowSpan = isLastRowCell ? (maxRows - cellRows) + 1 : 1;

                          if(cell.column.RowSpanCells)
                            cell.column.Cell = cell.column.RowSpanCells as any;

                          return (
                            <Td key={key} rowSpan={rowSpan} {...restCellProps}>
                              {cell.render("Cell", { cellRowIndex, cellMaxRows: maxRows })}
                            </Td>
                          );
                        })}
                      </Tr>
                    ));
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

    if(!scrollable)
        return table;

    return <Row
        className={"align-items-start flex-grow-1 flex-shrink-1" + (isDesktop ? ' overflow-auto' : '')}
        style={{ width: "100%", minWidth: "fit-content" }}
    >
        {table}
    </Row>;
}
