import React, { useState, useEffect } from 'react';
import './Header.css';
import { Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import brandService from '../../services/BrandService';
import categoryService from '../../services/CategoryService';

function Header() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    // Khai báo thêm State để lưu dữ liệu Menu từ API
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);

    // 1. EFFECT 1: Lấy danh sách Categories và Brands từ API (Chỉ chạy 1 lần khi load trang)
    useEffect(() => {
        const fetchMenuData = async () => {
            try {
                const [categoriesData, brandsData] = await Promise.all([
                    categoryService.getAllCategories(),
                    brandService.getAllBrands()
                ]);
                setCategories(categoriesData || []);
                setBrands(brandsData || []);
            } catch (error) {
                console.error("Lỗi khi lấy dữ liệu cấu trúc menu công khai:", error);
            }
        };
        fetchMenuData();
    }, []);

    // 2. EFFECT 2: Kiểm tra trạng thái đăng nhập và hạn Token (Giữ nguyên logic chuẩn của bạn)
    useEffect(() => {
        const checkUserData = () => {
            const token = localStorage.getItem('accessToken');
            const userInfo = localStorage.getItem('userInfo');

            if (token && userInfo) {
                try {
                    const decoded = jwtDecode(token);
                    const currentTime = Date.now() / 1000;

                    if (decoded.exp < currentTime) {
                        console.warn("Token ở Header đã hết hạn! Tự động xóa trạng thái đăng nhập...");
                        localStorage.removeItem('accessToken');
                        localStorage.removeItem('userInfo');
                        setUser(null);
                    } else {
                        setUser(JSON.parse(userInfo));
                    }
                } catch (error) {
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('userInfo');
                    setUser(null);
                }
            } else {
                setUser(null);
            }
        };

        checkUserData();
        window.addEventListener('authChange', checkUserData);
        return () => {
            window.removeEventListener('authChange', checkUserData);
        };
    }, []);

    const getInitials = (name) => {
        if (!name) return '';
        const words = name.trim().split(/\s+/);
        if (words.length === 1) return words[0].charAt(0).toUpperCase();
        return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
    };

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('userInfo');
        setUser(null);
        window.dispatchEvent(new Event('authChange'));
        navigate('/login');
    };

    return (
        <nav className="header-nav">
            <div className="header-container">

                {/* 1. Logo */}
                <Link className="header-logo" to="/">
                    SHOEVIET
                </Link>

                {/* 2. Menu Links (Đã sửa đổi thành cấu trúc Dropdown đa cột) */}
                <div className="header-links">
                    <Link className="nav-link" to="/">Trang chủ</Link>

                    {/* KHỐI DROPDOWN SẢN PHẨM MỚI */}
                    <div className="nav-item-dropdown">
                        <span className="nav-link dynamic-toggle">
                            Sản phẩm
                            <span className="material-symbols-outlined dropdown-arrow">expand_more</span>
                        </span>

                        {/* Khung chứa các cột phân loại */}
                        <div className="mega-menu">
                            {/* Cột 1: Danh mục - Đổi thành /product */}
                            <div className="mega-column">
                                <h4 className="mega-title">Danh mục</h4>
                                {categories.slice(0, 6).map((cat) => (
                                    <Link key={cat.id} to={`/product?categoryId=${cat.id}`} className="mega-item">
                                        {cat.name}
                                    </Link>
                                ))}
                            </div>

                            {/* Cột 2: Thương hiệu - Đổi thành /product */}
                            <div className="mega-column">
                                <h4 className="mega-title">Thương hiệu</h4>
                                {brands.slice(0, 6).map((brand) => (
                                    <Link key={brand.id} to={`/product?brandId=${brand.id}`} className="mega-item">
                                        {brand.name}
                                    </Link>
                                ))}
                            </div>

                            {/* Cột 3: Bộ sưu tập & Ưu đãi */}
                            <div className="mega-column">
                                <h4 className="mega-title">Xu hướng</h4>
                                {/* ĐÃ SỬA: Đổi từ /products?sort=Newest thành /product?sortBy=Newest */}
                                <Link to="/product?sortBy=Newest" className="mega-item highlight-new">
                                    <span className="badge-dot new"></span> Hàng mới về
                                </Link>
                                <Link to="/product?category=promotion" className="mega-item highlight-promo">
                                    <span className="badge-dot promo"></span> Khuyến mãi hot
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Thanh tìm kiếm */}
                <div className="search-container">
                    <span className="material-symbols-outlined search-icon">search</span>
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Tìm kiếm..."
                    />
                </div>

                {/* 4. Các nút Icon */}
                <div className="header-icons">
                    <Link to="/cart" className="action-button">
                        <span className="material-symbols-outlined">shopping_cart</span>
                    </Link>
                    <button className="action-button">
                        <span className="material-symbols-outlined">favorite_border</span>
                    </button>

                    {user ? (
                        <div className="profile-menu-container">
                            <div className="user-avatar-wrapper">
                                <div className="user-avatar">
                                    {getInitials(user.fullName)}
                                </div>
                                <span className="user-fullname">{user.fullName}</span>
                            </div>

                            <div className="dropdown-menu">
                                {user.role === 'admin' && (
                                    <Link to="/admin" className="dropdown-item" style={{ color: '#2563eb' }}>
                                        <span className="material-symbols-outlined" style={{ color: '#2563eb' }}>dashboard</span>
                                        Trang quản trị Admin
                                    </Link>
                                )}
                                <Link to="/person" className="dropdown-item">
                                    <span className="material-symbols-outlined">account_circle</span>
                                    Thông tin tài khoản
                                </Link>
                                <button onClick={handleLogout} className="dropdown-item logout-btn">
                                    <span className="material-symbols-outlined">logout</span>
                                    Đăng xuất
                                </button>
                            </div>
                        </div>
                    ) : (
                        <Link to="/login" className="action-button">
                            <span className="material-symbols-outlined">person</span>
                        </Link>
                    )}
                </div>

            </div>
        </nav>
    );
}

export default Header;