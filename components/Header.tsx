import useUser from '@/lib/useUser'
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
                                <Link href="/admin/" passHref><Nav.Link>Lezioni</Nav.Link></Link>
                                <Link href="/admin/docenti" passHref><Nav.Link>Docenti</Nav.Link></Link>
                                <Link href="/admin/alunni" passHref><Nav.Link>Alunni</Nav.Link></Link>
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
