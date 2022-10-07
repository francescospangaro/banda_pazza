import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { FormEvent } from 'react'
import { Col } from "react-bootstrap";

export default function LoginForm({
                                 errorMessage,
                                 onSubmit,
                                 isLoggingIn,
                             }: {
    errorMessage: string
    onSubmit: (e: FormEvent<HTMLFormElement>) => void
    isLoggingIn: boolean
}) {
    return (
        <Form onSubmit={onSubmit}>
            <h1 className="mb-3">Login</h1>

            <Form.Group controlId="formEmail" className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control type="text" name="username" required />
            </Form.Group>

            <Form.Group controlId="formPassword" className="mb-3">
                <Form.Label>Password</Form.Label>
                <Form.Control type="password" name="password" required />
            </Form.Group>

            <Form.Group controlId="formSubmit" className="mb-3">
                <Button disabled={isLoggingIn} type="submit" className="w-100">Login</Button>
                {errorMessage && (
                  <p className="text-danger" style={{ textAlign: 'center' }}>{errorMessage}</p>
                )}
            </Form.Group>

            {/* eslint-disable-next-line */}
            <style jsx>{`
        .error {
          color: brown;
          margin: 1rem 0 0;
        }
      `}</style>
        </Form>
    )
}
