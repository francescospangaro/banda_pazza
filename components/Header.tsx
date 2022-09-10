import useUser from '../lib/useUser'
import { useRouter } from 'next/router'

export default function Header() {
    const { user, mutateUser } = useUser()
    const router = useRouter()

    return (
        <header>
            <nav>
                <ul>
                    <li>
                        pisello
                    </li>
                </ul>
                <ul className="right">
                    <li>
                        {user?.email}
                    </li>
                    <li>
                        <a
                            href="/api/logout.tsx"
                            onClick={async (e) => {
                                e.preventDefault()
                                await mutateUser(
                                    await (await fetch('/api/logout', { method: 'POST' })).json(),
                                     false
                                 )
                                 await router.push('/login')
                            }}
                        >
                            Logout
                        </a>
                    </li>
                </ul>
            </nav>
            <style jsx>{`
              nav {
                display: flex;
              }
              ul {
                flex: 1 1;
                display: flex;
                list-style: none;
              }
              ul.right {
                margin-left: 0;
                padding-left: 0;
              }
              ul.right > li {
                margin-right: 1rem;
                display: flex;
              }
              ul.right > li:first-child {
                margin-left: auto;
              }
              a {
                color: #fff;
                text-decoration: none;
                display: flex;
                align-items: center;
              }
              a img {
                margin-right: 1em;
              }
              header {
                padding: 0.2rem;
                color: #fff;
                background-color: #333;
              }
            `}</style>
        </header>
    )
}