import React, { useState, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom'; // Thêm useLocation
import styles from './OTPVerification.module.scss';
import authService from '../../services/AuthService';

function OTPVerification() {
    const navigate = useNavigate();
    const location = useLocation(); // Hook lấy dữ liệu được truyền từ navigate

    // Nhận thông tin email và nhận diện luồng từ trang trước truyền sang (ForgotPassword hoặc Register)
    const emailFromState = location.state?.email || '';
    const isForgotPassword = location.state?.isForgotPassword || false;

    // 1. Quản lý trạng thái mã OTP (mảng 6 ký tự trống)
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // 2. Dùng useRef để quản lý con trỏ (focus) của 6 ô input
    const inputRefs = useRef([]);

    // Xử lý khi người dùng gõ số vào ô
    const handleChange = (element, index) => {
        if (isNaN(element.value)) return false;

        const newOtp = [...otp];
        newOtp[index] = element.value;
        setOtp(newOtp);

        if (element.value !== '' && index < 5) {
            inputRefs.current[index + 1].focus();
        }
    };

    // Xử lý khi người dùng bấm phím Backspace để xóa ngược về trước
    const handleKeyDown = (e, index) => {
        if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };

    // Xử lý khi người dùng Sao chép và Dán (Paste) thẳng mã 6 số vào ô
    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').slice(0, 6).split('');

        if (pastedData.length > 0) {
            const newOtp = [...otp];
            pastedData.forEach((char, index) => {
                if (index < 6 && !isNaN(char)) {
                    newOtp[index] = char;
                }
            });
            setOtp(newOtp);

            const focusIndex = pastedData.length < 6 ? pastedData.length : 5;
            inputRefs.current[focusIndex].focus();
        }
    };

    // Xử lý gửi mã OTP lên Spring Boot để xác thực
    const handleSubmit = async (e) => {
        e.preventDefault();
        const otpCode = otp.join('');

        if (otpCode.length < 6) {
            setMessage({ type: 'error', text: 'Vui lòng nhập đầy đủ cả 6 chữ số mã OTP!' });
            return;
        }

        setIsLoading(true);
        setMessage({ type: '', text: '' });

        try {
            if (isForgotPassword) {
                // ==========================================
                // LUỒNG 1: QUÊN MẬT KHẨU (Gửi JSON Body)
                // ==========================================
                const responseMsg = await authService.verifyForgotOtp({
                    email: emailFromState,
                    otp: otpCode
                });
                setMessage({ type: 'success', text: responseMsg });

                // Thành công -> Chuyển hướng sang trang ResetPassword sau 2s kèm data
                setTimeout(() => {
                    navigate('/reset-password', {
                        state: { email: emailFromState, otp: otpCode }
                    });
                }, 2000);

            } else {
                // ==========================================
                // LUỒNG 2: XÁC THỰC ĐĂNG KÝ (Gửi RequestParam)
                // ==========================================
                const responseMsg = await authService.verifyOtp(otpCode);
                setMessage({ type: 'success', text: responseMsg });

                // Thành công -> Chuyển về trang đăng nhập
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            }

        } catch (error) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className={styles.mainContainer}>
            <div className={styles.card}>
                {/* Header */}
                <div className={styles.header}>
                    <h1 className={styles.title}>Xác thực mã OTP</h1>
                    <p className={styles.subtitle}>
                        {isForgotPassword
                            ? `Vui lòng nhập mã OTP đặt lại mật khẩu gửi tới ${emailFromState || 'email của bạn'}.`
                            : "Vui lòng nhập mã xác thực 6 chữ số đã được gửi đến email của bạn."
                        }
                    </p>
                </div>

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

                {/* OTP Form */}
                <form className={styles.form} onSubmit={handleSubmit}>
                    {/* OTP Inputs Grid */}
                    <div className={styles.otpGrid}>
                        {otp.map((data, index) => (
                            <input
                                key={index}
                                aria-label={`Digit ${index + 1}`}
                                className={styles.otpInput}
                                maxLength="1"
                                placeholder="-"
                                type="text"
                                pattern="\d*"
                                value={data}
                                disabled={isLoading}
                                ref={(el) => (inputRefs.current[index] = el)}
                                onChange={(e) => handleChange(e.target, index)}
                                onKeyDown={(e) => handleKeyDown(e, index)}
                                onPaste={handlePaste}
                            />
                        ))}
                    </div>

                    {/* Primary Action */}
                    <button
                        className={styles.submitBtn}
                        type="submit"
                        disabled={isLoading}
                    >
                        {isLoading ? 'ĐANG XỬ LÝ...' : 'XÁC NHẬN'}
                    </button>

                    {/* Secondary Actions */}
                    <div className={styles.secondaryActions}>
                        <button className={styles.resendBtn} type="button" disabled={isLoading}>
                            Chưa nhận được mã? <span>Gửi lại mã (60s)</span>
                        </button>

                        <Link to="/forgot-password" className={styles.backLink}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" width="18" height="18" className={styles.arrowIcon}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                            </svg>
                            Quay lại nhập Email
                        </Link>
                    </div>
                </form>
            </div>
        </main>
    );
}

export default OTPVerification;