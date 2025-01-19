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

  const confirmUser = (userId) => {
    axiosPrivate.post(`/appusers/confirm-registration/${userId}`); // Use the passed userId
    setUsers(
      users.map((user) =>
        user.id === userId ? { ...user, registrationConfirmed: true } : user
      )
    );
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
    if (!text) return "No Data";
    return (
      <div
        style={{
          maxWidth: "100px",
          wordBreak: text.length > limit ? "break-word" : "normal",
          whiteSpace: text.length > limit ? "normal" : "nowrap",
        }}
        title={text}
      >
        {text}
      </div>
    );
  };

  return (
    <div className=" m-0 mt-5 ">

      <h1>User Management</h1>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>ID</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Email</th>
            <th>Company</th>
            <th>Business Phone</th>
            <th>Position</th>
            <th>Subscription Type</th>
            <th>User Token</th>
            <th>GUID</th>
            <th>Reg Confirmed</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.first_name}</td>
              <td>{user.last_name}</td>
              <td>{user.company_email_address}</td>
              <td>{user.company_name}</td>
              <td>{user.business_phone}</td>
              <td>{user.position_in_company}</td>
              <td>{user.SubscriptionType}</td>
              <td>{user.usertoken ? <WrapText text={user.usertoken} /> : "No Token"}</td>
              <td>{user.win_guid ? <WrapText text={user.win_guid} /> : "No GUID"}</td>
              <td>
                {user.registrationConfirmed ? (
                  "Confirmed"
                ) : (
                  <a
                    href="#"
                    onClick={() => {
                      confirmUser(user.id); // Pass user.id directly to the function
                    }}
                  >
                    No, Confirm Registration
                  </a>
                )}
              </td>

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

      {/* Modals */}
      {/* Token Modal */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Set New Token</Modal.Title>
        </Modal.Header>
        <Modal.Body>
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
                  Generate Token
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

      {/* Confirm Revoke Token Modal */}
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
          <Button variant="secondary" onClick={() => setShowConfirmRevoke(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleRevokeConfirm}>
            Revoke Token
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Confirm Revoke GUID Modal */}
      <Modal
        show={showConfirmRevokeGUID}
        onHide={() => setShowConfirmRevokeGUID(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirm GUID Removal</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to remove this user's GUID?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirmRevokeGUID(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleRevokeGUIDConfirm}>
            Remove GUID
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ViewAppUser;
