import Head from 'next/head'
import Header from './Header'
import useUser from "../lib/useUser";
import Image from "next/image";
import React from "react";
import {Spinner} from "react-bootstrap"

export default function Layout({ children, requiresAuth, loading }: {
    children: React.ReactNode,
    requiresAuth?: boolean,
    loading?: boolean,
}) {
    const { user, isValidatingUser } = useUser(requiresAuth ? { redirectTo: '/login' } : {})

    return (
        <>
            <Head>
                <title>Banda pazza</title>
                <meta name="description" content="Sito della banda pazzissima" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <header>
                {requiresAuth && user?.isLoggedIn === true && (
                    <Header />
                )}
            </header>

            <div className="layout-container">
                <main>
                    {(!requiresAuth || !isValidatingUser || user?.isLoggedIn === true) && children}
                </main>

                <footer>
                    <a
                        href="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Corpo Musicale M. G. Nava – musica per passione dal 1920
                        <span>
                        <Image src="/logo.svg" alt="Logo" width={64} height={64} />
                        </span>
                    </a>
                </footer>
            </div>

            {isValidatingUser || loading && (
                <div className="loading-spinner">
                    <Spinner animation="grow" role="status" variant="primary">
                        <span className="visually-hidden">Loading...</span>
                    </Spinner>
                </div>
            )}

            {/* eslint-disable-next-line react/no-unknown-property */}
            <style jsx>{`
        :global(*,
        *::before,
        *::after) {
          box-sizing: border-box;
        }
        :global(html, body) {
          margin: 0;
        }
        :global(body) {
          margin: 0;
          color: #333;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
            'Helvetica Neue', Arial, Noto Sans, sans-serif, 'Apple Color Emoji',
            'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
        }
        :global(#__next) {
          height: 100vh;
          min-height: 100vh;
          max-height: 100vh;
          display: grid;
          grid-template-rows: auto minmax(0, 1fr);
        }
        .layout-container {
          flex: 1 1 auto;
          max-width: 75rem;
          margin: 1.5rem auto 0 auto;
          padding-left: 1rem;
          padding-right: 1rem;
          display: grid;
          grid-template-rows: minmax(0, 1fr) auto;
        }
        
        main {
          flex: 1 1 auto;
          display: flex;
          flex-flow: column;
          overflow: auto;
        }
        
        footer {
          display: flex;
          flex: 0 0 auto;
          padding: 0.5rem 0;
          border-top: 1px solid #eaeaea;
          justify-content: center;
          align-items: center;
        }
        
        footer a {
          display: flex;
          justify-content: center;
          align-items: center;
          flex-grow: 1;
          text-align: center;
        }

        .logo {
          height: 1em;
          margin-left: 0.5rem;
        }
        
        .loading-spinner {
            position: absolute;
            bottom: 1em;
            right: 2em;
        }
            `}</style>
        </>
    )
}
