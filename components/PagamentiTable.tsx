import React, { useMemo, useState } from "react";
import { Column, useSortBy, useTable } from "react-table";
import GenericTable from "@/components/GenericTable";
import { Button } from "react-bootstrap";
import { Docente } from "@/types/api/admin/docente";

type Props = {
  content: (Docente & {
    hoursToBePaid: number;
    eurosToBePaid: number;
  })[];
  onPay?: (docente: Docente) => Promise<void>;
  scrollable?: boolean;
};

type TablePagamenti = Docente & {
  hoursToBePaid: number;
  eurosToBePaid: number;
  payable: boolean;
};

export default function PagamentiTable({
  content,
  onPay,
  scrollable,
}: Props) {
  const [docentiBeingPaid, setDocentiBeingPaid] = useState(new Set<number>());
  const tableData: TablePagamenti[] = useMemo(
    () =>
      content.map((docente) => {
        return {
          ...docente,
          payable: true,
        };
      }),
    [content]
  );

  const columns = useMemo<Column<TablePagamenti>[]>(
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
        Header: "Ore:",
        accessor: "hoursToBePaid",
        Cell: (props) => <>{props.value}</>,
      },
      {
        Header: "Da pagare:",
        accessor: "eurosToBePaid",
        Cell: (props) => <>{props.value + "€"}</>,
      },
      {
        Header: "",
        accessor: "payable",
        Cell: (props) => {
          const docenteId = props.row.original.id;
          return (
            <Button
              size="sm"
              className="w-100"
              disabled={docentiBeingPaid.has(docenteId)}
              onClick={async () => {
                if (!onPay) return;

                setDocentiBeingPaid((docenti) => {
                  const newDocenti = new Set(docenti);
                  newDocenti.add(docenteId);
                  return newDocenti;
                });

                await onPay(props.row.original);

                setDocentiBeingPaid((docenti) => {
                  const newDocenti = new Set(docenti);
                  newDocenti.delete(docenteId);
                  return newDocenti;
                });
              }}
            >
              Paga
            </Button>
          );
        },
      },
    ],
    [onPay, docentiBeingPaid, setDocentiBeingPaid]
  );

  return (
    <GenericTable<TablePagamenti>
      scrollable={scrollable}
      table={useTable(
        {
          columns,
          data: tableData,
          autoResetHiddenColumns: false,
        },
        useSortBy
      )}
    />
  );
}
