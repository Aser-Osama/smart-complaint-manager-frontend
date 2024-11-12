import "bootstrap/dist/css/bootstrap.min.css";
import { Outlet } from "react-router-dom";
import { Container, Row } from "react-bootstrap";
import NavBar from "./components/Navbar"; // Now it matches the component name

function App() {
  return (
    <div>
      <NavBar />
      <div className="d-flex justify-content-center align-items-start vh-100 mt-0">
        <Container fluid={true} className="px-5 mx-5">
          <Outlet />
        </Container>
      </div>
    </div>
  );
}
export default App;
