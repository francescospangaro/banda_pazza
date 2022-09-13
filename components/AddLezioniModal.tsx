import {Modal, Form, Button, Col, InputGroup} from "react-bootstrap"
import {useState} from "react";

type GeneratedLezione = {
    docenteId: number,
    alunnoId: number,
    orario: Date,
    durataInMin: number,
}

type Props = {
    docenti: {
        id: number,
        fullName: string,
    }[],
    alunni: {
        id: number,
        fullName: string,
    }[],
    show: boolean,
    handleClose: () => void,
    handleSubmit: (lezioni: GeneratedLezione[]) => Promise<{ success: boolean, errMsg?: string }>,
}

export default function AddLezioniModal({ docenti, alunni, show, handleClose, handleSubmit }: Props) {
    const [errorMsg, setErrMsg] = useState('');
    const [executing, setExecuting] = useState(false);

    const _handleClose = handleClose;
    handleClose = () => {
        if(!executing) {
            _handleClose();
            setErrMsg('');
        }
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Aggiungi lezioni</Modal.Title>
            </Modal.Header>

            <Form onSubmit={async (e) => {
                e.preventDefault();
                setErrMsg('');

                let lessons: GeneratedLezione[] = [];

                const [hour, minutes] = e.currentTarget.time.value.split(':');
                const startDate = new Date(e.currentTarget.startDate.value);
                startDate.setHours(Number(hour), Number(minutes));
                const endDate = new Date(e.currentTarget.endDate.value);
                endDate.setHours(Number(hour), Number(minutes));
                do {
                    lessons.push({
                        docenteId: e.currentTarget.docente.value,
                        alunnoId: e.currentTarget.alunno.value,
                        orario: new Date(startDate),
                        durataInMin: Number(e.currentTarget.durata.value),
                    });
                    startDate.setDate(startDate.getDate() + 7);
                } while(endDate.getTime() - startDate.getTime() >= 0);

                setExecuting(true);
                const res = await handleSubmit(lessons);
                if(res.success)
                    handleClose();
                else
                    setErrMsg(res.errMsg ?? 'Errore non previsto');
                setExecuting(false);
            }}>
                <Modal.Body>
                    <div className="row g-3">
                        <Col xs="12">
                            <Form.Label>Docente</Form.Label>
                            <Form.Select required name="docente" >
                                <>
                                    <option></option>
                                    {docenti.map(docente => {
                                        return <option key={docente.id} value={docente.id}>{docente.fullName}</option>
                                    })}
                                </>
                            </Form.Select>
                        </Col>
                        <Col xs="12">
                            <Form.Label>Alunno</Form.Label>
                            <Form.Select required name="alunno">
                                <>
                                    <option></option>
                                    {alunni.map(alunno => {
                                        return <option key={alunno.id} value={alunno.id}>{alunno.fullName}</option>
                                    })}
                                </>
                            </Form.Select>
                        </Col>
                        <Col xs="12" md="6">
                            <Form.Label>Prima lezione</Form.Label>
                            <Form.Control required type="date" name="startDate" />
                        </Col>
                        <Col xs="12" md="6">
                            <Form.Label>Ultima lezione</Form.Label>
                            <Form.Control required type="date" name="endDate" />
                        </Col>
                        <Col xs="12" md="6">
                            <Form.Label>Ora</Form.Label>
                            <Form.Control required type="time" name="time" />
                        </Col>
                        <Col xs="12" md="6">
                            <Form.Label>Durata</Form.Label>
                            <Form.Select required name="durata">
                                <option></option>
                                <option value="30">30min</option>
                                <option value="45">45min</option>
                            </Form.Select>
                        </Col>
                        <Col xs="12">
                            <p className="text-danger" style={{ textAlign: 'center' }}>{errorMsg}</p>
                        </Col>
                    </div>
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="secondary" disabled={executing} onClick={handleClose}>Cancella</Button>
                    <Button type="submit" disabled={executing} variant="primary">Aggiungi</Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}
