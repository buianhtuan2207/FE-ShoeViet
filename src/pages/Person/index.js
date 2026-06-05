import React, { useState } from 'react';
import styles from './Person.module.scss';
import { Link } from 'react-router-dom';

function Person() {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        fullName: 'Nguyễn Văn A',
        email: 'user@example.com',
        phone: '0123456789',
        address: '123 Đường ABC, Thành phố HCM',
        city: 'TP. Hồ Chí Minh',
        district: 'Quận 1',
        ward: 'Phường Bến Nghé',
        postalCode: '70000'
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSaveChanges = () => {
        setIsEditing(false);
        // TODO: Gọi API để lưu thông tin
        console.log('Saving user data:', formData);
    };

    return (
        <main className={styles.mainContainer}>
            <div className={styles.personContainer}>
                {/* Header */}
                <div className={styles.header}>
                    <h1 className={styles.title}>Thông tin cá nhân</h1>
                    <p className={styles.subtitle}>Quản lý thông tin tài khoản của bạn</p>
                </div>

                {/* Profile Card */}
                <div className={styles.profileCard}>
                    {/* Avatar Section */}
                    <div className={styles.avatarSection}>
                        <div className={styles.avatarContainer}>
                            <img 
                                src="https://via.placeholder.com/120" 
                                alt="Avatar" 
                                className={styles.avatar}
                            />
                        </div>
                        {isEditing && (
                            <button className={styles.uploadBtn}>
                                Đổi ảnh đại diện
                            </button>
                        )}
                    </div>

                    {/* Information Section */}
                    <div className={styles.infoSection}>
                        <div className={styles.infoGrid}>
                            {/* Full Name */}
                            <div className={styles.formGroup}>
                                <label htmlFor="fullName">Họ và tên</label>
                                <input
                                    id="fullName"
                                    name="fullName"
                                    type="text"
                                    value={formData.fullName}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                    className={styles.input}
                                />
                            </div>

                            {/* Email */}
                            <div className={styles.formGroup}>
                                <label htmlFor="email">Email</label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                    className={styles.input}
                                />
                            </div>

                            {/* Phone */}
                            <div className={styles.formGroup}>
                                <label htmlFor="phone">Số điện thoại</label>
                                <input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                    className={styles.input}
                                />
                            </div>

                            {/* Address */}
                            <div className={styles.formGroup}>
                                <label htmlFor="address">Địa chỉ</label>
                                <input
                                    id="address"
                                    name="address"
                                    type="text"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                    className={styles.input}
                                />
                            </div>

                            {/* City */}
                            <div className={styles.formGroup}>
                                <label htmlFor="city">Tỉnh/Thành phố</label>
                                <input
                                    id="city"
                                    name="city"
                                    type="text"
                                    value={formData.city}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                    className={styles.input}
                                />
                            </div>

                            {/* District */}
                            <div className={styles.formGroup}>
                                <label htmlFor="district">Quận/Huyện</label>
                                <input
                                    id="district"
                                    name="district"
                                    type="text"
                                    value={formData.district}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                    className={styles.input}
                                />
                            </div>

                            {/* Ward */}
                            <div className={styles.formGroup}>
                                <label htmlFor="ward">Phường/Xã</label>
                                <input
                                    id="ward"
                                    name="ward"
                                    type="text"
                                    value={formData.ward}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                    className={styles.input}
                                />
                            </div>

                            {/* Postal Code */}
                            <div className={styles.formGroup}>
                                <label htmlFor="postalCode">Mã bưu chính</label>
                                <input
                                    id="postalCode"
                                    name="postalCode"
                                    type="text"
                                    value={formData.postalCode}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                    className={styles.input}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className={styles.actionButtons}>
                        {!isEditing ? (
                            <>
                                <button 
                                    className={styles.btnPrimary}
                                    onClick={() => setIsEditing(true)}
                                >
                                    Chỉnh sửa thông tin
                                </button>
                                <Link to="/changepassword" className={styles.btnSecondary}>
                                    Đổi mật khẩu
                                </Link>
                            </>
                        ) : (
                            <>
                                <button 
                                    className={styles.btnPrimary}
                                    onClick={handleSaveChanges}
                                >
                                    Lưu thay đổi
                                </button>
                                <button 
                                    className={styles.btnSecondary}
                                    onClick={() => setIsEditing(false)}
                                >
                                    Hủy
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Quick Links */}
                <div className={styles.quickLinks}>
                    <Link to="/history" className={styles.quickLinkCard}>
                        <div className={styles.linkIcon}>📦</div>
                        <h3>Đơn hàng của tôi</h3>
                        <p>Xem lịch sử và trạng thái đơn hàng</p>
                    </Link>
                    <Link to="/wishlist" className={styles.quickLinkCard}>
                        <div className={styles.linkIcon}>❤️</div>
                        <h3>Danh sách yêu thích</h3>
                        <p>Xem các sản phẩm đã lưu</p>
                    </Link>
                    <Link to="/reviews" className={styles.quickLinkCard}>
                        <div className={styles.linkIcon}>⭐</div>
                        <h3>Đánh giá của tôi</h3>
                        <p>Xem các đánh giá đã gửi</p>
                    </Link>
                </div>
            </div>
        </main>
    );
}

export default Person;
