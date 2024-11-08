// src/api/axios.js
import axios from "axios";

const BASE_URL = "http://localhost:5000/api"; // Adjust the base URL as needed

export default axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

export const axiosPrivate = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});
