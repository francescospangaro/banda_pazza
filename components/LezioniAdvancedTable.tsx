import React, {useMemo} from "react";
import GenericTable from "@/components/GenericTable"
import {Row, Col, Button, Form} from "react-bootstrap"
import TextareaAutosize from "react-textarea-autosize"
import {Column, useTable, useSortBy, usePagination} from "react-table";
import {Lezione} from "@/types/api/admin/lezioni"
import {Libretto} from "@/types/api/lezioni"
import {TipoLezione} from "@/types/api/admin/lezione"

type TableLezione = {
    in: Lezione,
    id: number,
    docente: string,
    docenteId: number,
    alunni: string,
    orarioDiInizio: Date,
    orarioDiFine: Date,
    libretto?: Libretto,
    note?: string,
    recuperataDa?: {id: number, orarioDiInizio: Date, orarioDiFine: Date},
    recuperoDi?: {id: number, orarioDiInizio: Date, orarioDiFine: Date},
    tipoLezione: TipoLezione,
    selectable: boolean,
    selected: boolean,
}

type Props = {
    content: (Lezione & { selectable: boolean, selected: boolean, })[]
    pageIndex: number,
    pageCount: number,
    pageSize: number,
    fetchPage: (page: number) => any;
    onSelectLezione?: (lezione: Lezione, selected: boolean) => void,
    onEditLezione?: (editedLezioniField: { id: number, libretto?: Libretto | null }) => Promise<any>,
    scrollable?: boolean,
}

export default function LezioniAdvancedTable(
  {
    content,
    pageIndex: controlledPageIndex,
    pageCount: controlledPageCount,
    pageSize,
    fetchPage,
    onSelectLezione,
    onEditLezione,
    scrollable
  }: Props) {
    const tableData: TableLezione[] = useMemo(() => content.map(lezione => { return {
        in: lezione,
        id: lezione.id,
        docente: lezione.docente.nome + ' ' + lezione.docente.cognome,
        docenteId: lezione.docente.id,
        alunni: lezione.alunni.map(alunno => alunno.nome + ' ' + alunno.cognome).join(', '),
        orarioDiInizio: lezione.orarioDiInizio,
        orarioDiFine: lezione.orarioDiFine,
        libretto: lezione.libretto,
        note: "" +
            (lezione.recuperoDi ?
                "Recupero del " + lezione.recuperoDi?.orarioDiInizio.toLocaleDateString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit' }) :
                "") +
            (lezione.recuperataDa && lezione.recuperoDi ? '\n' : '') +
            (lezione.recuperataDa ?
                "Recuperata il " + lezione.recuperataDa?.orarioDiInizio.toLocaleDateString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit' }) :
                ""),
        recuperataDa: lezione.recuperataDa,
        recuperoDi: lezione.recuperoDi,
        tipoLezione: lezione.tipoLezione,
        selectable: lezione.selectable,
        selected: lezione.selected,
    }}), [content]);

    const columns = useMemo<Column<TableLezione>[]>(
        () => [
            {
                accessor: "selected",
                Cell: (props) => {
                    return <Form.Check
                        disabled={!props.row.original.selectable}
                        checked={props.row.original.selected}
                        type="checkbox"
                        label=""
                        onChange={(e) => {
                            if(onSelectLezione) onSelectLezione(props.row.original.in, e.target.checked);
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
                accessor: "alunni",
            },
            {
                Header: "Risultato",
                accessor: "libretto",
                Cell: (props) => {
                    return <Form.Select className="w-100"
                                        size="sm"
                                        disabled={!!props.row.original.recuperataDa}
                                        value={props.row.original.libretto ?? ''}
                                        onChange={async (e) => {
                                            if(onEditLezione)
                                                await onEditLezione({
                                                    id: props.row.original.id,
                                                    libretto: e.target.value === '' ? null : e.target.value as Libretto,
                                                });
                                        }}
                    >
                        <option value="">---</option>
                        <option value="PRESENTE">Presente</option>
                        {props.row.original.tipoLezione === ("NORMALE") && (<>
                          <option value="ASSENTE_GIUSTIFICATO">Assente Giustificato</option>
                          <option value="ASSENTE_NON_GIUSTIFICATO">Assente non giustificato</option>
                        </>)}
                        <option value="LEZIONE_SALTATA">Lezione saltata</option>
                    </Form.Select>;
                },
            },
            {
                Header: "Note",
                accessor: "note",
                Cell: (props) => {
                    return <TextareaAutosize disabled
                                             className="form-control"
                                             style={{resize: "none"}}
                                             value={props.row.original.note} />;
                },
            },
        ],
        [onSelectLezione, onEditLezione]
    );

    const table = useTable({
      initialState: {
        sortBy: [{ id: "orarioDiInizio", }],
        pageIndex: controlledPageIndex,
        pageSize: pageSize,
      },
      columns,
      data: tableData,
      manualPagination: true,
      pageCount: controlledPageCount,
      autoResetHiddenColumns: false,
    }, useSortBy, usePagination);

    const {
      canPreviousPage,
      canNextPage,
      pageOptions,
      pageCount,
      gotoPage,
      nextPage,
      previousPage,
      state: { pageIndex },
    } = table;

    React.useEffect(() => fetchPage(pageIndex), [fetchPage, pageIndex]);

    return <>
        <GenericTable<TableLezione> table={table} scrollable={scrollable}/>
        <Row className="w-100 mt-3 pb-3 align-items-center">
          <Col xs="12" md="auto">
            <Button size="sm" className="me-1" onClick={() => gotoPage(0)} disabled={!canPreviousPage}>
              {'<<'}
            </Button>
            <Button size="sm" className="me-1" onClick={() => previousPage()} disabled={!canPreviousPage}>
              {'<'}
            </Button>
            <Button size="sm" className="me-1" onClick={() => nextPage()} disabled={!canNextPage}>
              {'>'}
            </Button>
            <Button size="sm" className="me-1" onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage}>
              {'>>'}
            </Button>
          </Col>
          <Col xs="12" md="auto">
            <Form.Label className="col-form-label" style={{ whiteSpace: "nowrap", }}>
              Page{' '}
              <strong>
                {pageIndex + 1} of {pageOptions.length}
              </strong>{' '}
            </Form.Label>
          </Col>
          <Col xs="12" md="auto" className="row row-cols-auto">
            <Form.Label className="col-form-label" >Go to page:</Form.Label>
            <Form.Control
              size="sm"
              type="number"
              defaultValue={pageIndex + 1}
              onChange={e => {
                const page = e.target.value ? Number(e.target.value) - 1 : 0;
                gotoPage(page);
              }}
              style={{ width: '100px' }}
            />
          </Col>
        </Row>
    </>;
}
