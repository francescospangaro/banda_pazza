import {Modal, Form, Button, Row, Col, InputGroup} from "react-bootstrap"
import {useState} from "react";
import {LezioneToGenerate as GeneratedLezione, TipoLezione} from "@/types/api/admin/lezione"

type Props = {
    docenti: {
        id: number,
        fullName: string,
    }[],
    alunni: {
        id: number,
        docenteId: number,
        fullName: string,
    }[],
    show: boolean,
    handleClose: () => void,
    handleSubmit: (lezioni: GeneratedLezione[]) => Promise<{ success: boolean, errMsg?: string }>,
}

export default function AddLezioniModal({docenti, alunni: allAlunni, show, handleClose, handleSubmit}: Props) {
    const [alunni, setAlunni] = useState([null] as (string | null)[]);
    const [docente, setDocente] = useState(null as (number | null));
    const [errorMsg, setErrMsg] = useState('');
    const [executing, setExecuting] = useState(false);

    const _handleClose = handleClose;
    handleClose = () => {
        if (!executing) {
            _handleClose();
            setAlunni([null]);
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
                        docenteId: docente!,
                        alunniIds: alunni.map(alunno => Number(alunno)),
                        orario: new Date(startDate),
                        durataInMin: Number(e.currentTarget.durata.value),
                        tipoLezione: (String(e.currentTarget.radio_group.value) === ('SOLFEGGIO') ? TipoLezione.SOLFEGGIO :
                            String(e.currentTarget.radio_group.value) === ('KOALA') ? TipoLezione.KOALA :
                                String(e.currentTarget.radio_group.value) === ('TIPPETE') ? TipoLezione.TIPPETE :
                                    TipoLezione.NORMALE) as TipoLezione,
                    });
                    startDate.setDate(startDate.getDate() + 7);
                } while (endDate.getTime() - startDate.getTime() >= 0);

                setExecuting(true);
                const res = await handleSubmit(lessons);
                if (res.success)
                    handleClose();
                else
                    setErrMsg(res.errMsg ?? 'Errore non previsto');
                setExecuting(false);
            }}>
                <Modal.Body>
                    <div className="row g-3">
                        <Col xs="12">
                            <Form.Label>Docente</Form.Label>
                            <Form.Select required name="docente" onChange={e => {
                                setDocente(Number(e.currentTarget.value))
                            }}>
                                <>
                                    <option></option>
                                    {docenti.map(docente => {
                                        return <option key={docente.id} value={docente.id}>{docente.fullName}</option>
                                    })}
                                </>
                            </Form.Select>
                        </Col>
                        <Col xs="12">
                            <div className="mb-3">
                                <Form.Check
                                    inline
                                    label="Normale"
                                    name="radio_group"
                                    type="radio"
                                    value="NORMALE"
                                />
                                <Form.Check
                                    inline
                                    label="Solfeggio"
                                    name="radio_group"
                                    type="radio"
                                    value="SOLFEGGIO"
                                />
                                <Form.Check
                                    inline
                                    label="Tippete"
                                    name="radio_group"
                                    type="radio"
                                    value="TIPPETE"
                                />
                                <Form.Check
                                    inline
                                    label="Koala"
                                    name="radio_group"
                                    type="radio"
                                    value="KOALA"
                                />
                            </div>
                        </Col>
                        <Col xs="12">
                            <Row className="g-1">
                                <Col xs="auto"><Form.Label>Alunni</Form.Label></Col>
                                <Col xs="auto" className="ms-auto">
                                    <Button variant="primary"
                                            size="sm"
                                            onClick={() => {
                                                setAlunni(alunni => [...alunni, null])
                                            }}
                                    >
                                        Aggiungi
                                    </Button>
                                </Col>
                            </Row>
                            <Row className="g-1 mt-1">
                                {alunni.map((alunno, idx) => (
                                    <Col key={idx} xs="12">
                                        <InputGroup>
                                            <Button variant="outline-secondary"
                                                    onClick={() => {
                                                        setAlunni(alunni => {
                                                            if (alunni.length <= 1)
                                                                return alunni;

                                                            const newAlunni = [...alunni];
                                                            newAlunni.splice(idx, 1);
                                                            return newAlunni;
                                                        })
                                                    }}
                                            >
                                                Rimuovi
                                            </Button>
                                            <Form.Select required
                                                         value={alunno ?? ""}
                                                         onChange={(e) => setAlunni(alunni => {
                                                             const newAlunni = [...alunni];
                                                             newAlunni[idx] = e.target.value;
                                                             return newAlunni;
                                                         })}
                                            >
                                                <>
                                                    <option value=""></option>
                                                    {docente && allAlunni
                                                        .filter(alunno => !docente || alunno.docenteId === docente)
                                                        .map(alunno => {
                                                            return <option key={alunno.id}
                                                                           value={alunno.id}>{alunno.fullName}</option>
                                                        })}
                                                </>
                                            </Form.Select>
                                        </InputGroup>
                                    </Col>
                                ))}
                            </Row>
                        </Col>
                        <Col xs="12" md="6">
                            <Form.Label>Prima lezione</Form.Label>
                            <Form.Control required type="date" name="startDate"/>
                        </Col>
                        <Col xs="12" md="6">
                            <Form.Label>Ultima lezione</Form.Label>
                            <Form.Control required type="date" name="endDate"/>
                        </Col>
                        <Col xs="12" md="6">
                            <Form.Label>Ora</Form.Label>
                            <Form.Control required type="time" name="time"/>
                        </Col>
                        <Col xs="12" md="6">
                            <Form.Label>Durata</Form.Label>
                            <Form.Select required name="durata">
                                <option></option>
                                <option value="30">30min</option>
                                <option value="45">45min</option>
                                <option value="60">60min</option>
                            </Form.Select>
                        </Col>
                        <Col xs="12">
                            <p className="text-danger" style={{textAlign: 'center'}}>{errorMsg}</p>
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
