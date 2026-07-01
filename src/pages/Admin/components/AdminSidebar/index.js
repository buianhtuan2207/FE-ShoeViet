import React from 'react';
import styles from './AdminSidebar.module.scss';

const navItems = [
    { id: 'dashboard', label: 'Bảng điều khiển', icon: 'dashboard' },
    { id: 'accounts', label: 'Quản lý tài khoản', icon: 'group' },
    { id: 'products', label: 'Quản lý sản phẩm', icon: 'inventory_2' },
    { id: 'categories', label: 'Quản lý danh mục', icon: 'category' },
    { id: 'brands', label: 'Quản lý thương hiệu', icon: 'branding_watermark' },
    { id: 'coupons', label: 'Quản lý mã giảm giá', icon: 'sell' },
    { id: 'orders', label: 'Quản lý đơn hàng', icon: 'shopping_cart' },
];

// Nhận 2 props quản lý trạng thái từ Admin Layout truyền xuống
function AdminSidebar({ currentTab, onChangeTab }) {
    return (
        <aside className={styles.sidebar}>
            {/* Header */}
            <div className={styles.header}>
                <h1 className={styles.title}>SHOEVIET</h1>
                <p className={styles.subtitle}>Hệ thống Quản trị</p>
            </div>

            {/* Navigation */}
            <nav className={styles.nav}>
                {navItems.map((item) => {
                    // Kiểm tra động xem item này có trùng với tab đang được chọn không
                    const isActive = item.id === currentTab;

                    return (
                        <a
                            key={item.id}
                            href={`#${item.id}`}
                            className={`${styles.navItem} ${isActive ? styles.activeNavItem : ''}`}
                            onClick={(e) => {
                                e.preventDefault(); // Ngăn nhảy hash bậy bạ trên URL
                                onChangeTab(item.id); // Kích hoạt hàm đổi trạng thái tab ở component cha
                            }}
                        >
                            <span
                                className={`material-symbols-outlined ${styles.icon}`}
                                data-icon={item.icon}
                            >
                                {item.icon}
                            </span>
                            <span>{item.label}</span>
                        </a>
                    );
                })}
            </nav>

            {/* Footer / Logout */}
            <div className={styles.footer}>
                <button className={styles.logoutButton}>
                    <span
                        className={`material-symbols-outlined ${styles.icon}`}
                        data-icon="logout"
                    >
                        logout
                    </span>
                    <span>Đăng xuất</span>
                </button>
            </div>
        </aside>
    );
}

export default AdminSidebar;