import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { FormEvent } from 'react'

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
            <h1 className="mb-3">Inserisci sti cazzo di dati di merda</h1>

            <Form.Group controlId="formEmail" className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control type="email" name="username" required />
            </Form.Group>

            <Form.Group controlId="formPassword" className="mb-3">
                <Form.Label>Password</Form.Label>
                <Form.Control type="password" name="password" required />
            </Form.Group>

            <Form.Group controlId="formSubmit" className="mb-3">
                <Button disabled={isLoggingIn} type="submit" className="w-100">Login</Button>
                {errorMessage && (
                    <Form.Text muted className="error w-100">{errorMessage}</Form.Text>
                )}
            </Form.Group>

            <style jsx>{`
        .error {
          color: brown;
          margin: 1rem 0 0;
        }
      `}</style>
        </Form>
    )
}
