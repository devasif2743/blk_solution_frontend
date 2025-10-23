
import axios, { AxiosError, AxiosInstance } from "axios";
const BASE_URL_1="http://192.168.1.15:5000/api"
// const BASE_URL_2="http://192.168.29.102:5000/api"
// const BASE_URL_2="http://wilcartapi.nearbydoctors.in/api"
const BASE_URL_2="http://127.0.0.1:8000/api"
const BASE_URL =BASE_URL_2;
const api: AxiosInstance = axios.create({
  baseURL: BASE_URL_2,
  timeout: 30_000, 
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});
api.interceptors.request.use(
  (config) => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (err) {
     alert(err)
    }
    return config;
  },
  (error) => Promise.reject(error)
);
api.interceptors.response.use(
  (resp) => resp,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      try {
        localStorage.removeItem("auth_token");
      } catch (e) {}
    }
    return Promise.reject(error);
  }
);
export default api;
