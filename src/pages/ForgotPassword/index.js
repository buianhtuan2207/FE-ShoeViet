import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './ForgotPassword.module.scss';
import authService from '../../services/AuthService';

function ForgotPassword() {
    const navigate = useNavigate();

    // 1. Quản lý trạng thái Email, Trạng thái xoay đợi và Thông báo
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // 2. Hàm xử lý khi người dùng nhấn nút Gửi mã
    const handleSubmit = async (e) => {
        e.preventDefault(); // Chặn hành động reload trang mặc định của form

        if (!email.trim()) {
            setMessage({ type: 'error', text: 'Vui lòng nhập địa chỉ Email!' });
            return;
        }

        setIsLoading(true);
        setMessage({ type: '', text: '' });

        try {
            // Gọi API Spring Boot gửi mail thông qua authService
            const responseMsg = await authService.forgotPassword(email);

            // Hiển thị thông báo thành công từ Backend trả về
            setMessage({ type: 'success', text: responseMsg || 'Mã OTP đã được gửi thành công!' });

            // Đợi 1.5 giây cho người dùng đọc thông báo rồi tự động nhảy sang trang nhập OTP
            setTimeout(() => {
                navigate('/verify-otp', {
                    state: {
                        email: email,
                        isForgotPassword: true // Đánh dấu sang trang OTP biết đây là luồng quên mật khẩu
                    }
                });
            }, 1500);

        } catch (error) {
            // Bắt các lỗi như "Email này không tồn tại trên hệ thống!" từ Spring Boot quăng ra
            setMessage({ type: 'error', text: error.message });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className={styles.mainContainer}>
            <div className={styles.card}>
                {/* Decorative Subtle Accent */}

                <div className={styles.header}>
                    {/* Brand logo as simple text */}
                    <h1 className={styles.title}>Quên mật khẩu?</h1>
                    <p className={styles.subtitle}>
                        Vui lòng nhập email của bạn để nhận mã xác thực (OTP) nhằm đặt lại mật khẩu.
                    </p>
                </div>

                {/* Khối hiển thị thông báo lỗi hoặc thành công */}
                {message.text && (
                    <div style={{
                        padding: '12px',
                        borderRadius: '6px',
                        marginBottom: '15px',
                        fontSize: '14px',
                        textAlign: 'center',
                        backgroundColor: message.type === 'error' ? '#fee2e2' : '#d1fae5',
                        color: message.type === 'error' ? '#b91c1c' : '#047857',
                        border: `1px solid ${message.type === 'error' ? '#fca5a5' : '#6ee7b7'}`
                    }}>
                        {message.text}
                    </div>
                )}

                {/* BỔ SUNG: Gắn onSubmit vào thẻ form */}
                <form className={styles.form} onSubmit={handleSubmit}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="email">ĐỊA CHỈ EMAIL</label>
                        <input
                            id="email"
                            name="email"
                            placeholder="example@email.com"
                            required
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)} // Lưu dữ liệu khi gõ vào state
                            disabled={isLoading}
                        />
                    </div>

                    {/* SỬA: Thay đổi sang type="submit" và xử lý trạng thái disabled */}
                    <button
                        className={styles.submitBtn}
                        type="submit"
                        disabled={isLoading}
                    >
                        {isLoading ? 'ĐANG GỬI MÃ...' : 'GỬI MÃ XÁC THỰC'}
                    </button>
                </form>

                <div className={styles.footer}>
                    <Link to="/login" className={styles.backLink}>
                        {/* Thay bằng icon SVG để không phụ thuộc vào font Material Symbols nếu chưa cài */}
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" width="16" height="16">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                        </svg>
                        Quay lại Đăng nhập
                    </Link>
                </div>
            </div>
        </main>
    );
}

export default ForgotPassword;