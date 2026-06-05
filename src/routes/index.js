import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../layout/MainLayout';
import Home from "../pages/Home";
import Product from "../pages/Product";
import ProductDetail from "../pages/ProductDetail";
import SearchResults from "../pages/SearchResults";
import Cart from "../pages/Cart";
import Checkout from "../pages/Checkout";
import Register from "../pages/Register";
import Login from "../pages/Login";
import ForgotPassword from "../pages/ForgotPassword";
import OTPVerification from "../pages/OTPVerification";
import ResetPassword from "../pages/ResetPassword";
import Admin from "../pages/Admin";
import Person from '../pages/Person';
import History from '../pages/History';

import ProtectedRoute from '../components/ProtectedRoute';

function AppRoutes() {
    return (
        <Routes>
            {/* 0. Trang thông báo khi cố tình vào trang không có quyền */}
            <Route path="/unauthorized" element={
                <div style={{ textAlign: 'center', marginTop: '100px', fontFamily: 'sans-serif' }}>
                    <h2 style={{ color: '#dc2626' }}>403 - Truy cập bị từ chối!</h2>
                    <p>Bạn không có quyền hạn để xem nội dung này.</p>
                </div>
            } />

            {/* 1. ROUTE CHO ADMIN: Được bảo vệ riêng và KHÔNG dùng MainLayout */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                <Route path="/admin" element={<Admin />} />
            </Route>

            {/* 2. Nhóm Route dùng MainLayout (Cần Header/Footer/Sidebar) */}
            <Route element={<MainLayout />}>

                {/* --- NHÓM PUBLIC ROUTES: Ai cũng có thể truy cập tự do --- */}
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/verify-otp" element={<OTPVerification />} />
                <Route path="/reset-password" element={<ResetPassword />} />

                <Route path="/" element={<Home />} />
                <Route path="/product" element={<Product />} />
                <Route path="/search" element={<SearchResults />} />
                <Route path="/detail/:id" element={<ProductDetail />} />
                <Route path="/cart" element={<Cart />} /> {/* Giỏ hàng cho xem tự do */}

                {/* --- NHÓM PROTECTED ROUTES (CUSTOMER): Bắt buộc đăng nhập quyền Customer mới được Checkout --- */}
                <Route element={<ProtectedRoute allowedRoles={['customer']} />}>
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/my-profile" element={<Person />} />
                    <Route path="/history" element={<History />} />
                    {/* Nếu sau này bạn có thêm trang /profile, /order-history... thì ném vào đây luôn */}
                </Route>

                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                
                
            </Route>

            {/* 3. Xử lý khi người dùng nhập sai URL (Redirect về Home) */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

export default AppRoutes;