// src/context/AuthContext.js
import React, { createContext, useState, useEffect } from "react";
import axios from "../api/axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    accessToken: localStorage.getItem("accessToken") || null,
    user: null,
    role: null,
    id: null,
    token_expiry: null,
  });
  const [loading, setLoading] = useState(true);

  const parseJwt = (token) => {
    try {
      return JSON.parse(atob(token.split(".")[1]));
    } catch (error) {
      console.error("Failed to parse JWT", error);
      return null;
    }
  };

  const login = async (email, password) => {
    // eslint-disable-next-line no-useless-catch
    try {
      const response = await axios.post(
        "/auth",
        { email, password },
        { withCredentials: true }
      );
      const { accessToken } = response.data;
      const decoded = parseJwt(accessToken);
      setAuth({
        accessToken,
        user: decoded.UserInfo.email,
        role: decoded.UserInfo.role,
        id: decoded.UserInfo.id,
        token_expiry: decoded.exp,
      });
      localStorage.setItem("accessToken", accessToken);
    } catch (error) {
      throw error;
    }
  };

  const refreshAccessToken = async () => {
    try {
      const response = await axios.get("/auth/refresh", {
        withCredentials: true,
      });
      console.log("Refreshed access token", response);
      const { accessToken } = response.data;
      const decoded = parseJwt(accessToken);
      setAuth((prev) => ({
        ...prev,
        accessToken,
        user: decoded.UserInfo.email,
        role: decoded.UserInfo.role,
        id: decoded.UserInfo.id,
        token_expiry: decoded.exp,
      }));
      localStorage.setItem("accessToken", accessToken);
      return accessToken;
    } catch (error) {
      console.error("Failed to refresh access token", error);
      logout();
      return null;
    }
  };

  const logout = async () => {
    try {
      await axios.post("/auth/logout", null, { withCredentials: true });
      setAuth({ accessToken: null, user: null, role: null });
      localStorage.removeItem("accessToken");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  useEffect(() => {
    const existingToken = localStorage.getItem("accessToken");
    if (existingToken) {
      const decoded = parseJwt(existingToken);
      setAuth({
        accessToken: existingToken,
        user: decoded.UserInfo.email,
        role: decoded.UserInfo.role,
        id: decoded.UserInfo.id,
        token_expiry: decoded.exp,
      });
    }
    setLoading(false); // Set loading to false once auth state is set
  }, []);

  return (
    <AuthContext.Provider
      value={{ auth, loading, login, refreshAccessToken, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};
