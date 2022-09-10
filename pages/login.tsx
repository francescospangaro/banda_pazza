import React, { useState } from 'react'
import useUser from '../lib/useUser'
import Layout from '../components/Layout'
import Form from '../components/Form'

export default function Login() {
    // here we just check if user is already logged in and redirect to profile
    const { mutateUser } = useUser({
        redirectTo: '/',
        redirectIfFound: true,
    })

    const [errorMsg, setErrorMsg] = useState('')

    return (
        <Layout>
            <div className="login">
                <Form
                    errorMessage={errorMsg}
                    onSubmit={async function handleSubmit(event) {
                        event.preventDefault()
                        setErrorMsg("")

                        const body = {
                            email: event.currentTarget.username.value,
                            password: event.currentTarget.password.value,
                        }
                        const res = await fetch('/api/login', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(body),
                        })

                        if(res.ok)
                            mutateUser(await res.json(), false)
                        else if(res.status == 401)
                            setErrorMsg("Credenziali errate!")
                        else
                            setErrorMsg("Unexpected error")
                    }}
                />
            </div>
            <style jsx>{`
        .login {
          max-width: 21rem;
          margin: 0 auto;
          padding: 1rem;
          border: 1px solid #ccc;
          border-radius: 4px;
        }
      `}</style>
        </Layout>
    )
}