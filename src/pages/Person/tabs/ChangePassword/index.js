import React, { useState } from 'react';
import styles from '../../Person.module.scss';
import { userService } from '../../../../services/UserService';

const ChangePassword = () => {
    const [passwords, setPasswords] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setPasswords(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (passwords.newPassword !== passwords.confirmPassword) {
            alert('Mật khẩu xác nhận không khớp!');
            return;
        }

        try {
            const payload = {
                oldPassword: passwords.oldPassword,
                newPassword: passwords.newPassword
            };
            await userService.changePassword(payload);
            alert('Đổi mật khẩu thành công!');

            // Xóa trắng form sau khi đổi thành công
            setPasswords({
                oldPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
        } catch (error) {
            console.error('Lỗi khi đổi mật khẩu:', error);
            alert('Đổi mật khẩu thất bại. Vui lòng kiểm tra lại mật khẩu cũ!');
        }
    };

    return (
        <div className={styles.mainCard}>
            <header className={styles.header}>
                <h1>Đổi mật khẩu</h1>
                <p>Cập nhật mật khẩu mới để bảo vệ tài khoản của bạn.</p>
            </header>

            <form className={styles.formGrid} onSubmit={handleSubmit}>
                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                    <label>Mật khẩu hiện tại</label>
                    <input
                        className={styles.inputControl}
                        placeholder="Nhập mật khẩu hiện tại"
                        type="password"
                        name="oldPassword"
                        value={passwords.oldPassword}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className={styles.formGroup}>
                    <label>Mật khẩu mới</label>
                    <input
                        className={styles.inputControl}
                        placeholder="Nhập mật khẩu mới"
                        type="password"
                        name="newPassword"
                        value={passwords.newPassword}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className={styles.formGroup}>
                    <label>Xác nhận mật khẩu mới</label>
                    <input
                        className={styles.inputControl}
                        placeholder="Nhập lại mật khẩu mới"
                        type="password"
                        name="confirmPassword"
                        value={passwords.confirmPassword}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className={styles.formActions}>
                    <button
                        className={styles.btnCancel}
                        type="button"
                        onClick={() => setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' })}
                    >
                        Nhập lại
                    </button>
                    <button className={styles.btnSubmit} type="submit">
                        Lưu mật khẩu
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ChangePassword;