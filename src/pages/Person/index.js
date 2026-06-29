import React, { useState, useEffect } from 'react';
import styles from './Person.module.scss';
import { userService } from '../../services/UserService';

const Person = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        address: ''
    });

    const [loading, setLoading] = useState(true);

    // Lấy dữ liệu profile khi vừa vào trang
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                const data = await userService.getMyProfile();

                setFormData({
                    fullName: data.fullName || '',
                    email: data.email || '',
                    phone: data.phone || '',
                    address: data.address || ''
                });
            } catch (error) {
                console.error('Lỗi khi lấy thông tin người dùng:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    // Xử lý khi input thay đổi
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Xử lý lưu thông tin
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await userService.updateProfile(formData);
            alert('Cập nhật thông tin thành công!');
        } catch (error) {
            console.error('Lỗi khi cập nhật:', error);
            alert('Cập nhật thất bại. Vui lòng thử lại.');
        }
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', marginTop: '3rem', fontWeight: 'bold' }}>
                Đang tải dữ liệu...
            </div>
        );
    }

    return (
        <main className={styles.mainContainer}>
            {/* Profile Navigation Sidebar */}
            <aside className={styles.sidebar}>
                <div className={styles.sidebarInner}>
                    <div className={styles.userInfo}>
                        <div className={styles.avatar}>
                            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                                person
                            </span>
                        </div>
                        <div>
                            <p className={styles.name}>{formData.fullName || 'Người dùng'}</p>
                            <p className={styles.badge}>Thành viên</p>
                        </div>
                    </div>
                    <nav className={styles.nav}>
                        <a className={`${styles.navItem} ${styles.active}`} href="#profile">
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
                        <a className={styles.navItem} href="#password">
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

            {/* Main Content Area */}
            <section className={styles.contentArea}>
                <div className={styles.mainCard}>
                    <header className={styles.header}>
                        <h1>Thông tin cá nhân</h1>
                        <p>Cập nhật thông tin tài khoản và cách chúng tôi liên hệ với bạn.</p>
                    </header>

                    {/* Form Fields */}
                    <form className={styles.formGrid} onSubmit={handleSubmit}>
                        <div className={styles.formGroup}>
                            <label>Họ và tên</label>
                            <input
                                className={styles.inputControl}
                                placeholder="Nhập họ và tên"
                                type="text"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Email</label>
                            <input
                                className={styles.inputControl}
                                placeholder="Nhập địa chỉ email"
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                disabled
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Số điện thoại</label>
                            <input
                                className={styles.inputControl}
                                placeholder="Nhập số điện thoại"
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                            />
                        </div>
                        <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                            <label>Địa chỉ</label>
                            <textarea
                                className={styles.inputControl}
                                placeholder="Nhập địa chỉ của bạn"
                                rows="3"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                            ></textarea>
                        </div>
                        <div className={styles.formActions}>
                            <button
                                className={styles.btnCancel}
                                type="button"
                                onClick={() => window.location.reload()}
                            >
                                Hủy bỏ
                            </button>
                            <button className={styles.btnSubmit} type="submit">
                                Lưu thay đổi
                            </button>
                        </div>
                    </form>
                </div>

                {/* Additional Settings Card */}
                <div className={styles.settingsGrid}>
                    <div className={styles.settingCard}>
                        <div className={`${styles.iconWrapper} ${styles.security}`}>
                            <span className="material-symbols-outlined">security</span>
                        </div>
                        <div className={styles.settingInfo}>
                            <h4>Xác thực 2 lớp</h4>
                            <p>Tăng cường bảo mật cho tài khoản của bạn bằng cách thêm lớp xác thực.</p>
                            <button type="button">Thiết lập ngay</button>
                        </div>
                    </div>

                    <div className={styles.settingCard}>
                        <div className={`${styles.iconWrapper} ${styles.history}`}>
                            <span className="material-symbols-outlined">history</span>
                        </div>
                        <div className={styles.settingInfo}>
                            <h4>Lịch sử đăng nhập</h4>
                            <p>Xem lại các phiên đăng nhập gần đây trên các thiết bị khác nhau.</p>
                            <button type="button">Xem chi tiết</button>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
};

export default Person;