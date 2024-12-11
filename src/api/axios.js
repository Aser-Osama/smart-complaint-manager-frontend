// src/api/axios.js
import axios from "axios";

//const BASE_URL = import.meta.env.VITE_BACKEND_URL
//console.log(BASE_URL)
const BASE_URL = import.meta.env.MODE.toLowerCase() === 'production' ? "http://152.53.50.164:3030/api" : "http://localhost:5000/api";
console.log(BASE_URL)
export default axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

export const axiosPrivate = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});
