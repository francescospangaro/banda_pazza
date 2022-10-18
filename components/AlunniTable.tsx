import React, { useMemo, useState } from "react";
import { Column, useSortBy, useTable } from "react-table";
import GenericTable from "@/components/GenericTable";
import { Button } from "react-bootstrap";
import { Alunno } from "@/types/api/admin/alunno";
import { Docente } from "@/types/api/admin/docente";

type TableAlunno = Alunno & {
  editable: boolean;
};

type Props = {
  content: Alunno[];
  docenti: Docente[];
  onEdit?: (alunno: Alunno) => Promise<any>;
  scrollable?: boolean;
};

export default function AlunniTable({
  content,
  docenti,
  onEdit,
  scrollable,
}: Props) {
  const [editingAlunni, setEditingAlunni] = useState(new Set<number>());
  const tableData: TableAlunno[] = useMemo(
    () =>
      content.map((alunno) => {
        return {
          ...alunno,
          editable: true,
        };
      }),
    [content]
  );
  const idToDocente = docenti.reduce((map, docente) => {
    map.set(docente.id, docente);
    return map;
  }, new Map<number, Docente>());

  const columns = useMemo<Column<TableAlunno>[]>(
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
        Header: "Docente",
        accessor: "docenteId",
        Cell: (props) => {
          const docente = idToDocente.get(props.row.original.docenteId)!;
          return <>{docente.nome + " " + docente.cognome}</>;
        },
      },
      {
        Header: "",
        accessor: "editable",
        Cell: (props) => {
          const alunnoId = props.row.original.id;
          return (
            <Button
              size="sm"
              className="w-100"
              disabled={editingAlunni.has(alunnoId)}
              onClick={async () => {
                if (!onEdit) return;

                setEditingAlunni((alunni) => {
                  const newAlunni = new Set(alunni);
                  newAlunni.add(alunnoId);
                  return newAlunni;
                });

                await onEdit(props.row.original);

                setEditingAlunni((alunni) => {
                  const newAlunni = new Set(alunni);
                  newAlunni.delete(alunnoId);
                  return newAlunni;
                });
              }}
            >
              Edit
            </Button>
          );
        },
      },
    ],
    [onEdit, editingAlunni, setEditingAlunni, idToDocente]
  );

  return (
    <GenericTable<TableAlunno>
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
