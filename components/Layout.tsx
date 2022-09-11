import Head from 'next/head'
import Header from './Header'
import useUser from "../lib/useUser";
import styles from "../styles/Home.module.css";
import Image from "next/image";
import React from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
    const { user } = useUser()
    if(!user) return <div></div>

    return (
        <>
            <Head>
                <title>Banda pazza</title>
                <meta name="description" content="Sito della banda pazzissima" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <style jsx global>{`
        *,
        *::before,
        *::after {
          box-sizing: border-box;
        }
        html, body {
          margin: 0;
        }
        body {
          margin: 0;
          color: #333;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
            'Helvetica Neue', Arial, Noto Sans, sans-serif, 'Apple Color Emoji',
            'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
        }
        #__next {
          min-height: 100vh;
          display: flex;
          flex-flow: column;
        }
      `}</style>
            {user?.isLoggedIn === true && (
                <Header />
            )}

            <div className="container">
                <main>
                    {children}
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
            <style jsx>{`
        .container {
          flex: 1 1 auto;
          height: 100%;
          max-width: 65rem;
          margin: 1.5rem auto;
          padding-left: 1rem;
          padding-right: 1rem;
          display: flex;
          flex-flow: column;
        }
        
        main {
          flex: 1 1 auto;
          display: flex;
          flex-flow: column;
        }
        
        footer {
          display: flex;
          flex: 0 0 auto;
          padding: 2rem 0;
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
            `}</style>
        </>
    )
}
