import React from 'react';
import { Link } from 'react-router-dom';
import styles from './OTPVerification.module.scss';

function OTPVerification() {
    return (
        <main className={styles.mainContainer}>
            <div className={styles.card}>
                {/* Header */}
                <div className={styles.header}>
                    <h1 className={styles.title}>Xác thực mã OTP</h1>
                    <p className={styles.subtitle}>
                        Vui lòng nhập mã xác thực 6 chữ số đã được gửi đến email của bạn.
                    </p>
                </div>

                {/* OTP Form */}
                <form className={styles.form}>
                    {/* OTP Inputs Grid */}
                    <div className={styles.otpGrid}>
                        {[1, 2, 3, 4, 5, 6].map((index) => (
                            <input
                                key={index}
                                aria-label={`Digit ${index}`}
                                className={styles.otpInput}
                                maxLength="1"
                                placeholder="-"
                                type="text"
                                // Gợi ý: Trên mobile, để type="number" hoặc pattern="\d*" sẽ giúp gọi bàn phím số
                                pattern="\d*"
                            />
                        ))}
                    </div>

                    {/* Primary Action */}
                    <button className={styles.submitBtn} type="submit">
                        XÁC NHẬN
                    </button>

                    {/* Secondary Actions */}
                    <div className={styles.secondaryActions}>
                        <button className={styles.resendBtn} type="button">
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