import React, { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import {
  Table,
  Button,
  Container,
  Modal,
  Row,
  Col,
  Form,
} from "react-bootstrap";

const ViewAppUser = () => {
  const axiosPrivate = useAxiosPrivate();

  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [token, setToken] = useState("");
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [showConfirmRevoke, setShowConfirmRevoke] = useState(false);
  const [showConfirmRevokeGUID, setShowConfirmRevokeGUID] = useState(false);

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedUserId(null);
  };
  const handleShowModal = () => setShowModal(true);
  // Function to revoke a user's token
  const revokeToken = (userId) => {
    axiosPrivate.put(`/appusers/revoke-token/${selectedUserId}`);

    setUsers(
      users.map((user) =>
        user.id === userId ? { ...user, usertoken: null } : user
      )
    );
  };
  const revokeGUID = (userId) => {
    axiosPrivate.put(`/appusers/revoke-guid/${selectedUserId}`);

    setUsers(
      users.map((user) =>
        user.id === userId ? { ...user, win_guid: null } : user
      )
    );
  };

  const handleRevokeConfirm = () => {
    if (selectedUserId) {
      revokeToken(selectedUserId);
      setShowConfirmRevoke(false);
      setSelectedUserId(null);
    }
  };

  const handleRevokeGUIDConfirm = () => {
    if (selectedUserId) {
      revokeGUID(selectedUserId);
      setShowConfirmRevokeGUID(false);
      setSelectedUserId(null);
    }
  };

  const updateToken = () => {
    if (!selectedUserId) return;

    const newToken = token || uuidv4();
    axiosPrivate.put(`/appusers/create-token/${selectedUserId}`, {
      usertoken: newToken,
    });
    setUsers(
      users.map((user) =>
        user.id === selectedUserId ? { ...user, usertoken: newToken } : user
      )
    );
    setSelectedUserId(null);
    setShowModal(false);
    setToken("");
  };

  useEffect(() => {
    const GetAllUsers = async () => {
      try {
        const response = await axiosPrivate.get("/appusers");
        setUsers(response.data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    GetAllUsers();
  }, []);

  const WrapText = ({ text, limit = 5 }) => {
    if (!text) return "No Token";
    return (
      <div
        style={{
          maxWidth: '100px',
          wordBreak: text.length > limit ? 'break-word' : 'normal',
          whiteSpace: text.length > limit ? 'normal' : 'nowrap'
        }}
        title={text}
      >
        {text}
      </div>
    );
  };

  return (
    <Container className="mt-5">
      <h1>User Management</h1>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>ID</th>
            <th>Email</th>
            <th>Username</th>
            <th>Company</th>
            <th>Name</th>
            <th>User Token</th>
            <th>GUID</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.email}</td>
              <td>{user.username}</td>
              <td>{user.company}</td>
              <td>{user.name}</td>

              <td>{user.usertoken ? <WrapText text={user.usertoken} /> : "No Token"}</td>
              <td>{user.win_guid ? <WrapText text={user.win_guid} /> : "No GUID"}</td>
              <td>
                <Button
                  variant="warning"
                  className="me-2"
                  onClick={() => {
                    handleShowModal();
                    setSelectedUserId(user.id);
                  }}
                >
                  Update Token
                </Button>
                <Button
                  variant="danger"
                  className="me-2"
                  onClick={() => {
                    setSelectedUserId(user.id);
                    setShowConfirmRevoke(true);
                  }}
                  disabled={!user.usertoken}
                >
                  Revoke Token
                </Button>
                <Button
                  variant="danger"
                  onClick={() => {
                    setSelectedUserId(user.id);
                    setShowConfirmRevokeGUID(true);
                  }}
                >
                  Remove GUID
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <>
        <Modal show={showModal} onHide={handleCloseModal}>
          <Modal.Header closeButton>
            <Modal.Title>Set New Token</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {token} {selectedUserId}
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
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Close
            </Button>
            <Button variant="primary" onClick={updateToken}>
              Save Changes
            </Button>
          </Modal.Footer>
        </Modal>
        <Modal
          show={showConfirmRevoke}
          onHide={() => setShowConfirmRevoke(false)}
        >
          <Modal.Header closeButton>
            <Modal.Title>Confirm Token Revocation</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Are you sure you want to revoke this user's token?
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setShowConfirmRevoke(false)}
            >
              Cancel
            </Button>
            <Button variant="danger" onClick={handleRevokeConfirm}>
              Revoke Token
            </Button>
          </Modal.Footer>
        </Modal>

        <Modal
          show={showConfirmRevokeGUID}
          onHide={() => setShowConfirmRevokeGUID(false)}
        >
          <Modal.Header closeButton>
            <Modal.Title>Confirm GUID Removal</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Are you sure you want to remove this user's guid?
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setShowConfirmRevokeGUID(false)}
            >
              Cancel
            </Button>
            <Button variant="danger" onClick={handleRevokeGUIDConfirm}>
              Remove GUID
            </Button>
          </Modal.Footer>
        </Modal>
      </>
    </Container>
  );
};

export default ViewAppUser;
