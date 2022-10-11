import { Modal, Form, Button, Col } from "react-bootstrap";
import { useState } from "react";
import { LezioneDiRecupero } from "@/types/api/lezioni-da-giustificare";
import { Lezione } from "@/types/api/lezioni";

type Props = {
  show: boolean;
  handleClose: () => void;
  lezioniDaRecuperare: Lezione[];
  handleSubmit: (
    lezioni: LezioneDiRecupero
  ) => Promise<{ success: boolean; errMsg?: string }>;
};

export default function RecuperaLezioneModal({
  show,
  handleClose,
  lezioniDaRecuperare,
  handleSubmit,
}: Props) {
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
        <Modal.Title>Recupera lezioni</Modal.Title>
      </Modal.Header>

      <Form
        onSubmit={async (e) => {
          e.preventDefault();
          setErrMsg("");

          const recupero: LezioneDiRecupero = {
            idDaRecuperare: Number(e.currentTarget.lezioneDaRecuperare.value),
            orarioDiInizio: (() => {
              const orarioDiInizio = new Date(e.currentTarget.date.value);
              const [hour, minutes] = e.currentTarget.time.value.split(":");
              orarioDiInizio.setHours(Number(hour), Number(minutes));
              return orarioDiInizio;
            })(),
          };

          setExecuting(true);
          const res = await handleSubmit(recupero);
          if (res.success) handleClose();
          else setErrMsg(res.errMsg ?? "Errore non previsto");
          setExecuting(false);
        }}
      >
        <Modal.Body>
          <div className="row g-3">
            <Col xs="12">
              <Form.Label>Lezione da recuperare</Form.Label>
              <Form.Select required name="lezioneDaRecuperare">
                <option value=""></option>
                {lezioniDaRecuperare.map((lezione) => (
                  <option key={lezione.id} value={lezione.id}>
                    {lezione.orarioDiInizio.toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                    }) +
                      ", " +
                      lezione.orarioDiInizio.toLocaleTimeString(undefined, {
                        hour: "2-digit",
                        minute: "2-digit",
                      }) +
                      "-" +
                      lezione.orarioDiFine.toLocaleTimeString(undefined, {
                        hour: "2-digit",
                        minute: "2-digit",
                      }) +
                      " " +
                      lezione.alunni
                        .map((alunno) => alunno.nome + " " + alunno.cognome)
                        .join(", ")}
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col xs="12" md="6">
              <Form.Label>Giorno</Form.Label>
              <Form.Control required type="date" name="date" />
            </Col>
            <Col xs="12" md="6">
              <Form.Label>Ora</Form.Label>
              <Form.Control required type="time" name="time" />
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
            Cancella
          </Button>
          <Button type="submit" disabled={executing} variant="primary">
            Recupera
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
