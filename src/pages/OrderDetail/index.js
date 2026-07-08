import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import styles from './OrderDetail.module.scss';
import OrderService from '../../services/OrderService';

function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [canceling, setCanceling] = useState(false);
  const [actionMessage, setActionMessage] = useState('');

  const loadOrder = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await OrderService.getOrderById(id);
      setOrder(data?.data || data);
    } catch (err) {
      console.error(err);
      setError(err?.response?.data || err.message || 'Không thể tải chi tiết đơn hàng.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) loadOrder();
  }, [id]);

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return isNaN(date.getTime())
        ? dateString
        : date.toLocaleString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        });
  };

  const formatMoney = (amount) => {
    if (amount == null) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const getStatusBadge = (status) => {
    const s = (status || '').toString().trim().toLowerCase();
    if (s.includes('đã giao') || s.includes('thành công') || s.includes('completed')) return styles.badgeSuccess;
    if (s.includes('đang giao') || s.includes('shipping') || s.includes('processing')) return styles.badgeWarning;
    if (s.includes('hủy') || s.includes('cancel')) return styles.badgeDanger;
    return styles.badgeInfo;
  };

  const normalizeStatus = (value) => (value || '').toString().trim().toLowerCase();
  const isPending = normalizeStatus(order?.status) === 'pending' || normalizeStatus(order?.status) === 'đang xử lý';
  const items = order?.items || order?.orderItems || [];

  const handleCancelOrder = async () => {
    if (!order?.id) return;

    const confirmed = window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này không? Hành động này không thể hoàn tác.');
    if (!confirmed) return;

    setCanceling(true);
    setActionMessage('');
    try {
      const updatedOrder = await OrderService.cancelOrder(order.id);
      setOrder(updatedOrder?.data || updatedOrder);
      setActionMessage('Đơn hàng đã được hủy thành công.');
    } catch (err) {
      console.error(err);
      setActionMessage(err?.response?.data || err.message || 'Có lỗi xảy ra, không thể hủy đơn hàng.');
    } finally {
      setCanceling(false);
    }
  };

  if (loading) {
    return (
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <p>Đang tải thông tin đơn hàng...</p>
        </div>
    );
  }

  if (error || !order) {
    return (
        <div className={styles.errorState}>
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2>{error || 'Không tìm thấy đơn hàng.'}</h2>
          <button className={styles.btnPrimary} onClick={() => navigate('/history')}>Quay lại lịch sử mua hàng</button>
        </div>
    );
  }

  const orderCode = order.orderCode || `#${order.id}`;

  return (
      <main className={styles.mainContainer}>
        <div className={styles.wrapper}>
          <nav className={styles.breadcrumb}>
            <Link to="/">Trang chủ</Link>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            <Link to="/history">Lịch sử mua hàng</Link>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            <span className={styles.currentBreadcrumb}>Chi tiết đơn {orderCode}</span>
          </nav>

          <header className={styles.pageHeader}>
            <div className={styles.headerLeft}>
              <h1 className={styles.title}>Đơn hàng {orderCode}</h1>
              <p className={styles.orderDate}>Ngày đặt: {formatDate(order.createdAt || order.created_at)}</p>
            </div>
            <div className={styles.headerRight}>
              <div className={`${styles.statusBadge} ${getStatusBadge(order.status)}`}>
                {order.status || 'Đang xử lý'}
              </div>
            </div>
          </header>

          {actionMessage && (
              <div className={`${styles.message} ${actionMessage.includes('thành công') ? styles.success : styles.error}`}>
                {actionMessage}
              </div>
          )}

          <div className={styles.gridContainer}>
            <div className={styles.mainCol}>
              <section className={styles.card}>
                <h2 className={styles.cardTitle}>Sản phẩm đã đặt ({items.length})</h2>
                <div className={styles.itemsList}>
                  {items.length === 0 ? (
                      <div className={styles.emptyState}>Không có sản phẩm nào trong đơn hàng.</div>
                  ) : (
                      items.map((it, idx) => {
                        const qty = it.quantity ?? it.qty ?? it.amount ?? 1;
                        const price = it.price ?? it.unitPrice ?? it.salePrice ?? 0;
                        const totalItemPrice = qty * price;

                        return (
                            <div key={idx} className={styles.itemRow}>
                              <img
                                  src={it.productImage || it.imageUrl || 'https://via.placeholder.com/80?text=SP'}
                                  alt={it.productName || it.name || it.title}
                                  className={styles.itemImage}
                                  onError={(e) => { e.target.src = 'https://via.placeholder.com/80?text=SP'; }}
                              />
                              <div className={styles.itemInfo}>
                                <h3 className={styles.itemName}>{it.productName || it.name || it.title}</h3>
                                <p className={styles.itemVariant}>
                                  {it.color && `Màu: ${it.color}`} {it.color && it.size && ' | '} {it.size && `Size: ${it.size}`}
                                </p>
                                <div className={styles.itemPriceMobile}>
                                  <span>{formatMoney(price)}</span>
                                  <span>x{qty}</span>
                                </div>
                              </div>
                              <div className={styles.itemPriceQty}>
                                <span className={styles.itemPrice}>{formatMoney(price)}</span>
                                <span className={styles.itemQty}>Số lượng: {qty}</span>
                              </div>
                              <div className={styles.itemSubtotal}>
                                {formatMoney(totalItemPrice)}
                              </div>
                            </div>
                        );
                      })
                  )}
                </div>
              </section>
            </div>

            <aside className={styles.sideCol}>
              <section className={styles.card}>
                <h2 className={styles.cardTitle}>Thông tin nhận hàng</h2>
                <div className={styles.infoBlock}>
                  <p className={styles.infoName}>{order.shippingName || order.customerName || '—'}</p>
                  <p className={styles.infoText}><strong>SĐT:</strong> {order.shippingPhone || order.customerPhone || '—'}</p>
                  <p className={styles.infoText}><strong>Địa chỉ:</strong> {order.shippingAddress || '—'}</p>
                  {order.notes && (
                      <div className={styles.noteBox}>
                        <strong>Ghi chú:</strong> {order.notes}
                      </div>
                  )}
                </div>
              </section>

              <section className={styles.card}>
                <h2 className={styles.cardTitle}>Thanh toán</h2>
                <div className={styles.summaryRow}>
                  <span>Tạm tính</span>
                  <span>{formatMoney((order.finalAmount ?? order.totalAmount) - (order.shippingFee ?? 0) + (order.discount ?? 0))}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span>Phí vận chuyển</span>
                  <span>{formatMoney(order.shippingFee ?? 0)}</span>
                </div>
                {order.discount > 0 && (
                    <div className={`${styles.summaryRow} ${styles.discountRow}`}>
                      <span>Giảm giá</span>
                      <span>-{formatMoney(order.discount)}</span>
                    </div>
                )}
                <div className={styles.summaryTotal}>
                  <span>Tổng cộng</span>
                  <span className={styles.totalPrice}>{formatMoney(order.finalAmount ?? order.totalAmount)}</span>
                </div>
              </section>

              <div className={styles.actionButtons}>
                {isPending && (
                    <button
                        className={styles.btnDanger}
                        onClick={handleCancelOrder}
                        disabled={canceling}
                    >
                      {canceling ? 'Đang xử lý...' : 'Hủy đơn hàng'}
                    </button>
                )}
                <button className={styles.btnSecondary} onClick={() => navigate('/history')}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                  Quay lại danh sách
                </button>
              </div>
            </aside>
          </div>
        </div>
      </main>
  );
}

export default OrderDetail;