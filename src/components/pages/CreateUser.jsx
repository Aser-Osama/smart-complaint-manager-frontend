import { useState, useEffect } from "react";
import { Form, Button, Alert, Container } from "react-bootstrap";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useNavigate } from "react-router-dom";

const CreateUser = () => {
  const roles = ["user", "admin"];
  const [Name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState("");
  const [success, setSuccess] = useState("");
  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors("");
    try {
      const response = await axiosPrivate.post("/users", {
        name: Name,
        password,
        role,
        email,
      });
      console.log("User created:", response);
      setErrors("");
      setSuccess("User created successfully");
      navigate("/createuser")
    } catch (error) {
      console.error("Error creating user:", error);
      setErrors(
        "Error creating user: " +
        (error?.response?.data?.message ?? "Unknown error has occurred") +
        "."
      );
      setSuccess("");
    }
  };

  return (
    <Container>
      <h1 className="mt-5 mb-3">Create User</h1>
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="NewName">
          <Form.Label>Name</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter Name"
            value={Name}
            onChange={(e) => setName(e.target.value)}
            className="mb-3"
          />
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
        </Form.Group>
        <Form.Group controlId="role">
          <Form.Label>Role</Form.Label>
          <Form.Control
            as="select"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="mb-3"
          >
            {roles.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </Form.Control>
        </Form.Group>
        <Form.Group controlId="Newpassword">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mb-3"
          />
        </Form.Group>
        <Button variant="primary" type="submit">
          Create User
        </Button>
        <p>
          {success && (
            <Alert variant="success" className="mt-3">
              {success}
            </Alert>
          )}
        </p>
        {errors && (
          <Alert variant="danger" className="mt-3">
            {errors}
          </Alert>
        )}
      </Form>
    </Container>
  );
};

export default CreateUser;
