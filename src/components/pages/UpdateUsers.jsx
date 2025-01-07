import { useEffect, useState } from "react";
import { Table, Button, Modal, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";

const UpdateUser = () => {
    const [users, setUsers] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({ name: "", email: "", role: "", password: "" });

    const navigate = useNavigate();
    const axiosPrivate = useAxiosPrivate();

    // Fetch users
    const fetchUsers = async () => {
        try {
            const response = await axiosPrivate.get("/users");
            setUsers(response.data);
        } catch (error) {
            console.error("Error fetching users", error);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // Handle delete
    // Handle delete
    const handleDelete = async (id) => {
        const confirmDelete1 = window.confirm("Deleting a user will delete all contracts and invoices associated with the user.");
        if (confirmDelete1) {
            const confirmDelete = window.confirm("This decision cannot be undone, are you sure you want to delete this user?");

            if (confirmDelete && confirmDelete1) {
                try {
                    await axiosPrivate.delete("/users", { data: { id } });
                    setUsers(users.filter((user) => user.id !== id));
                } catch (error) {
                    console.error("Error deleting user", error);
                }
            }
        }

    };
    // Handle edit
    const handleEdit = (user) => {
        setEditingUser(user);
        setFormData({
            name: user.name,
            email: user.email,
            role: user.role,
            password: "", // Keep empty initially
        });
        setShowModal(true);
    };

    // Handle form submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...formData, id: editingUser.id };
            if (!formData.password) delete payload.password; // Only send password if updated

            await axiosPrivate.patch("/users", payload);
            fetchUsers();
            setShowModal(false);
            setEditingUser(null);
        } catch (error) {
            console.error("Error updating user", error);
        }
    };

    return (
        <div className="container mt-4">
            <h2>Users</h2>
            <Button
                className="mb-3"
                onClick={() => navigate("/createuser")}
            >
                Create User
            </Button>
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => (
                        <tr key={user.id}>
                            <td>{user.id}</td>
                            <td>{user.name}</td>
                            <td>{user.email}</td>
                            <td>{user.role}</td>
                            <td>
                                <Button
                                    variant="warning"
                                    className="me-2"
                                    onClick={() => handleEdit(user)}
                                >
                                    Edit
                                </Button>
                                <Button
                                    variant="danger"
                                    onClick={() => handleDelete(user.id)}
                                >
                                    Delete
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            {/* Modal for editing user */}
            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit User</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Name</Form.Label>
                            <Form.Control
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Role</Form.Label>
                            <Form.Select
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                required
                            >
                                <option value="">Select Role</option>
                                <option value="admin">Admin</option>
                                <option value="user">User</option>
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Password</Form.Label>
                            <Form.Control
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                            <Form.Text>Leave blank to keep the existing password</Form.Text>
                        </Form.Group>
                        <Button type="submit" variant="primary">
                            Save Changes
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default UpdateUser;
