import React from 'react';
import { Link } from 'react-router-dom'; // Dùng để chuyển trang về Login
import styles from './ForgotPassword.module.scss';

function ForgotPassword() {
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

                <form className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="email">ĐỊA CHỈ EMAIL</label>
                        <input
                            id="email"
                            name="email"
                            placeholder="example@email.com"
                            required
                            type="email"
                        />
                    </div>

                    <button className={styles.submitBtn} type="button">
                        GỬI MÃ XÁC THỰC
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