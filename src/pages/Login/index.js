import React, { useState } from 'react';
import styles from './Login.module.scss';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../../services/AuthService';
import { GoogleLogin } from '@react-oauth/google';

function Login() {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);

    // 1. Quản lý trạng thái
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [alertMessage, setAlertMessage] = useState({ type: '', text: '' }); // type: 'success' | 'error'

    // 2. Các hàm hỗ trợ (Helpers)
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const saveUserAndRedirect = (data) => {
        // Lưu thông tin xác thực
        localStorage.setItem('accessToken', data.token);
        localStorage.setItem('userInfo', JSON.stringify({
            email: data.email,
            fullName: data.fullName,
            role: data.role
        }));

        // Báo cho các component khác biết trạng thái auth đã thay đổi
        window.dispatchEvent(new Event('authChange'));

        setAlertMessage({ type: 'success', text: 'Đăng nhập thành công! Đang chuyển hướng...' });

        // Điều hướng dựa trên role
        setTimeout(() => {
            const userRole = data.role ? data.role.toLowerCase() : 'customer';
            if (userRole === 'admin') {
                navigate('/admin');
            } else {
                navigate('/');
            }
        }, 1500);
    };

    // 3. Logic Đăng nhập Truyền thống
    const handleStandardLogin = async (e) => {
        e.preventDefault();
        setAlertMessage({ type: '', text: '' });
        setIsLoading(true);

        try {
            const response = await authService.login(formData);
            saveUserAndRedirect(response);
        } catch (error) {
            setAlertMessage({ type: 'error', text: error.message || 'Sai email hoặc mật khẩu' });
        } finally {
            setIsLoading(false);
        }
    };

    // 4. Logic Đăng nhập Google
    const handleGoogleLoginSuccess = async (credentialResponse) => {
        setAlertMessage({ type: '', text: '' });
        setIsLoading(true);

        try {
            const idToken = credentialResponse.credential;
            const response = await authService.loginWithGoogle(idToken);
            saveUserAndRedirect(response);
        } catch (error) {
            setAlertMessage({ type: 'error', text: error.response?.data || 'Lỗi xác thực Google với hệ thống!' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLoginError = () => {
        setAlertMessage({ type: 'error', text: 'Đăng nhập Google thất bại! Vui lòng thử lại.' });
    };

    // 5. Giao diện (Render)
    return (
        <main className={styles.mainContainer}>
            <div className={styles.loginCard}>
                <div className={styles.header}>
                    <h1 className={styles.title}>Đăng nhập</h1>
                    <p className={styles.subtitle}>Vui lòng nhập thông tin của bạn.</p>
                </div>

                {/* Khối hiển thị thông báo alert */}
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

                {/* Form Đăng nhập Truyền thống */}
                <form className={styles.form} onSubmit={handleStandardLogin}>
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

                {/* Khu vực Đăng nhập Mạng xã hội */}
                <div className={styles.socialSection}>
                    <div className={styles.divider}>
                        <div className={styles.line}></div>
                        <span>Hoặc tiếp tục với</span>
                        <div className={styles.line}></div>
                    </div>

                    <div className={styles.socialGrid}>
                        {/* Nút Google (Đã được làm gọn) */}
                        <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                            <GoogleLogin
                                onSuccess={handleGoogleLoginSuccess}
                                onError={handleGoogleLoginError}
                                theme="outline"
                                size="large"
                                shape="rectangular"
                                text="signin_with"
                                width="160"
                            />
                        </div>

                        {/* Nút Facebook */}
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