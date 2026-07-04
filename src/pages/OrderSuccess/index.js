import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import API from '../../services/api';
import styles from './OrderSuccess.module.scss';

function OrderSuccess() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const isProcessed = useRef(false);

    const [orderInfo, setOrderInfo] = useState({
        orderCode: 'Đang tải...',
        amount: '0',
    });

    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState(null); // 'success' hoặc 'failed'

    useEffect(() => {
        if (isProcessed.current) return;
        isProcessed.current = true;

        const vnp_ResponseCode = searchParams.get('vnp_ResponseCode');
        const vnp_TxnRef = searchParams.get('vnp_TxnRef');
        const vnp_Amount = searchParams.get('vnp_Amount');

        if (vnp_ResponseCode) {
            setOrderInfo({
                orderCode: vnp_TxnRef,
                amount: vnp_Amount ? (Number(vnp_Amount) / 100).toLocaleString('vi-VN') : '0',
            });

            // Gửi toàn bộ query string xuống BE để BE verify chữ ký và update trạng thái tiền
            const queryString = window.location.search;
            API.get(`/v1/payment/vnpay-return${queryString}`)
                .then((res) => {
                    // BE trả về status 'success'
                    setStatus('success');
                    setLoading(false);
                })
                .catch((err) => {
                    console.error("Lỗi cập nhật trạng thái thanh toán:", err);
                    setStatus('failed');
                    setLoading(false);
                });
        } else {
            // Truy cập thẳng mà không có param VNPay
            setLoading(false);
        }
    }, [searchParams, navigate]);

    if (loading) {
        return (
            <div style={{ textAlign: 'center', marginTop: '150px' }}>
                <h2>Đang đồng bộ kết quả thanh toán...</h2>
                <p>Vui lòng không tải lại trang.</p>
            </div>
        );
    }

    if (status === 'failed') {
        return (
            <div style={{ textAlign: 'center', marginTop: '150px' }}>
                <h2 style={{ color: 'red' }}>Thanh toán thất bại hoặc chữ ký không hợp lệ!</h2>
                <button onClick={() => navigate('/history')}>Xem đơn hàng của tôi</button>
            </div>
        );
    }

    return (
        <main className={styles['success-main']}>
            <div className={styles['success-container']}>
                <div className={styles['checkmark-bounce']}>
                    <div className={styles['icon-box']}>
                        <span className={`material-symbols-outlined ${styles['check-icon']}`}>check_circle</span>
                    </div>
                </div>

                <h1 className={styles['success-title']}>Thanh toán thành công!</h1>
                <p className={styles['success-subtitle']}>
                    Cảm ơn bạn đã mua sắm tại SneakerLab. Đơn hàng của bạn đã được thanh toán và đang chờ giao.
                </p>

                <div className={styles['bento-card']}>
                    <div className={styles['card-header']}>
                        <div>
                            <p className={styles['label-small']}>Mã đơn hàng</p>
                            <h2 className={styles['order-code']}>#{orderInfo.orderCode}</h2>
                        </div>
                        <div className={styles['delivery-box']}>
                            <p className={styles['label-small']}>Tổng thanh toán</p>
                            <h2 className={styles['order-code']} style={{ color: 'var(--primary-color)' }}>
                                {orderInfo.amount} ₫
                            </h2>
                        </div>
                    </div>
                </div>

                <div className={styles['action-buttons']}>
                    <button className={styles['btn-primary']} onClick={() => navigate('/')}>Tiếp tục mua sắm</button>
                    <button className={styles['btn-secondary']} onClick={() => navigate('/history')}>Xem lịch sử mua hàng</button>
                </div>
            </div>
        </main>
    );
}

export default OrderSuccess;