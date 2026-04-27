import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../layout/MainLayout';
import Home from "../pages/Home";
import Product from "../pages/Product";


function AppRoutes() {
    return (
        <Routes>
            {/* 1. Route cho trang Login: KHÔNG dùng MainLayout */}

            {/* 2. Nhóm Route dùng MainLayout (Cần Header/Footer/Sidebar) */}
            <Route element={<MainLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/product" element={<Product />} />
            </Route>

            {/* 3. Xử lý khi người dùng nhập sai URL (Redirect về Home hoặc trang 404) */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

export default AppRoutes;