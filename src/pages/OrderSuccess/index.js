import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import API from '../../services/api';
import OrderService from '../../services/OrderService';
import styles from './OrderSuccess.module.scss';

function OrderSuccess() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const location = useLocation();
    const isProcessed = useRef(false);

    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState(null);
    const [orderData, setOrderData] = useState(null);

    const vnp_TxnRef = searchParams.get('vnp_TxnRef');
    const stateOrderCode = location.state?.orderCode;
    const initialOrderCode = vnp_TxnRef || stateOrderCode;

    useEffect(() => {
        if (isProcessed.current) return;
        isProcessed.current = true;

        const vnp_ResponseCode = searchParams.get('vnp_ResponseCode');

        if (!initialOrderCode) {
            setStatus('failed');
            setLoading(false);
            return;
        }

        const fetchOrderDetails = async (code) => {
            try {
                const res = await OrderService.getOrderByCode(code);
                const actualData = res?.data || res;
                setOrderData(actualData);
            } catch (error) {
                console.error(error);
            }
        };

        if (vnp_ResponseCode) {
            const queryString = window.location.search;
            API.get(`/v1/payment/vnpay-return${queryString}`)
                .then(async () => {
                    setStatus('success');
                    await fetchOrderDetails(initialOrderCode);
                    setLoading(false);
                })
                .catch((err) => {
                    console.error(err);
                    setStatus('failed');
                    setLoading(false);
                });
        } else if (stateOrderCode) {
            setStatus('success');
            fetchOrderDetails(initialOrderCode).then(() => {
                setLoading(false);
            });
        } else {
            setStatus('success');
            fetchOrderDetails(initialOrderCode).then(() => {
                setLoading(false);
            });
        }
    }, [searchParams, stateOrderCode, initialOrderCode, navigate]);

    const formatCurrency = (value) => {
        return Number(value || 0).toLocaleString('vi-VN');
    };

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
                <h2 style={{ color: 'red' }}>Thanh toán thất bại hoặc thông tin không hợp lệ!</h2>
                <button
                    onClick={() => navigate('/history')}
                    style={{ padding: '10px 20px', marginTop: '15px', cursor: 'pointer' }}
                >
                    Xem đơn hàng của tôi
                </button>
            </div>
        );
    }

    const displayOrderCode = orderData?.orderCode || initialOrderCode || 'N/A';
    const displayTotal = orderData?.finalAmount || orderData?.totalAmount || 0;
    const displayShippingFee = orderData?.shippingFee || 0;
    const isVnPay = orderData?.paymentMethod === 'VNPAY' || searchParams.get('vnp_ResponseCode');

    return (
        <main className={styles['success-main']}>
            <div className={styles['success-container']}>
                <div className={styles['checkmark-bounce']}>
                    <div className={styles['icon-box']}>
                        <span className={`material-symbols-outlined ${styles['check-icon']}`}>check_circle</span>
                    </div>
                </div>

                <h1 className={styles['success-title']}>Đặt hàng thành công!</h1>
                <p className={styles['success-subtitle']}>
                    Cảm ơn bạn đã mua sắm tại SneakerLab. Đơn hàng của bạn đã được ghi nhận và đang chờ giao.
                </p>

                <div className={styles['bento-card']}>
                    <div className={styles['card-header']}>
                        <div>
                            <p className={styles['label-small']}>Mã đơn hàng</p>
                            <h2 className={styles['order-code']}>#{displayOrderCode}</h2>
                        </div>
                        <div className={styles['delivery-box']}>
                            <p className={styles['label-small']}>Phí vận chuyển</p>
                            <h2 className={styles['order-code']} style={{ fontSize: '1.2rem' }}>
                                {formatCurrency(displayShippingFee)} ₫
                            </h2>
                        </div>
                        <div className={styles['delivery-box']}>
                            <p className={styles['label-small']}>Tổng thanh toán</p>
                            <h2 className={styles['order-code']} style={{ color: 'var(--primary-color)' }}>
                                {formatCurrency(displayTotal)} ₫
                            </h2>
                        </div>
                        <div className={styles['delivery-box']}>
                            <p className={styles['label-small']}>Phương thức</p>
                            <h2 className={styles['order-code']} style={{ fontSize: '1.1rem' }}>
                                {isVnPay ? 'VNPay' : 'COD'}
                            </h2>
                        </div>
                    </div>
                </div>

                {orderData?.orderItems && orderData.orderItems.length > 0 && (
                    <div className={styles['order-items-section']}>
                        <h3 className={styles['items-title']}>Sản phẩm đã đặt</h3>
                        <div className={styles['items-list']}>
                            {orderData.orderItems.map((item, index) => (
                                <div key={index} className={styles['order-item']}>
                                    <div className={styles['item-image']}>
                                        <img
                                            src={item.productImage}
                                            alt={item.productName || 'Sản phẩm'}
                                            onError={(e) => { e.target.src = 'https://via.placeholder.com/80'; }}
                                        />
                                    </div>
                                    <div className={styles['item-info']}>
                                        <h4 className={styles['item-name']}>{item.productName}</h4>
                                        <p className={styles['item-meta']}>
                                            {item.color && `Màu: ${item.color} `}
                                            {item.color && item.size && `| `}
                                            {item.size && `Size: ${item.size}`}
                                        </p>
                                        <div className={styles['item-price-row']}>
                                            <span>SL: {item.quantity}</span>
                                            <span className={styles['item-price']}>
                                                {formatCurrency((item.unitPrice || 0) * (item.quantity || 1))} ₫
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className={styles['action-buttons']}>
                    <button className={styles['btn-primary']} onClick={() => navigate('/')}>Tiếp tục mua sắm</button>
                    <button className={styles['btn-secondary']} onClick={() => navigate('/history')}>Xem lịch sử mua hàng</button>
                </div>
            </div>
        </main>
    );
}

export default OrderSuccess;