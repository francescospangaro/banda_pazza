import { Modal, Form, InputGroup, Button, Col } from "react-bootstrap";
import { useState } from "react";
import { DocenteToGenerate, Docente } from "@/types/api/admin/docente";
import generatePassword from "omgopass";

type Props<T> = {
  show: boolean;
  handleClose: () => void;
  handleSubmit: (docente: T) => Promise<{ success: boolean; errMsg?: string }>;
};

export type AddProps = Props<DocenteToGenerate> & {};

export type EditProps = Props<{ id: number } & Partial<Docente>> & {
  docente: Docente;
};

export default function DocenteModal<T extends Props<any>>(props: T) {
  let { show, handleClose, handleSubmit } = props;
  const isEdit = props.hasOwnProperty("docente");
  const docente = isEdit ? (props as unknown as EditProps).docente : null;

  const doGeneratePassword = () => {
    return generatePassword({
      syllablesCount: 7,
      minSyllableLength: 3,
      maxSyllableLength: 5,
      hasNumbers: true,
      titlecased: true,
    });
  };

  const [errorMsg, setErrMsg] = useState("");
  const [executing, setExecuting] = useState(false);
  const [password, setPassword] = useState(
    isEdit ? null : doGeneratePassword()
  );

  const _handleClose = handleClose;
  handleClose = () => {
    if (!executing) {
      _handleClose();
      setPassword(null);
      setErrMsg("");
    }
  };

  return (
    <Modal
      show={show}
      onShow={() => setPassword(isEdit ? null : doGeneratePassword())}
      onHide={handleClose}
    >
      <Modal.Header closeButton>
        <Modal.Title>
          {(isEdit ? "Modifica" : "Aggiungi") + " docente"}
        </Modal.Title>
      </Modal.Header>

      <Form
        onSubmit={async (e) => {
          e.preventDefault();
          setErrMsg("");

          const newDocente: any = {
            id: isEdit ? docente?.id : undefined,
            nome: e.currentTarget.nome.value,
            cognome: e.currentTarget.cognome.value,
            email: e.currentTarget.email.value,
            cf: e.currentTarget.cf.value,
            stipendioOrario: Number(e.currentTarget.stipendioOrario.value),
            password,
          };

          if (isEdit) {
            if (newDocente.nome === docente?.nome) newDocente.nome = undefined;
            if (newDocente.cognome === docente?.cognome)
              newDocente.cognome = undefined;
            if (newDocente.email === docente?.email)
              newDocente.email = undefined;
            if (newDocente.cf === docente?.cf) newDocente.cf = undefined;
            if (!newDocente.password) newDocente.password = undefined;
            if (newDocente.stipendioOrario === docente?.stipendioOrario)
              newDocente.stipendioOrario = undefined;
          }

          setExecuting(true);
          const res = await handleSubmit(newDocente);
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
                defaultValue={docente?.nome}
              />
            </Col>
            <Col xs="12">
              <Form.Label>Cognome</Form.Label>
              <Form.Control
                type="text"
                required
                name="cognome"
                defaultValue={docente?.cognome}
              />
            </Col>
            <Col xs="12">
              <Form.Label>Codice Fiscale</Form.Label>
              <Form.Control
                type="text"
                required
                name="cf"
                defaultValue={docente?.cf}
              />
            </Col>
            <Col xs="12">
              <Form.Label>Stipendio orario</Form.Label>
              <InputGroup>
                <Form.Control
                  type="number"
                  required
                  name="stipendioOrario"
                  defaultValue={docente?.stipendioOrario}
                />
                <InputGroup.Text>€/h</InputGroup.Text>
              </InputGroup>
            </Col>
            <Col xs="12">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                required
                name="email"
                defaultValue={docente?.email}
              />
            </Col>
            <Col xs="12">
              <Form.Label>Password</Form.Label>
              <InputGroup className="w-100">
                <Form.Control
                  type="text"
                  name="password"
                  required
                  readOnly
                  value={
                    !isEdit || password
                      ? password ?? ""
                      : "•••••••••••••••••••••••••••••••"
                  }
                />
                <Button
                  variant="danger"
                  onClick={() => {
                    setPassword(doGeneratePassword());
                  }}
                >
                  Rigenera
                </Button>
              </InputGroup>
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
