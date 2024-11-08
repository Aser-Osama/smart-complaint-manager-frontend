// src/components/Logout.js
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const Logout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const performLogout = async () => {
      await logout();
      navigate("/login");
    };
    performLogout();
  }, [logout, navigate]);

  return <p>Logging out...</p>;
};

export default Logout;
