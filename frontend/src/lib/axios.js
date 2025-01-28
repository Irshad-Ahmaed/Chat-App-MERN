import axios from 'axios'

const axiosInstance = axios.create({
    baseURL: import.meta.env.MODE === "development" ? "http://localhost:5000/api" : "https://chat-app-mern-kappa.vercel.app/api",
    withCredentials: true, // get the access of cookies and etc. from frontend
});

export default axiosInstance;