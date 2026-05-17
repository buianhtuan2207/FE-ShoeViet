import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../layout/MainLayout';
import Home from "../pages/Home";
import Product from "../pages/Product";
import ProductDetail from "../pages/ProductDetail";
import Cart from "../pages/Cart";
import Checkout from "../pages/Checkout";
import Register from "../pages/Register";
import Login from "../pages/Login";
import ForgotPassword from "../pages/ForgotPassword";
import OTPVerification from "../pages/OTPVerification";


function AppRoutes() {
    return (
        <Routes>
            {/* 1. Route cho trang Login: KHÔNG dùng MainLayout */}

            {/* 2. Nhóm Route dùng MainLayout (Cần Header/Footer/Sidebar) */}
            <Route element={<MainLayout />}>
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/verify-otp" element={<OTPVerification />} />
                <Route path="/" element={<Home />} />
                <Route path="/product" element={<Product />} />
                <Route path="/detail/:id" element={<ProductDetail />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
            </Route>

            {/* 3. Xử lý khi người dùng nhập sai URL (Redirect về Home hoặc trang 404) */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

export default AppRoutes;