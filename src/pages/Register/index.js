import React, { useState } from 'react'; // Bổ sung useState
import styles from './Register.module.scss';
import {Link} from "react-router-dom";

function Register() {

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    return (
        <main className={styles.mainContainer}>
            <div className={styles.card}>
                <div className={styles.formPanel}>
                    <div className={styles.header}>
                        <h1 className={styles.title}>Tạo tài khoản mới</h1>
                        <p className={styles.subtitle}>Vui lòng điền thông tin bên dưới để bắt đầu</p>
                    </div>

                    <form className={styles.form}>
                        <div className={styles.inputGroup}>
                            {/* Full Name */}
                            <div className={styles.inputWrapper}>
                                <label htmlFor="fullname">Họ và Tên</label>
                                <input id="fullname" placeholder="Nguyễn Văn A" type="text" />
                            </div>

                            {/* Email */}
                            <div className={styles.inputWrapper}>
                                <label htmlFor="email">Địa chỉ Email</label>
                                <input id="email" placeholder="example@shoeviet.com" type="email" />
                            </div>

                            {/* Phone */}
                            <div className={styles.inputWrapper}>
                                <label htmlFor="phone">Số điện thoại</label>
                                <input id="phone" placeholder="+84 000 000 000" type="tel" />
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
                                        />
                                        <button
                                            type="button"
                                            className={styles.eyeBtn}
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? (
                                                // Icon con mắt mở (Ẩn mật khẩu)
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="20" height="20">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                                </svg>
                                            ) : (
                                                // Icon con mắt gạch chéo (Hiện mật khẩu)
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
                            <input id="terms" type="checkbox" />
                            <label htmlFor="terms">
                                Tôi đồng ý với <a href="#">Điều khoản & Điều kiện</a> của ShoeViet.
                            </label>
                        </div>

                        {/* CTA Button */}
                        <button className={styles.submitBtn} type="submit">
                            Đăng Ký Ngay
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
                                <svg width="20" height="20" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.7 17.74 9.5 24 9.5z" />
                                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                                </svg>
                                <span>Google</span>
                            </button>

                            <button className={styles.socialBtn} type="button">
                                <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                    <path fill="#ffffff" d="M16.671 10.556l-.532 3.47h-3.328v8.385C18.682 21.46 22.84 17.202 22.84 12.073c0-5.955-4.827-10.783-10.783-10.783S1.274 6.118 1.274 12.073c0 5.129 3.864 9.387 8.847 10.338v-8.385H7.074v-3.47h3.047v-2.25c0-3.006 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953h-1.514c-1.49 0-1.956.925-1.956 1.874v1.867h3.76z" />
                                </svg>
                                <span>Facebook</span>
                            </button>
                        </div>

                        {/* Redirect */}
                        <div className={styles.redirect}>
                            <p>
                                Bạn đã có tài khoản? <Link to="/login" href="#">Đăng nhập</Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </main>
    );
}

export default Register;