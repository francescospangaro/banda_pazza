import React, { useMemo } from "react";
import { Column, useSortBy, useTable } from "react-table";
import GenericTable from "@/components/GenericTable";
import { Alunno } from "@/types/api/alunno";

type Props = {
  content: Alunno[];
  scrollable?: boolean;
};

export default function TimetablesTable({ content, scrollable }: Props) {
  const columns = useMemo<Column<Alunno>[]>(
    () => [
      {
        Header: "Ore Totali",
        accessor: "oreTotali",
      },
      {
        Header: "Ore Fatte",
        accessor: "oreFatte",
      },
      {
        Header: "Ore Mancanti",
        accessor: "oreMancanti",
      },
    ],
    []
  );

  return (
    <GenericTable<Alunno>
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
