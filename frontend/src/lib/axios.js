import axios from 'axios'

const prod = 'https://chat-app-mern-lac.vercel.app'
const axiosInstance = axios.create({
    baseURL: `${import.meta.env.MODE === "development" ? "http://localhost:5000" : prod}/api`,
    withCredentials: true, // get the access of cookies and etc. from frontend
});

export default axiosInstance;