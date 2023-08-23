import useUser from "@/lib/useUser";
import { useRouter } from "next/router";
import { useState } from "react";
import { Navbar, Container, Nav, NavDropdown } from "react-bootstrap";
import Link from "next/link";
import Image from "next/future/image";
import ChangePasswordModal from "@/components/ChangePasswordModal";
import { zodFetch } from "@/lib/fetch";
import * as LogoutApi from "@/types/api/logout";
import * as ChangePasswordApi from "@/types/api/change-password";

export default function Header() {
  const { user, mutateUser } = useUser();
  const router = useRouter();
  const [showChangePwdModal, setShowChangePwdModal] = useState(false);

  return (
    <>
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
            />{" "}
            Banda
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="navbar-nav">
            <Nav className="me-auto">
              {user?.admin ? (
                <>
                  <Link href="/admin/" passHref>
                    <Nav.Link>Lezioni</Nav.Link>
                  </Link>
                  <Link href="/admin/docenti" passHref>
                    <Nav.Link>Docenti</Nav.Link>
                  </Link>
                  <Link href="/admin/alunni" passHref>
                    <Nav.Link>Alunni</Nav.Link>
                  </Link>
                    <Link href="/admin/pagamenti" passHref>
                        <Nav.Link>Pagamenti</Nav.Link>
                    </Link>
                </>
              ) : (
                <>
                  <Link href="/" passHref>
                    <Nav.Link>Lezioni</Nav.Link>
                  </Link>
                  <Link href="/alunni" passHref>
                    <Nav.Link>Report Alunni</Nav.Link>
                  </Link>
                </>
              )}
            </Nav>
          </Navbar.Collapse>
          <Navbar.Collapse className="justify-content-end">
            <Nav>
              <NavDropdown title={user?.email} id="basic-nav-dropdown">
                <NavDropdown.Item onClick={() => setShowChangePwdModal(true)}>
                  Cambia password
                </NavDropdown.Item>
                <NavDropdown.Item
                  onClick={async (e) => {
                    e.preventDefault();
                    const { parser } = await zodFetch("/api/logout", {
                      method: "POST",
                      responseValidator: LogoutApi.Post.ResponseValidator,
                    });

                    await Promise.all([
                      mutateUser(await parser(), false),
                      router.push("/login"),
                    ]);
                  }}
                >
                  Logout
                </NavDropdown.Item>
              </NavDropdown>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <ChangePasswordModal
        show={showChangePwdModal}
        handleClose={() => setShowChangePwdModal(false)}
        handleSubmit={async (pwd) => {
          const { res } = await zodFetch("api/change-password", {
            method: "POST",
            body: {
              value: pwd,
              validator: ChangePasswordApi.Post.RequestValidator,
            },
            responseValidator: ChangePasswordApi.Post.ResponseValidator,
          });

          if (res.ok) return { success: true, errMsg: "" };
          if (res.status === 401)
            return { success: false, errMsg: "Credenziali errate" };
          if (res.status === 400)
            return { success: false, errMsg: "Parametri non validi" };
          return { success: false, errMsg: "Errore non previsto" };
        }}
      />
    </>
  );
}
