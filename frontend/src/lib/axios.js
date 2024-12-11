import axios from 'axios'

const axiosInstance = axios.create({
    baseURL: "http://localhost:5000/api",
    withCredentials: true, // get the access of cookies and etc. from frontend
});

export default axiosInstance;