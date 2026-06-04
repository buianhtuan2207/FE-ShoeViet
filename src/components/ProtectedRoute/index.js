import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; // 1. Import thư viện giải mã token

const ProtectedRoute = ({ allowedRoles }) => {
    const token = localStorage.getItem('accessToken');
    const userInfo = localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')) : null;

    // --- TRƯỜNG HỢP 1: CHƯA ĐĂNG NHẬP (KHÔNG CÓ DATA) ---
    if (!token || !userInfo) {
        return <Navigate to="/login" replace />;
    }

    // --- BỔ SUNG: KIỂM TRA HẠN SỬ DỤNG THẬT CỦA TOKEN ---
    try {
        const decoded = jwtDecode(token); // Giải mã cấu trúc token
        const currentTime = Date.now() / 1000; // Thời gian hiện tại (tính bằng giây)

        // Nếu thời gian hiện tại lớn hơn thời gian hết hạn (exp) của Token Backend cấp
        if (decoded.exp < currentTime) {
            console.warn("Token đã hết hạn sử dụng! Đang đăng xuất tự động...");

            // Xóa sạch dấu vết cũ trong localStorage để lần sau không bị lặp lại
            localStorage.removeItem('accessToken');
            localStorage.removeItem('userInfo');

            // Đá người dùng về trang login
            return <Navigate to="/login" replace />;
        }
    } catch (error) {
        console.error("Token không hợp lệ:", error);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('userInfo');
        return <Navigate to="/login" replace />;
    }

    // --- TRƯỜNG HỢP 2: ĐÃ ĐĂNG NHẬP NHƯNG SAI QUYỀN (ROLE) ---
    if (allowedRoles && !allowedRoles.includes(userInfo.role)) {
        return <Navigate to="/unauthorized" replace />;
    }

    // --- TRƯỜNG HỢP 3: HỢP LỆ VÀ CÒN HẠN -> CHO ĐI TIẾP ---
    return <Outlet />;
};

export default ProtectedRoute;