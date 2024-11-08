import "bootstrap/dist/css/bootstrap.min.css";
import { Outlet } from "react-router-dom";
import { Container } from "react-bootstrap";
import NavBar from "./components/NavBar"; // Now it matches the component name

function App() {
  return (
    <>
      <NavBar /> {/* Navbar should be persistent */}
      <Container className="container-xl p-3">
        <Outlet /> {/* Routed content will appear here */}
      </Container>
    </>
  );
}

export default App;
