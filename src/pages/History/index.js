import React, { useEffect, useState } from 'react';
import styles from './History.module.scss';
import { Link } from 'react-router-dom';
import OrderService from '../../services/OrderService';
import { userService } from '../../services/UserService';

function History() {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadOrders = async () => {
            setIsLoading(true);
            setError('');

            try {
                const userInfoRaw = localStorage.getItem('userInfo');
                let userInfo = null;

                if (userInfoRaw) {
                    try {
                        userInfo = JSON.parse(userInfoRaw);
                    } catch {
                        userInfo = null;
                    }
                }

                let userId = userInfo?.id;
                if (!userId) {
                    const profile = await userService.getMyProfile();
                    userId = profile?.id;
                }

                if (!userId) {
                    throw new Error('Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.');
                }

                const fetchedOrders = await OrderService.getOrdersByUser(userId);
                setOrders(Array.isArray(fetchedOrders) ? fetchedOrders : []);
            } catch (fetchError) {
                console.error('Lỗi khi tải lịch sử đơn hàng:', fetchError);
                setError(fetchError?.response?.data || fetchError.message || 'Có lỗi khi tải lịch sử đơn hàng.');
            } finally {
                setIsLoading(false);
            }
        };

        loadOrders();
    }, []);

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return isNaN(date.getTime()) ? dateString : date.toLocaleDateString('vi-VN');
    };

    const formatMoney = (amount) => {
        if (amount == null) return '-';
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    return (
        <main className={styles.mainContainer}>
            <div className={styles.wrapper}>
                <header className={styles.header}>
                    <h1 className={styles.title}>Lịch sử đơn hàng</h1>
                    <p className={styles.subtitle}>Xem các đơn hàng đã đặt trước đây</p>
                </header>

                <section className={styles.ordersList}>
                    {isLoading ? (
                        <div className={styles.emptyState}>
                            <p>Đang tải đơn hàng...</p>
                        </div>
                    ) : error ? (
                        <div className={styles.emptyState}>
                            <p>{error}</p>
                            <Link to="/" className={styles.continueBtn}>Quay lại mua sắm</Link>
                        </div>
                    ) : orders.length === 0 ? (
                        <div className={styles.emptyState}>
                            <p>Bạn chưa có đơn hàng nào.</p>
                            <Link to="/" className={styles.continueBtn}>Mua sắm ngay</Link>
                        </div>
                    ) : (
                        orders.map((order) => (
                            <article key={order.id} className={styles.orderCard}>
                                <div className={styles.orderRow}>
                                    <div>
                                        <div className={styles.orderId}>{order.orderCode || `#${order.id}`}</div>
                                        <div className={styles.orderDate}>{formatDate(order.createdAt)}</div>
                                    </div>
                                    <div className={styles.orderMeta}>
                                        <div className={styles.total}>{formatMoney(order.finalAmount ?? order.totalAmount)}</div>
                                        <div className={styles.status}>{order.status || 'Chưa cập nhật'}</div>
                                    </div>
                                </div>
                                <div className={styles.orderActions}>
                                    <Link to={`/detail/${order.id}`} className={styles.viewLink}>Chi tiết</Link>
                                </div>
                            </article>
                        ))
                    )}
                </section>
            </div>
        </main>
    );
}

export default History;
