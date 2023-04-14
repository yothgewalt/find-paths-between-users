import axios, { AxiosError } from "axios";

const axiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:8000",
});

axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem("authentication_token");

    if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
    }

    return config;
});

axiosInstance.interceptors.response.use(
    (response) => response.data,
    (err: AxiosError) => {
        if ((err.response?.data as any)?.message) {
            return Promise.reject(err.response?.data);
        }

        if (err.message) {
            return Promise.reject({
                message: err.message,
            })
        }

        return Promise.reject({
            message: 'ไม่สามารถติดต่อกับเซิร์ฟเวอร์ปลายทาง',
        })
    }
);

export default axiosInstance;
