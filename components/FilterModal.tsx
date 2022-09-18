import {Modal, Form, Button, Col, InputGroup} from "react-bootstrap"
import React from "react";

export type Filter = {
    docente: {
        nome: string,
        cognome: string,
    },
    alunno: {
        nome: string,
        cognome: string,
    },
    startDate: Date | undefined | null,
    endDate: Date | undefined | null,
}

type Props = {
    filter: Filter,
    show: boolean,
    handleClose: () => void,
    handleSubmit: (filter: Filter) => any,
}

export default function FilterModal({filter, show, handleClose, handleSubmit}: Props) {
    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Filtra lezioni</Modal.Title>
            </Modal.Header>

            <Form onSubmit={async (e) => {
                e.preventDefault();
                handleSubmit({
                    docente: {
                        nome: e.currentTarget.nomeDocente.value,
                        cognome: e.currentTarget.cognomeDocente.value,
                    },
                    alunno: {
                        nome: e.currentTarget.nomeAlunno.value,
                        cognome: e.currentTarget.cognomeAlunno.value,
                    },
                    startDate: e.currentTarget.startDate.value ? new Date(e.currentTarget.startDate.value) : null,
                    endDate: e.currentTarget.startDate.value ? new Date(e.currentTarget.endDate.value) : null,
                });
                handleClose();
            }}>
                <Modal.Body>
                    <div className="row g-3">
                        <Col xs="12">
                            <Form.Label>Data inizio</Form.Label>
                            <Form.Control className="w-100" type="date" name="startDate" defaultValue={filter.startDate?.toLocaleDateString(
                                'en-CA',
                                {year: "numeric", month: "2-digit", day: "2-digit"},
                            )} />
                        </Col>

                        <Col xs="12">
                            <Form.Label>Data fine</Form.Label>
                            <Form.Control className="w-100" type="date" name="endDate" defaultValue={filter.endDate?.toLocaleDateString(
                                'en-CA',
                                {year: "numeric", month: "2-digit", day: "2-digit"},
                            )} />
                        </Col>

                        <Col xs="12">
                            <Form.Label>Docente</Form.Label>
                            <InputGroup className="w-100 mb-1">
                                <InputGroup.Text>Nome</InputGroup.Text>
                                <Form.Control type="text" name="nomeDocente" defaultValue={filter.docente.nome} />
                            </InputGroup>
                            <InputGroup className="w-100 mb-1">
                                <InputGroup.Text>Cognome</InputGroup.Text>
                                <Form.Control type="text" name="cognomeDocente" defaultValue={filter.docente.cognome} />
                            </InputGroup>
                        </Col>

                        <Col xs="12">
                            <Form.Label>Alunno</Form.Label>
                            <InputGroup className="w-100 mb-1">
                                <InputGroup.Text>Nome</InputGroup.Text>
                                <Form.Control type="text" name="nomeAlunno" defaultValue={filter.alunno.nome} />
                            </InputGroup>
                            <InputGroup className="w-100 mb-1">
                                <InputGroup.Text>Cognome</InputGroup.Text>
                                <Form.Control type="text" name="cognomeAlunno" defaultValue={filter.alunno.cognome} />
                            </InputGroup>
                        </Col>
                    </div>
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>Annulla</Button>
                    <Button type="submit" variant="primary">Filtra</Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}
