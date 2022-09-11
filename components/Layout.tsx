import Head from 'next/head'
import Header from './Header'
import useUser from "../lib/useUser";

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

            <main>
                {children}
            </main>
            <style jsx>{`
        main {
          flex: 1 1 auto;
          height: 100%;
          max-width: 65rem;
          margin: 1.5rem auto;
          padding-left: 1rem;
          padding-right: 1rem;
          display: flex;
          flex-flow: column;
        }
            `}</style>
        </>
    )
}
