import React, { useState } from 'react'
import useUser from '@/lib/useUser'
import Layout from '@/components/Layout'
import LoginForm from '@/components/LoginForm'
import {useRouter} from "next/router";
import * as LoginApi from "@/types/api/login"
import { zodFetch } from "@/lib/fetch";

export default function Login() {
    // here we just check if user is already logged in and redirect to profile
    const redirectUrl = '/'
    const router = useRouter()
    const { mutateUser } = useUser({
        redirectTo: redirectUrl,
        redirectIfFound: true,
    })

    const [errorMsg, setErrorMsg] = useState('')
    const [isLoggingIn, setIsLoggingIn] = useState(false)

    return (
        <Layout loading={isLoggingIn}>
            <div className="login">
                <div className="login-box">
                    <LoginForm
                        errorMessage={errorMsg}
                        isLoggingIn={isLoggingIn}
                        onSubmit={async function handleSubmit(event) {
                            event.preventDefault()

                            setErrorMsg("")
                            setIsLoggingIn(true)

                            const {res, parser} = await zodFetch('/api/login', {
                                method: 'POST',
                                body: {
                                  value: {
                                    email: event.currentTarget.username.value,
                                    password: event.currentTarget.password.value,
                                  },
                                  validator: LoginApi.Post.RequestValidator,
                                },
                                responseValidator: LoginApi.Post.ResponseValidator,
                            });

                            if(res.ok) {
                                const user = await parser();
                                await Promise.all([
                                    router.push('/login'),
                                    mutateUser(user, false),
                                ]);
                            } else if(res.status == 401) {
                                setErrorMsg("Credenziali errate!");
                                setIsLoggingIn(false);
                            } else {
                                setErrorMsg("Unexpected error");
                                setIsLoggingIn(false);
                            }
                        }}
                    />
                </div>
            </div>
            {/* eslint-disable-next-line react/no-unknown-property */}
            <style jsx>{`
        .login {
          flex: 1 1 auto;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        
        .login-box {
          max-width: 21rem;
          margin: auto;
          padding: 1rem;
          border: 1px solid #ccc;
          border-radius: 4px;
        }
      `}</style>
        </Layout>
    )
}
