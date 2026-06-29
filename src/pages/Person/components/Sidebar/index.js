import React from 'react';
import styles from '../../Person.module.scss'; // Import CSS từ thư mục cha

const Sidebar = ({ userName, activeTab, setActiveTab }) => {
    // Hàm hỗ trợ chuyển tab không bị nhảy trang (ngăn href="#")
    const handleTabClick = (e, tabName) => {
        e.preventDefault();
        setActiveTab(tabName);
    };

    return (
        <aside className={styles.sidebar}>
            <div className={styles.sidebarInner}>
                <div className={styles.userInfo}>
                    <div className={styles.avatar}>
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                            person
                        </span>
                    </div>
                    <div>
                        <p className={styles.name}>{userName || 'Người dùng'}</p>
                        <p className={styles.badge}>Thành viên</p>
                    </div>
                </div>
                <nav className={styles.nav}>
                    <a
                        className={`${styles.navItem} ${activeTab === 'profile' ? styles.active : ''}`}
                        href="#profile"
                        onClick={(e) => handleTabClick(e, 'profile')}
                    >
                        <span className="material-symbols-outlined">account_circle</span>
                        Hồ sơ
                    </a>
                    <a className={styles.navItem} href="#orders">
                        <span className="material-symbols-outlined">shopping_bag</span>
                        Đơn hàng
                    </a>
                    <a className={styles.navItem} href="#favorites">
                        <span className="material-symbols-outlined">favorite</span>
                        Yêu thích
                    </a>
                    <a
                        className={`${styles.navItem} ${activeTab === 'password' ? styles.active : ''}`}
                        href="#password"
                        onClick={(e) => handleTabClick(e, 'password')}
                    >
                        <span className="material-symbols-outlined">lock_reset</span>
                        Đổi mật khẩu
                    </a>
                    <div className={styles.divider}></div>
                    <a className={`${styles.navItem} ${styles.danger}`} href="#logout">
                        <span className="material-symbols-outlined">logout</span>
                        Đăng xuất
                    </a>
                </nav>
            </div>
        </aside>
    );
};

export default Sidebar;