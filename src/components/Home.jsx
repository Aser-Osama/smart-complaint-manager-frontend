// src/components/Home.js
import React from "react";
import { Button } from "react-bootstrap";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="container mt-5">
      <h2>Home</h2>
      <p>Welcome to the home page.</p>
      <Link to="/logout">
        <Button variant="primary">Logout</Button>
      </Link>
    </div>
  );
};

export default Home;
