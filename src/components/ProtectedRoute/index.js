// src/components/ProtectedRoute/index.js
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ allowedRoles }) => {
    const token = localStorage.getItem('accessToken');
    const userInfo = localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')) : null;

    // Trường hợp 1: Chưa đăng nhập -> Đá ngay về trang Login
    if (!token || !userInfo) {
        return <Navigate to="/login" replace />;
    }

    // Trường hợp 2: Đã đăng nhập nhưng sai Quyền (Role) -> Đá về trang báo lỗi hoặc Trang chủ
    if (allowedRoles && !allowedRoles.includes(userInfo.role)) {
        return <Navigate to="/unauthorized" replace />;
    }

    // Trường hợp 3: Hợp lệ -> Cho phép đi tiếp vào các trang con bên trong (Outlet)
    return <Outlet />;
};

export default ProtectedRoute;