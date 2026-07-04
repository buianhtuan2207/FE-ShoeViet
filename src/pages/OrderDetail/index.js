import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import styles from './OrderDetail.module.scss';
import OrderService from '../../services/OrderService';

function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await OrderService.getOrderById(id);
        setOrder(data);
      } catch (err) {
        console.error(err);
        setError(err?.response?.data || err.message || 'Không thể tải đơn hàng.');
      } finally {
        setLoading(false);
      }
    };

    if (id) load();
  }, [id]);

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? dateString : date.toLocaleString('vi-VN');
  };

  const formatMoney = (amount) => {
    if (amount == null) return '-';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const items = order?.items || order?.orderItems || [];

  return (
    <main className={styles.mainContainer}>
      <div className={styles.wrapper}>
        <header className={styles.header}>
          <h1 className={styles.title}>Chi tiết đơn hàng</h1>
          <p className={styles.subtitle}>Xem chi tiết đơn hàng của bạn</p>
        </header>

        {loading ? (
          <div className={styles.emptyState}>Đang tải đơn hàng...</div>
        ) : error ? (
          <div className={styles.emptyState}>{error}</div>
        ) : !order ? (
          <div className={styles.emptyState}>Không tìm thấy đơn hàng.</div>
        ) : (
          <section>
            <div className={styles.orderInfo}>
              <div><strong>Mã đơn:</strong> {order.orderCode || `#${order.id}`}</div>
              <div><strong>Trạng thái:</strong> {order.status || '-'}</div>
              <div><strong>Ngày đặt:</strong> {formatDate(order.createdAt || order.created_at)}</div>
              <div><strong>Tổng:</strong> {formatMoney(order.finalAmount ?? order.totalAmount)}</div>
            </div>

            <div className={styles.itemsList}>
              {items.length === 0 ? (
                <div className={styles.emptyState}>Không có sản phẩm trong đơn hàng.</div>
              ) : (
                items.map((it, idx) => (
                  <div key={idx} className={styles.itemRow}>
                    <div className={styles.itemMeta}>
                      <div className={styles.itemName}>{it.productName || it.name || it.title}</div>
                      <div className={styles.itemQty}>Số lượng: {it.quantity ?? it.qty ?? it.amount}</div>
                    </div>
                    <div className={styles.itemPrice}>{formatMoney(it.price ?? it.unitPrice ?? it.salePrice)}</div>
                  </div>
                ))
              )}
            </div>

            <div className={styles.totals}>
              <div><strong>Phí vận chuyển:</strong> {formatMoney(order.shippingFee ?? 0)}</div>
              <div><strong>Giảm giá:</strong> {formatMoney(order.discount ?? 0)}</div>
              <div className={styles.total}><strong>Thanh toán:</strong> {formatMoney(order.finalAmount ?? order.totalAmount)}</div>
            </div>

            <div style={{ marginTop: 20 }}>
              <Link to="/history" className={styles.backLink}>Quay về lịch sử đơn hàng</Link>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

export default OrderDetail;
