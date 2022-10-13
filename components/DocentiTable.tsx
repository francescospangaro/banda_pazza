import React, { useMemo, useState } from "react";
import { Column, useSortBy, useTable } from "react-table";
import GenericTable from "@/components/GenericTable";
import { Button } from "react-bootstrap";
import { Docente } from "@/types/api/admin/docente";

type Props = {
  content: (Docente & { euros: number })[];
  onEdit?: (docente: Docente) => Promise<any>;
  onPay?: (docente: Docente) => Promise<void>;
  scrollable?: boolean;
};

type TableDocente = Docente & {
  euros: number;
  editable: boolean;
  payable: boolean;
};

export default function DocentiTable({
  content,
  onEdit,
  onPay,
  scrollable,
}: Props) {
  const [editingDocenti, setEditingDocenti] = useState(new Set<number>());
  const [docentiBeingPaid, setDocentiBeingPaid] = useState(new Set<number>());
  const tableData: TableDocente[] = useMemo(
    () =>
      content.map((docente) => {
        return {
          ...docente,
          editable: true,
          payable: true,
        };
      }),
    [content]
  );

  const columns = useMemo<Column<TableDocente>[]>(
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
        Header: "Codice Fiscale",
        accessor: "cf",
      },
      {
        Header: "Email",
        accessor: "email",
      },
      {
        Header: "",
        accessor: "editable",
        Cell: (props) => {
          const docenteId = props.row.original.id;
          return (
            <Button
              size="sm"
              className="w-100"
              disabled={editingDocenti.has(docenteId)}
              onClick={async () => {
                if (!onEdit) return;

                setEditingDocenti((docenti) => {
                  const newDocenti = new Set(docenti);
                  newDocenti.add(docenteId);
                  return newDocenti;
                });

                await onEdit(props.row.original);

                setEditingDocenti((docenti) => {
                  const newDocenti = new Set(docenti);
                  newDocenti.delete(docenteId);
                  return newDocenti;
                });
              }}
            >
              Edit
            </Button>
          );
        },
      },
      {
        Header: "Da pagare",
        accessor: "euros",
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
    [
      onEdit,
      editingDocenti,
      setEditingDocenti,
      onPay,
      docentiBeingPaid,
      setDocentiBeingPaid,
    ]
  );

  return (
    <GenericTable<TableDocente>
      table={useTable(
        {
          columns,
          data: tableData,
          autoResetHiddenColumns: false,
          scrollable: scrollable,
        },
        useSortBy
      )}
    />
  );
}
