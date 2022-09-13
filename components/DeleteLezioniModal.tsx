import {Modal, Button} from "react-bootstrap"
import {useState} from "react";

type Props = {
    show: boolean,
    handleClose: () => void,
    handleSubmit: () => Promise<{ success: boolean, errMsg?: string }>,
}

export default function DeleteLezioniModal({ show, handleClose, handleSubmit }: Props) {
    const [executing, setExecuting] = useState(false);
    const [errorMsg, setErrMsg] = useState('');

    const _handleClose = handleClose;
    handleClose = () => {
        _handleClose();
        setErrMsg('');
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Aggiungi lezioni</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                Sei sicuro di voler eliminare le lezioni selezionate?
                <p className="text-danger mt-3" style={{ textAlign: 'center' }}>{errorMsg}</p>
            </Modal.Body>

            <Modal.Footer>
                <Button variant="secondary" disabled={executing} onClick={handleClose}>Annulla</Button>
                <Button type="submit" disabled={executing} variant="danger" onClick={async () => {
                    setErrMsg('');
                    setExecuting(true);
                    const res = await handleSubmit();
                    if(res.success)
                        handleClose();
                    else
                        setErrMsg(res.errMsg ?? 'Errore non previsto');
                    setExecuting(false);
                }}>Elimina</Button>
            </Modal.Footer>
        </Modal>
    );
}
