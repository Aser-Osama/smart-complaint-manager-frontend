import React from "react";
import { Link, NavLink } from "react-router-dom";
import { Navbar, Nav, Container } from "react-bootstrap";
import useAuth from "../hooks/useAuth"; // Import the hook

const NavBar = () => {
  const { auth } = useAuth(); // Destructure auth from context

  // If auth is undefined or if there’s no access token, render a loading message or null
  if (!auth || !auth.accessToken) {
    return null;
  }

  return (
    <Navbar bg="light" expand="lg">
      <Container>
        <Navbar.Brand as={Link} to="/">
          MyApp, {auth.user ? `Welcome, ${auth.role}` : "Please Login"}
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {auth.accessToken && (
              <>
                <Nav.Link as={NavLink} to="/" end>
                  Home
                </Nav.Link>
                {auth.role === "admin" && (
                  <Nav.Link as={NavLink} to="/admin">
                    Admin
                  </Nav.Link>
                )}
              </>
            )}
          </Nav>
          <Nav>
            {auth.accessToken ? (
              <Nav.Link as={NavLink} to="/logout">
                Logout
              </Nav.Link>
            ) : (
              <Nav.Link as={NavLink} to="/login">
                Login
              </Nav.Link>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavBar;
