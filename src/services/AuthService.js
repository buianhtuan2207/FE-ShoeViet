import API from './api';

const authService = {
    // 1. Chức năng Đăng ký
    register: async (userData) => {
        const response = await API.post('/auth/register', {
            fullName: userData.fullName,
            phone: userData.phone,
            email: userData.email,
            password: userData.password,
            role: 'customer'
        });
        return response.data;
    },

    // 2. Xác thực OTP Đăng ký
    verifyOtp: async (otpCode) => {
        const response = await API.post(`/auth/verify-otp?otp=${otpCode}`);
        return response.data;
    },

    // 3. Xác thực OTP Quên mật khẩu
    verifyForgotOtp: async (payload) => {
        const response = await API.post('/auth/verify-forgot-otp', payload);
        return response.data;
    },

    // 4. Chức năng Đăng nhập
    login: async (credentials) => {
        const response = await API.post('/auth/login', {
            email: credentials.email,
            password: credentials.password
        });
        return response.data;
    },

    // 5. Gửi yêu cầu quên mật khẩu
    forgotPassword: async (email) => {
        const response = await API.post('/auth/forgot-password', { email });
        return response.data;
    },

    // 6. Đặt lại mật khẩu mới
    resetPassword: async (payload) => {
        const response = await API.post('/auth/reset-password', payload);
        return response.data;
    },
};

export default authService;