import { Modal, Form, Button, Col } from "react-bootstrap";
import { useState } from "react";

type Props<T> = {
  show: boolean;
  handleClose: () => void;
  handleSubmit: (password: {
    oldPassword: string;
    newPassword: string;
  }) => Promise<{ success: boolean; errMsg?: string }>;
};

export default function ChangePasswordModal<T extends Props<any>>(props: T) {
  let { show, handleClose, handleSubmit } = props;

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
        <Modal.Title>Cambia password</Modal.Title>
      </Modal.Header>

      <Form
        onSubmit={async (e) => {
          e.preventDefault();
          setErrMsg("");

          const newPassword = e.currentTarget.newPassword.value;
          const newPassword2 = e.currentTarget.newPassword2.value;
          if (newPassword !== newPassword2) {
            setErrMsg("Le due password non coincidono");
            return;
          }

          const pwd = {
            oldPassword: e.currentTarget.oldPassword.value,
            newPassword,
          };

          setExecuting(true);
          const res = await handleSubmit(pwd);
          if (res.success) handleClose();
          else setErrMsg(res.errMsg ?? "Errore non previsto");
          setExecuting(false);
        }}
      >
        <Modal.Body>
          <div className="row g-3">
            <Col xs="12">
              <Form.Label>Vecchia password</Form.Label>
              <Form.Control type="password" required name="oldPassword" />
            </Col>
            <Col xs="12">
              <Form.Label>Nuova password</Form.Label>
              <Form.Control type="password" required name="newPassword" />
            </Col>
            <Col xs="12">
              <Form.Label>Conferma nuova password</Form.Label>
              <Form.Control type="password" required name="newPassword2" />
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
            Cambia
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
