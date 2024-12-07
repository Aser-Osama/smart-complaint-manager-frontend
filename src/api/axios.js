// src/api/axios.js
import axios from "axios";

// const BASE_URL = import.meta.env.VITE_BACKEND_URL 
const BASE_URL = "http://localhost:5000/api";
export default axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

export const axiosPrivate = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});
