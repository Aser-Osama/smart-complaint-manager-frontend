import React, { useState, useEffect } from "react";
import { Form, Button, Alert, Container, Col, Row } from "react-bootstrap";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { v4 as uuidv4 } from "uuid";
const CreateAppUser = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [name, setName] = useState("");
  const [token, setToken] = useState("");
  const [errors, setErrors] = useState(null);
  const [success, setSuccess] = useState("");
  const axiosPrivate = useAxiosPrivate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors(null);
    try {
      const response = await axiosPrivate.post("/appusers", {
        email,
        username,
        company,
        name,
        usertoken: token,
      });
      console.log("User created:", response);
      setSuccess("User created successfully");
      setErrors(null);
    } catch (error) {
      console.error("Error creating user:", error);
      setErrors(
        "Error creating user: " +
          (error?.response?.data?.error ?? "Unknown error has occurred") +
          "."
      );
      setSuccess("");
    }
  };

  return (
    <Container>
      <h1 className="mt-5 mb-3">Create Desktop App User</h1>
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="email">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mb-3"
          />
        </Form.Group>
        <Form.Group controlId="username">
          <Form.Label>Username</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mb-3"
          />
        </Form.Group>
        <Form.Group controlId="company">
          <Form.Label>Company</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter company"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="mb-3"
          />
        </Form.Group>
        <Form.Group controlId="name">
          <Form.Label>Name</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mb-3"
          />
        </Form.Group>

        <Form.Group controlId="token">
          <Form.Label>Token</Form.Label>
          <Row>
            <Col>
              <Form.Control
                type="text"
                placeholder="Enter token"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="mb-3"
              />
            </Col>
            <Col md="auto">
              <Button
                variant="secondary"
                onClick={() => setToken(uuidv4())}
                className="mb-3"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  className="bi bi-shuffle"
                  viewBox="0 0 16 16"
                >
                  <path
                    fillRule="evenodd"
                    d="M0 3.5A.5.5 0 0 1 .5 3H1c2.202 0 3.827 1.24 4.874 2.418.49.552.865 1.102 1.126 1.532.26-.43.636-.98 1.126-1.532C9.173 4.24 10.798 3 13 3v1c-1.798 0-3.173 1.01-4.126 2.082A9.6 9.6 0 0 0 7.556 8a9.6 9.6 0 0 0 1.317 1.918C9.828 10.99 11.204 12 13 12v1c-2.202 0-3.827-1.24-4.874-2.418A10.6 10.6 0 0 1 7 9.05c-.26.43-.636.98-1.126 1.532C4.827 11.76 3.202 13 1 13H.5a.5.5 0 0 1 0-1H1c1.798 0 3.173-1.01 4.126-2.082A9.6 9.6 0 0 0 6.444 8a9.6 9.6 0 0 0-1.317-1.918C4.172 5.01 2.796 4 1 4H.5a.5.5 0 0 1-.5-.5"
                  />
                  <path d="M13 5.466V1.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384l-2.36 1.966a.25.25 0 0 1-.41-.192m0 9v-3.932a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384l-2.36 1.966a.25.25 0 0 1-.41-.192" />
                </svg>
              </Button>
            </Col>
          </Row>
        </Form.Group>

        <Button variant="primary" type="submit">
          Create User
        </Button>
        {success && (
          <Alert variant="success" className="mt-3">
            {success}
          </Alert>
        )}

        {errors && errors.trim() && !success && (
          <Alert variant="danger" className="mt-3">
            {errors}
          </Alert>
        )}
      </Form>
    </Container>
  );
};

export default CreateAppUser;
