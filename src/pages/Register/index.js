import React, { useState } from 'react';
import styles from './Register.module.scss';
import { Link, useNavigate } from "react-router-dom";
import authService from '../../services/AuthService';

function Register() {
    const navigate = useNavigate();

    // 1. Quản lý trạng thái ẩn/hiện mật khẩu
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // 2. Quản lý dữ liệu Form Đăng ký
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        agreeTerms: false
    });

    // 3. Quản lý trạng thái Loading và Thông báo lỗi/thành công
    const [isLoading, setIsLoading] = useState(false);
    const [alertMessage, setAlertMessage] = useState({ type: '', text: '' }); // type: 'success' hoặc 'error'

    // Hàm xử lý khi user nhập liệu vào ô Input
    const handleInputChange = (e) => {
        const { id, value, type, checked } = e.target;

        // Map ID của thẻ input với key trong state formData
        const fieldName = id === 'fullname' ? 'fullName' :
            id === 'confirm_password' ? 'confirmPassword' : id;

        setFormData({
            ...formData,
            [fieldName]: type === 'checkbox' ? checked : value
        });
    };

    // Hàm xử lý khi Submit Form
    const handleSubmit = async (e) => {
        e.preventDefault();
        setAlertMessage({ type: '', text: '' });

        if (formData.password !== formData.confirmPassword) {
            setAlertMessage({ type: 'error', text: 'Mật khẩu xác nhận không trùng khớp!' });
            return;
        }

        if (!formData.agreeTerms) {
            setAlertMessage({ type: 'error', text: 'Bạn phải đồng ý với Điều khoản & Điều kiện!' });
            return;
        }

        setIsLoading(true);

        try {
            // Gọi hàm từ object authService cực kỳ ngắn gọn
            const response = await authService.register(formData);

            setAlertMessage({ type: 'success', text: response.message });

            setTimeout(() => {
                navigate('/verify-otp', { state: { email: formData.email } });
            }, 2500);

        } catch (error) {
            setAlertMessage({ type: 'error', text: error.message });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className={styles.mainContainer}>
            <div className={styles.card}>
                <div className={styles.formPanel}>
                    <div className={styles.header}>
                        <h1 className={styles.title}>Tạo tài khoản mới</h1>
                        <p className={styles.subtitle}>Vui lòng điền thông tin bên dưới để bắt đầu</p>
                    </div>

                    {/* Hiển thị thông báo Alert nếu có */}
                    {alertMessage.text && (
                        <div style={{
                            padding: '12px',
                            borderRadius: '8px',
                            marginBottom: '16px',
                            fontSize: '14px',
                            backgroundColor: alertMessage.type === 'success' ? '#def7ec' : '#fde8e8',
                            color: alertMessage.type === 'success' ? '#03543f' : '#9b1c1c',
                            border: `1px solid ${alertMessage.type === 'success' ? '#bfecdb' : '#f8b4b4'}`
                        }}>
                            {alertMessage.text}
                        </div>
                    )}

                    <form className={styles.form} onSubmit={handleSubmit}>
                        <div className={styles.inputGroup}>
                            {/* Full Name */}
                            <div className={styles.inputWrapper}>
                                <label htmlFor="fullname">Họ và Tên</label>
                                <input
                                    id="fullname"
                                    placeholder="Nguyễn Văn A"
                                    type="text"
                                    required
                                    value={formData.fullName}
                                    onChange={handleInputChange}
                                />
                            </div>

                            {/* Email */}
                            <div className={styles.inputWrapper}>
                                <label htmlFor="email">Địa chỉ Email</label>
                                <input
                                    id="email"
                                    placeholder="example@shoeviet.com"
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={handleInputChange}
                                />
                            </div>

                            {/* Phone */}
                            <div className={styles.inputWrapper}>
                                <label htmlFor="phone">Số điện thoại</label>
                                <input
                                    id="phone"
                                    placeholder="+84 000 000 000"
                                    type="tel"
                                    required
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                />
                            </div>

                            {/* Password Cluster */}
                            <div className={styles.passwordCluster}>
                                {/* Mật khẩu */}
                                <div className={styles.inputWrapper}>
                                    <label htmlFor="password">Mật khẩu</label>
                                    <div className={styles.passwordField}>
                                        <input
                                            id="password"
                                            placeholder="••••••••"
                                            type={showPassword ? "text" : "password"}
                                            required
                                            value={formData.password}
                                            onChange={handleInputChange}
                                        />
                                        <button
                                            type="button"
                                            className={styles.eyeBtn}
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? (
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="20" height="20">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                                </svg>
                                            ) : (
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="20" height="20">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Xác nhận mật khẩu */}
                                <div className={styles.inputWrapper}>
                                    <label htmlFor="confirm_password">Xác nhận mật khẩu</label>
                                    <div className={styles.passwordField}>
                                        <input
                                            id="confirm_password"
                                            placeholder="••••••••"
                                            type={showConfirmPassword ? "text" : "password"}
                                            required
                                            value={formData.confirmPassword}
                                            onChange={handleInputChange}
                                        />
                                        <button
                                            type="button"
                                            className={styles.eyeBtn}
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        >
                                            {showConfirmPassword ? (
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="20" height="20">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                                </svg>
                                            ) : (
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="20" height="20">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Terms */}
                        <div className={styles.termsWrapper}>
                            <input
                                id="agreeTerms"
                                type="checkbox"
                                checked={formData.agreeTerms}
                                onChange={handleInputChange}
                            />
                            <label htmlFor="agreeTerms">
                                Tôi đồng ý với <a href="#">Điều khoản & Điều kiện</a> của ShoeViet.
                            </label>
                        </div>

                        {/* CTA Button */}
                        <button className={styles.submitBtn} type="submit" disabled={isLoading}>
                            {isLoading ? 'Đang xử lý...' : 'Đăng Ký Ngay'}
                        </button>

                        {/* Divider */}
                        <div className={styles.divider}>
                            <div className={styles.line}>
                                <div></div>
                            </div>
                            <div className={styles.textWrapper}>
                                <span>Hoặc tiếp tục với</span>
                            </div>
                        </div>

                        {/* Social Logins */}
                        <div className={styles.socialGrid}>
                            <button className={styles.socialBtn} type="button">
                                {/* SVG Google giữ nguyên */}
                                <span>Google</span>
                            </button>
                            <button className={styles.socialBtn} type="button">
                                {/* SVG Facebook giữ nguyên */}
                                <span>Facebook</span>
                            </button>
                        </div>

                        {/* Redirect */}
                        <div className={styles.redirect}>
                            <p>
                                Bạn đã có tài khoản? <Link to="/login">Đăng nhập</Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </main>
    );
}

export default Register;