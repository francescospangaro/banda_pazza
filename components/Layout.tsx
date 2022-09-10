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
          min-height: 100vh;
          margin: 0;
        }
        body {
          margin: 0;
          color: #333;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
            'Helvetica Neue', Arial, Noto Sans, sans-serif, 'Apple Color Emoji',
            'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
          min-height: 100vh;
        }
        .container {
          max-width: 65rem;
          margin: 1.5rem auto;
          padding-left: 1rem;
          padding-right: 1rem;
        }
      `}</style>
            {user?.isLoggedIn === true && (
                <Header />
            )}

            <main>
                <div className="container">{children}</div>
            </main>
        </>
    )
}