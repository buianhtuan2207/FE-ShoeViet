import React, { useState, useEffect } from 'react';
import './Header.css';
import { Link, useNavigate } from 'react-router-dom';

function Header() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    // Kiểm tra trạng thái đăng nhập khi Component được tải
    useEffect(() => {
        // Tạo một hàm riêng để check localStorage
        const checkUserData = () => {
            const userInfo = localStorage.getItem('userInfo');
            if (userInfo) {
                setUser(JSON.parse(userInfo));
            } else {
                setUser(null); // Đảm bảo clear state nếu không có data
            }
        };

        // 1. Chạy lần đầu tiên khi web load
        checkUserData();

        // 2. Lắng nghe "pháo hiệu" từ trang Login (hoặc bất kỳ đâu)
        window.addEventListener('authChange', checkUserData);

        // 3. Dọn dẹp listener khi Component bị hủy (Best practice)
        return () => {
            window.removeEventListener('authChange', checkUserData);
        };
    }, []);

    // Hàm tách lấy chữ cái đầu của từ ĐẦU TIÊN và từ CUỐI CÙNG
    // Ví dụ: "Nguyễn Văn A" -> "NA", "Trần Anh" -> "TA", "John" -> "J"
    const getInitials = (name) => {
        if (!name) return '';
        const words = name.trim().split(/\s+/);
        if (words.length === 1) return words[0].charAt(0).toUpperCase();
        return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
    };

    // Hàm xử lý Đăng xuất
    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('userInfo');
        setUser(null); // Xóa state user để lập tức chuyển về icon Login
        navigate('/login');
    };

    return (
        <nav className="header-nav">
            <div className="header-container">

                {/* 1. Logo */}
                <Link className="header-logo" to="/">
                    SHOEVIET
                </Link>

                {/* 2. Menu Links */}
                <div className="header-links">
                    <Link className="nav-link" to="/products?category=men">Men</Link>
                    <Link className="nav-link" to="/products?category=women">Women</Link>
                    <Link className="nav-link" to="/products?category=kid">Kid</Link>
                    <Link className="nav-link" to="/products?category=promotion">Promotion</Link>
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

                {/* 4. Các nút Icon (Nằm bên phải) */}
                <div className="header-icons">
                    <Link to="/cart" className="action-button">
                        <span className="material-symbols-outlined">shopping_cart</span>
                    </Link>
                    <button className="action-button">
                        <span className="material-symbols-outlined">favorite_border</span>
                    </button>

                    {/* XỬ LÝ ĐỔI AVATAR / LOGIN TẠI ĐÂY */}
                    {user ? (
                        <div className="profile-menu-container">
                            <div className="user-avatar-wrapper">
                                <div className="user-avatar">
                                    {getInitials(user.fullName)}
                                </div>
                                <span className="user-fullname">{user.fullName}</span>
                            </div>

                            <div className="dropdown-menu">
                                {/* NÚT BONUS: Chỉ hiển thị nếu user có role là admin */}
                                {user.role === 'admin' && (
                                    <Link to="/admin" className="dropdown-item" style={{ color: '#2563eb' }}>
                                        <span className="material-symbols-outlined" style={{ color: '#2563eb' }}>dashboard</span>
                                        Trang quản trị Admin
                                    </Link>
                                )}

                                <Link to="/profile" className="dropdown-item">
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
                    <Link to="/person" className="action-button">
                        <span className="material-symbols-outlined">person</span>
                    </Link>
                </div>

            </div>
        </nav>
    );
}

export default Header;