import { useState, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import { Navbar, Nav, Container } from "react-bootstrap";
import NavDropdown from "react-bootstrap/NavDropdown";
import useAuth from "../hooks/useAuth";
import useAxiosPrivate from "../hooks/useAxiosPrivate";

const NavBar = () => {
  const { auth } = useAuth();
  const axiosPrivate = useAxiosPrivate();

  const [contractType, setContractType] = useState("all");
  const [contractTypeList, setContractTypeList] = useState([]);

  const fetchContractTypes = async () => {
    try {
      const response = await axiosPrivate.get("/schema/types");
      const responseData = [{ contract_type: "All" }, ...response.data];

      const types = responseData.map((type, index) => ({
        id: index + 1,
        name: type.contract_type.replace(/^./, (str) => str.toUpperCase()),
        linkTo: `/contracts/${type.contract_type}`,
      }));
      setContractTypeList(types);
      setContractType("all");
    } catch (error) {
      console.error("Failed to fetch contract types", error);
    }
  };

  useEffect(() => {
    fetchContractTypes();
  }, []);

  if (!auth || !auth.accessToken) {
    return null;
  }

  return (
    <Navbar bg="light" expand="lg">
      <Container>
        <Navbar.Brand as={Link} to="/">
          Smart Complaint System
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={NavLink} to="/" end>
              Home
            </Nav.Link>
            <NavDropdown title="Filter Contract Type" id="basic-nav-dropdown">
              {contractTypeList.map((contractTypeItem) => (
                <NavDropdown.Item
                  key={contractTypeItem.id}
                  as={NavLink}
                  to={`${contractTypeItem.linkTo}`}
                  active={contractType === contractTypeItem.name.toLowerCase()}
                  onClick={() =>
                    setContractType(contractTypeItem.name.toLowerCase())
                  }
                >
                  {contractTypeItem.name}
                </NavDropdown.Item>
              ))}
            </NavDropdown>
          </Nav>
          <Nav>
            <Nav.Link as={NavLink} to="/logout">
              Logout
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavBar;
