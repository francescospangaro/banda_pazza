import { Modal, Form, Button, Col } from "react-bootstrap";
import { useState } from "react";
import { AlunnoToGenerate, Alunno } from "@/types/api/admin/alunno";
import { Docente } from "@/types/api/admin/docente";

type Props<T> = {
  show: boolean;
  docenti: Docente[];
  handleClose: () => void;
  handleSubmit: (alunno: T) => Promise<{ success: boolean; errMsg?: string }>;
};

export type AddProps = Props<AlunnoToGenerate> & {};

export type EditProps = Props<{ id: number } & Partial<Alunno>> & {
  alunno: Alunno;
};

export default function DocenteModal<T extends Props<any>>(props: T) {
  let { show, handleClose, handleSubmit, docenti } = props;
  const isEdit = props.hasOwnProperty("alunno");
  const alunno = isEdit ? (props as unknown as EditProps).alunno : null;

  const [errorMsg, setErrMsg] = useState("");
  const [executing, setExecuting] = useState(false);

  const _handleClose = handleClose;
  handleClose = () => {
    if (!executing) {
      _handleClose();
      setErrMsg("");
    }
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>
          {(isEdit ? "Modifica" : "Aggiungi") + " alunno"}
        </Modal.Title>
      </Modal.Header>

      <Form
        onSubmit={async (e) => {
          e.preventDefault();
          setErrMsg("");

          const newAlunno: any = {
            id: isEdit ? alunno?.id : undefined,
            nome: e.currentTarget.nome.value,
            cognome: e.currentTarget.cognome.value,
            email: e.currentTarget.email.value,
            cf: e.currentTarget.cf.value,
            docenteId: Number(e.currentTarget.docente.value),
          };

          if (isEdit) {
            if (newAlunno.nome === alunno?.nome) newAlunno.nome = undefined;
            if (newAlunno.cognome === alunno?.cognome)
              newAlunno.cognome = undefined;
            if (newAlunno.email === alunno?.email) newAlunno.email = undefined;
            if (newAlunno.cf === alunno?.cf) newAlunno.cf = undefined;
            if (newAlunno.docenteId === alunno?.docenteId)
              newAlunno.docenteId = undefined;
          }

          setExecuting(true);
          const res = await handleSubmit(newAlunno);
          if (res.success) handleClose();
          else setErrMsg(res.errMsg ?? "Errore non previsto");
          setExecuting(false);
        }}
      >
        <Modal.Body>
          <div className="row g-3">
            <Col xs="12">
              <Form.Label>Nome</Form.Label>
              <Form.Control
                type="text"
                required
                name="nome"
                defaultValue={alunno?.nome}
              />
            </Col>
            <Col xs="12">
              <Form.Label>Cognome</Form.Label>
              <Form.Control
                type="text"
                required
                name="cognome"
                defaultValue={alunno?.cognome}
              />
            </Col>
            <Col xs="12">
              <Form.Label>Codice Fiscale</Form.Label>
              <Form.Control
                type="text"
                required
                name="cf"
                defaultValue={alunno?.cf}
              />
            </Col>
            <Col xs="12">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                required
                name="email"
                defaultValue={alunno?.email}
              />
            </Col>
            <Col xs="12">
              <Form.Label>Docente</Form.Label>
              <Form.Select
                required
                name="docente"
                defaultValue={alunno?.docenteId}
              >
                <>
                  <option></option>
                  {docenti.map((docente) => {
                    return (
                      <option key={docente.id} value={docente.id}>
                        {docente.nome + " " + docente.cognome}
                      </option>
                    );
                  })}
                </>
              </Form.Select>
            </Col>
            <Col xs="12">
              <p className="text-danger" style={{ textAlign: "center" }}>
                {errorMsg}
              </p>
            </Col>
          </div>
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="secondary"
            disabled={executing}
            onClick={handleClose}
          >
            Annulla
          </Button>
          <Button type="submit" disabled={executing} variant="primary">
            {isEdit ? "Modifica" : "Aggiungi"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
