import React from 'react';
import styles from './History.module.scss';
import { Link } from 'react-router-dom';

const mockOrders = [
    { id: 'ORD-1001', date: '2026-05-10', total: '₫1,200,000', status: 'Delivered' },
    { id: 'ORD-1002', date: '2026-05-22', total: '₫850,000', status: 'Processing' },
    { id: 'ORD-1003', date: '2026-06-01', total: '₫450,000', status: 'Cancelled' }
];

function History() {
    return (
        <main className={styles.mainContainer}>
            <div className={styles.wrapper}>
                <header className={styles.header}>
                    <h1 className={styles.title}>Lịch sử đơn hàng</h1>
                    <p className={styles.subtitle}>Xem các đơn hàng đã đặt trước đây</p>
                </header>

                <section className={styles.ordersList}>
                    {mockOrders.length === 0 ? (
                        <div className={styles.emptyState}>
                            <p>Bạn chưa có đơn hàng nào.</p>
                            <Link to="/" className={styles.continueBtn}>Mua sắm ngay</Link>
                        </div>
                    ) : (
                        mockOrders.map(order => (
                            <article key={order.id} className={styles.orderCard}>
                                <div className={styles.orderRow}>
                                    <div>
                                        <div className={styles.orderId}>{order.id}</div>
                                        <div className={styles.orderDate}>{order.date}</div>
                                    </div>
                                    <div className={styles.orderMeta}>
                                        <div className={styles.total}>{order.total}</div>
                                        <div className={styles.status}>{order.status}</div>
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
