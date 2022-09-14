import useUser from '../lib/useUser'
import {useRouter} from 'next/router'
import {Navbar, Container, Nav, NavDropdown} from 'react-bootstrap'
import Link from "next/link"
import Image from "next/future/image"

export default function Header() {
    const {user, mutateUser} = useUser()
    const router = useRouter()

    return (
        <Navbar bg="dark" variant="dark" expand="lg">
            <Container>
                <Navbar.Brand>
                    <Image
                        style={{ filter: "invert(1)" }}
                        alt=""
                        src="/logo.svg"
                        width="30"
                        height="30"
                        className="d-inline-block align-top"
                    />{' '}
                    Banda
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav"/>
                <Navbar.Collapse id="navbar-nav">
                    <Nav className="me-auto">
                        {user?.admin && (
                            <>
                                <Nav.Link><Link href="/admin/">Lezioni</Link></Nav.Link>
                                <Nav.Link><Link href="/admin/docenti">Docenti</Link></Nav.Link>
                                <Nav.Link><Link href="/admin/alunni">Alunni</Link></Nav.Link>
                            </>
                        )}
                    </Nav>
                </Navbar.Collapse>
                <Navbar.Collapse className="justify-content-end">
                    <Nav>
                        <NavDropdown title={user?.email} id="basic-nav-dropdown">
                            <NavDropdown.Item onClick={async (e) => {
                                e.preventDefault()
                                const user = await fetch('/api/logout', {method: 'POST'}).then(res => res.json());
                                await Promise.all([
                                    mutateUser(user, false),
                                    router.push('/login'),
                                ])
                            }}>Logout</NavDropdown.Item>
                        </NavDropdown>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    )
}
