import React, { useState, useEffect } from 'react';
import styles from './AdminHeader.module.scss';
import { useNavigate, Link } from 'react-router-dom'; // Bổ sung useNavigate để thực hiện đăng xuất

function AdminHeader({ title = "Bảng điều khiển" }) {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    // Lấy thông tin admin từ localStorage và lắng nghe thay đổi trạng thái
    useEffect(() => {
        const checkUserData = () => {
            const userInfo = localStorage.getItem('userInfo');
            if (userInfo) {
                setUser(JSON.parse(userInfo));
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

    // Hàm tách lấy chữ cái đầu của từ ĐẦU TIÊN và từ CUỐI CÙNG
    const getInitials = (name) => {
        if (!name) return 'AD';
        const words = name.trim().split(/\s+/);
        if (words.length === 1) return words[0].charAt(0).toUpperCase();
        return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
    };

    // Hàm xử lý Đăng xuất cho Admin
    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('userInfo');
        window.dispatchEvent(new Event('authChange')); // Báo trạng thái đăng xuất cho toàn bộ App
        navigate('/login');
    };

    return (
        <header className={styles.header}>

            {/* Left Section: Tiêu đề và Thanh tìm kiếm */}
            <div className={styles.leftSection}>
                <h2 className={styles.title}>{title}</h2>

                <div className={styles.searchContainer}>
                    <span className={`material-symbols-outlined ${styles.searchIcon}`} data-icon="search">
                        search
                    </span>
                    <input
                        className={styles.searchInput}
                        placeholder="Tìm kiếm dữ liệu..."
                        type="text"
                    />
                </div>
            </div>

            {/* Right Section: Nút chức năng và Hồ sơ */}
            <div className={styles.rightSection}>
                <button className={styles.iconButton}>
                    <span className={`material-symbols-outlined ${styles.icon}`} data-icon="notifications">
                        notifications
                    </span>
                    <span className={styles.notificationBadge}></span>
                </button>

                <button className={styles.iconButton}>
                    <span className={`material-symbols-outlined ${styles.icon}`} data-icon="settings">
                        settings
                    </span>
                </button>

                {/* Vạch kẻ phân cách */}
                <div className={styles.divider}></div>

                {/* KHỐI TÀI KHOẢN ADMIN ĐÃ ĐƯỢC BỌC ĐỂ LÀM DROPDOWN */}
                <div className={styles.profileWrapper}>
                    <div className={styles.profileSection}>
                        <div className={styles.profileInfo}>
                            <p className={styles.profileName}>{user?.fullName || "Admin Lab"}</p>
                            <p className={styles.profileRole}>
                                {user?.role === 'admin' ? 'Quản trị viên' : 'Quản lý'}
                            </p>
                        </div>
                        <div className={styles.avatarWrapper}>
                            {/* Chuyển từ thẻ <img> sang khối div chứa chữ cái viết tắt */}
                            <div className={styles.userAvatar}>
                                {getInitials(user?.fullName)}
                            </div>
                        </div>
                    </div>

                    {/* Menu Dropdown xuất hiện khi di chuột vào .profileWrapper */}
                    <div className={styles.dropdownMenu}>
                        <Link to="/" className={styles.dropdownItem}>
                            <span className="material-symbols-outlined">store</span>
                            Xem trang chủ
                        </Link>
                        <button onClick={handleLogout} className={`${styles.dropdownItem} ${styles.logoutBtn}`}>
                            <span className="material-symbols-outlined">logout</span>
                            Đăng xuất
                        </button>
                    </div>
                </div>
            </div>

        </header>
    );
};

export default AdminHeader;