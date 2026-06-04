// src/services/authService.js
const BASE_URL = 'http://localhost:8080/api/auth';

const authService = {
    // 1. Chức năng Đăng ký
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

    // 2. Chức năng Xác thực OTP Đăng ký (Kích hoạt tài khoản)
    verifyOtp: async (otpCode) => {
        try {
            const response = await fetch(`${BASE_URL}/verify-otp?otp=${otpCode}`, {
                method: 'POST',
                headers: {
                    // Có thể bỏ dòng 'Content-Type': 'application/json' vì luồng này gửi RequestParam qua URL, không gửi body
                    'Content-Type': 'application/json',
                }
            });

            // SỬA Ở ĐÂY: Đổi từ response.json() thành response.text()
            const data = await response.text();

            if (!response.ok) {
                throw new Error(data || 'Mã OTP không hợp lệ hoặc đã hết hạn!');
            }

            return data; // Trả về chuỗi text thuần túy cho giao diện hiển thị
        } catch (error) {
            throw error;
        }
    },

    // 3. Chức năng Xác thực OTP Quên mật khẩu
    // BE nhận @RequestBody dạng JSON: { email: "...", otp: "..." }
    verifyForgotOtp: async (payload) => {
        try {
            const response = await fetch(`${BASE_URL}/verify-forgot-otp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            const data = await response.text(); // Đọc dạng text tương tự vì BE trả về String

            if (!response.ok) {
                throw new Error(data || 'Xác thực OTP quên mật khẩu thất bại!');
            }

            return data;
        } catch (error) {
            throw error;
        }
    },

    // 4. Chức năng Đăng nhập
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

    forgotPassword: async (email) => {
        try {
            const response = await fetch(`${BASE_URL}/forgot-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: email })
            });

            const data = await response.text();

            if (!response.ok) {
                throw new Error(data || 'Gửi yêu cầu thất bại!');
            }

            return data;
        } catch (error) {
            throw error;
        }
    },
    resetPassword: async (payload) => {
        try {
            const response = await fetch(`${BASE_URL}/reset-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: payload.email,
                    otp: payload.otp,
                    newPassword: payload.newPassword
                })
            });

            const data = await response.text(); // BE trả về String text thuần túy

            if (!response.ok) {
                throw new Error(data || 'Đặt lại mật khẩu thất bại!');
            }

            return data;
        } catch (error) {
            throw error;
        }
    },
};

export default authService;