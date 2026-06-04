import React, { useState } from 'react';
import styles from './Login.module.scss';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../../services/AuthService';

function Login() {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);

    // 1. Quản lý dữ liệu Form Đăng nhập
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    // 2. Quản lý trạng thái Loading và Thông báo (Thành công / Thất bại)
    const [isLoading, setIsLoading] = useState(false);
    const [alertMessage, setAlertMessage] = useState({ type: '', text: '' }); // type: 'success' hoặc 'error'

    // Hàm xử lý khi người dùng gõ vào ô input
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    // Hàm xử lý khi bấm nút Đăng nhập
    const handleSubmit = async (e) => {
        e.preventDefault();
        setAlertMessage({ type: '', text: '' });
        setIsLoading(true);

        try {
            const response = await authService.login(formData);

            // 1. Lưu thông tin vào localStorage như cũ
            localStorage.setItem('accessToken', response.token);
            localStorage.setItem('userInfo', JSON.stringify({
                email: response.email,
                fullName: response.fullName,
                role: response.role
            }));

            window.dispatchEvent(new Event('authChange'));

            setAlertMessage({ type: 'success', text: 'Đăng nhập thành công! Đang chuyển hướng...' });

            // 2. ĐIỀU HƯỚNG THEO PHÂN QUYỀN TẠI ĐÂY:
            setTimeout(() => {
                // Ép về chữ thường .toLowerCase() cho chắc chắn, tránh việc BE trả về "ADMIN" hoặc "Admin"
                const userRole = response.role ? response.role.toLowerCase() : 'customer';

                if (userRole === 'admin') {
                    navigate('/admin'); // Nếu là admin thì đá sang trang quản trị luôn
                } else {
                    navigate('/');      // Khách hàng bình thường thì về trang chủ mua sắm
                }
            }, 1500);

        } catch (error) {
            setAlertMessage({ type: 'error', text: error.message });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className={styles.mainContainer}>
            <div className={styles.loginCard}>
                <div className={styles.header}>
                    <h1 className={styles.title}>Đăng nhập</h1>
                    <p className={styles.subtitle}>Vui lòng nhập thông tin của bạn.</p>
                </div>

                {/* Khối hiển thị thông báo alert lỗi hoặc thành công */}
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
                    {/* Email Input */}
                    <div className={styles.inputGroup}>
                        <label htmlFor="email">Địa chỉ Email</label>
                        <input
                            id="email"
                            name="email"
                            placeholder="nhap@email.com"
                            type="email"
                            required
                            value={formData.email}
                            onChange={handleInputChange}
                        />
                    </div>

                    {/* Password Input */}
                    <div className={styles.inputGroup}>
                        <div className={styles.labelRow}>
                            <label htmlFor="password" className={styles.noMarginBottom}>
                                Mật khẩu
                            </label>
                            <Link to="/forgot-password">Quên mật khẩu?</Link>
                        </div>
                        <div className={styles.inputWrapper}>
                            <input
                                id="password"
                                name="password"
                                placeholder="••••••••"
                                type={showPassword ? "text" : "password"}
                                className={styles.passwordInput}
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

                    <button className={styles.submitBtn} type="submit" disabled={isLoading}>
                        {isLoading ? 'Đang xác thực...' : 'Đăng nhập ngay'}
                    </button>
                </form>

                {/* Social Login Section */}
                <div className={styles.socialSection}>
                    <div className={styles.divider}>
                        <div className={styles.line}></div>
                        <span>Hoặc tiếp tục với</span>
                        <div className={styles.line}></div>
                    </div>

                    <div className={styles.socialGrid}>
                        <button className={styles.socialBtn} type="button">
                            <svg className="w-5 h-5" viewBox="0 0 24 24" width="20" height="20">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                            </svg>
                            <span>Google</span>
                        </button>

                        <button className={styles.socialBtn} type="button">
                            <svg fill="#1877F2" viewBox="0 0 24 24" width="20" height="20">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"></path>
                                <path fill="#ffffff" d="M16.671 10.556l-.532 3.47h-3.328v8.385C18.682 21.46 22.84 17.202 22.84 12.073c0-5.955-4.827-10.783-10.783-10.783S1.274 6.118 1.274 12.073c0 5.129 3.864 9.387 8.847 10.338v-8.385H7.074v-3.47h3.047v-2.25c0-3.006 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953h-1.514c-1.49 0-1.956.925-1.956 1.874v1.867h3.76z" />
                            </svg>
                            <span>Facebook</span>
                        </button>
                    </div>
                </div>

                <div className={styles.footer}>
                    <p>
                        Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
                    </p>
                </div>
            </div>
        </main>
    );
}

export default Login;