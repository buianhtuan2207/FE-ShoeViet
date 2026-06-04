import axios from 'axios';

// Khởi tạo instance với cấu hình cơ bản
const API = axios.create({
    baseURL: 'http://localhost:8080/api', // Đường dẫn gốc tới Backend Spring Boot
    headers: {
        'Content-Type': 'application/json',
    }
});

// Cấu hình Interceptor: Tự động "bắn" token vào header trước khi gửi request đi
API.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`; // Đính kèm token dạng Bearer
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default API;