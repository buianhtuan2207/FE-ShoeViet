import React from 'react';
import styles from '../../Person.module.scss';

const Info = ({ formData, onChange, onSubmit }) => {
    return (
        <>
            <div className={styles.mainCard}>
                <header className={styles.header}>
                    <h1>Thông tin cá nhân</h1>
                    <p>Cập nhật thông tin tài khoản và cách chúng tôi liên hệ với bạn.</p>
                </header>

                <form className={styles.formGrid} onSubmit={onSubmit}>
                    <div className={styles.formGroup}>
                        <label>Họ và tên</label>
                        <input
                            className={styles.inputControl}
                            placeholder="Nhập họ và tên"
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={onChange}
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
                            onChange={onChange}
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
                            onChange={onChange}
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
                            onChange={onChange}
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
                        <p>Tăng cường bảo mật bằng cách thêm lớp xác thực.</p>
                        <button type="button">Thiết lập ngay</button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Info;