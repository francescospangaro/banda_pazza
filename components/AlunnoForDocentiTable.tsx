import React, { useMemo } from "react";
import { Column, useSortBy, useTable } from "react-table";
import GenericTable from "@/components/GenericTable";
import { Alunno } from "@/types/api/alunno";

type Lezione = Alunno["lezioni"][0];

type Props = {
  content: Lezione[];
  scrollable?: boolean;
};

export default function AlunnoForDocentiTable({ content, scrollable }: Props) {
  const columns = useMemo<Column<Lezione>[]>(
    () => [
      {
        Header: "Data Lezione",
        accessor: "data",
        Cell: (props) => {
          return (
            <div>
              {props.row.original.data.toLocaleString(undefined)}
            </div>
          );
        },
      },
      {
        Header: "Risultato",
        accessor: "risultato",
        Cell: (props) => {
          return (
            <div>
              {props.row.original.recuperata ? "RECUPERATA" : props.row.original.risultato}
            </div>
          );
        },
      },
    ],
    []
  );

  return (
    <GenericTable<Lezione>
      scrollable={scrollable}
      table={useTable(
        {
          columns,
          data: content,
          autoResetHiddenColumns: false,
        },
        useSortBy
      )}
    />
  );
}
