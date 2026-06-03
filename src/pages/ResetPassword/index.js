import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import styles from './ResetPassword.module.scss';
import authService from '../../services/AuthService';

function ResetPassword() {
    const navigate = useNavigate();
    const location = useLocation();

    // Lấy thông tin email và mã otp được truyền từ trang OTP sang để làm bằng chứng gửi lên Backend
    const email = location.state?.email || '';
    const otp = location.state?.otp || '';

    // Trạng thái hiển thị mật khẩu (Ẩn/Hiện)
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Trạng thái form
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();

        // 1. Kiểm tra an toàn: Nếu mất email hoặc otp, bắt người dùng quay lại từ đầu
        if (!email || !otp) {
            setMessage({ type: 'error', text: 'Thông tin xác thực đã hết hạn. Vui lòng quay lại nhập Email!' });
            return;
        }

        // 2. Validate độ dài mật khẩu phía Client
        if (newPassword.length < 6) {
            setMessage({ type: 'error', text: 'Mật khẩu mới phải có ít nhất 6 ký tự!' });
            return;
        }

        // 3. Kiểm tra xem 2 ô mật khẩu nhập vào có giống nhau không
        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: 'Xác nhận mật khẩu không trùng khớp!' });
            return;
        }

        setIsLoading(true);
        setMessage({ type: '', text: '' });

        try {
            // Gọi API lưu mật khẩu mới lên Spring Boot
            const responseMsg = await authService.resetPassword({
                email,
                otp,
                newPassword
            });

            setMessage({ type: 'success', text: responseMsg || 'Đặt lại mật khẩu thành công!' });

            // Đợi 2 giây cho hiển thị thông báo rồi chuyển hướng sang trang Login để đăng nhập lại
            setTimeout(() => {
                navigate('/login');
            }, 2000);

        } catch (error) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className={styles.mainContainer}>
            {/* Left Side Placeholder */}
            <div className={styles.leftSidePlaceholder}></div>

            {/* Right Side: Reset Password Form */}
            <div className={styles.formWrapper}>
                <div className={styles.card}>
                    <h2 className={styles.title}>Đặt lại mật khẩu</h2>
                    <p className={styles.subtitle}>
                        Vui lòng nhập mật khẩu mới cho tài khoản <strong style={{ color: '#2563eb' }}>{email}</strong>.
                    </p>

                    {/* Khối hiển thị thông báo Lỗi hoặc Thành công */}
                    {message.text && (
                        <div style={{
                            padding: '12px',
                            borderRadius: '6px',
                            marginBottom: '20px',
                            fontSize: '14px',
                            textAlign: 'center',
                            backgroundColor: message.type === 'error' ? '#fee2e2' : '#d1fae5',
                            color: message.type === 'error' ? '#b91c1c' : '#047857',
                            border: `1px solid ${message.type === 'error' ? '#fca5a5' : '#6ee7b7'}`
                        }}>
                            {message.text}
                        </div>
                    )}

                    <form className={styles.form} onSubmit={handleSubmit}>
                        {/* New Password Input */}
                        <div className={styles.inputGroup}>
                            <label htmlFor="new-password">Nhập Mật khẩu mới</label>
                            <div className={styles.inputWrapper}>
                                <input
                                    id="new-password"
                                    name="new-password"
                                    placeholder="••••••••"
                                    type={showNewPassword ? "text" : "password"}
                                    required
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    disabled={isLoading}
                                />
                                <button
                                    type="button"
                                    className={styles.eyeBtn}
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    disabled={isLoading}
                                >
                                    {showNewPassword ? (
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

                        {/* Confirm Password Input */}
                        <div className={styles.inputGroup}>
                            <label htmlFor="confirm-password">Xác nhận Mật khẩu mới</label>
                            <div className={styles.inputWrapper}>
                                <input
                                    id="confirm-password"
                                    name="confirm-password"
                                    placeholder="••••••••"
                                    type={showConfirmPassword ? "text" : "password"}
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    disabled={isLoading}
                                />
                                <button
                                    type="button"
                                    className={styles.eyeBtn}
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    disabled={isLoading}
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

                        {/* Action Button */}
                        <button
                            className={styles.submitBtn}
                            type="submit"
                            disabled={isLoading}
                        >
                            {isLoading ? 'ĐANG CẬP NHẬT...' : 'Đặt lại mật khẩu'}
                        </button>
                    </form>

                    {/* Back to Login Link */}
                    <div className={styles.footer}>
                        <Link to="/login" className={styles.backLink}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" width="16" height="16">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                            </svg>
                            Quay lại Đăng nhập
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    );
}

export default ResetPassword;