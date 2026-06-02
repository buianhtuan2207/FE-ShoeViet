// src/services/authService.js
const BASE_URL = 'http://localhost:8080/api/auth';

const authService = {
    // Chức năng Đăng ký
    register: async (userData) => {
        try {
            const response = await fetch(`${BASE_URL}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    fullName: userData.fullName,
                    phone: userData.phone,
                    email: userData.email,
                    password: userData.password,
                    role: 'customer' // Mặc định như BE yêu cầu
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Đăng ký thất bại!');
            }

            return data;
        } catch (error) {
            throw error;
        }
    },

    // Bạn có thể dễ dàng mở rộng thêm các hàm khác ở đây một cách gọn gàng
    verifyOtp: async (otpCode) => {
        try {
            const response = await fetch(`${BASE_URL}/verify-otp?otp=${otpCode}`, {
                method: 'POST',
            });
            const data = await response.text(); // BE trả về String thuần túy thay vì JSON
            if (!response.ok) throw new Error(data);
            return data;
        } catch (error) {
            throw error;
        }
    },

    login: async (credentials) => {
        try {
            const response = await fetch(`${BASE_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: credentials.email,
                    password: credentials.password
                }),
            });

            // Nếu BE trả về lỗi 400 (Sai pass hoặc chưa xác thực OTP) thì BE trả về String/Text thay vì JSON
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Đăng nhập thất bại!');
            }

            // Thành công thì BE trả về LoginResponse dạng JSON
            const data = await response.json();
            return data;
        } catch (error) {
            throw error;
        }
    },
};

export default authService;