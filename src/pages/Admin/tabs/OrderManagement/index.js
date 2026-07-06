import React, { useEffect, useMemo, useState } from 'react';
import styles from './OrderManagement.module.scss';
import orderService from '../../../../services/OrderService';

const statusOptions = [
    { value: 'all', label: 'Tất cả trạng thái' },
    { value: 'pending', label: 'Đang chờ' },
    { value: 'confirmed', label: 'Đã xác nhận' },
    { value: 'shipping', label: 'Đang giao' },
    { value: 'completed', label: 'Hoàn tất' },
    { value: 'cancelled', label: 'Đã hủy' }
];

const STATUS_META = {
    pending: { label: 'Đang chờ', icon: 'pending_actions', className: 'pending' },
    confirmed: { label: 'Đã xác nhận', icon: 'verified', className: 'confirmed' },
    shipping: { label: 'Đang giao', icon: 'local_shipping', className: 'shipping' },
    completed: { label: 'Hoàn tất', icon: 'check_circle', className: 'completed' },
    cancelled: { label: 'Đã hủy', icon: 'cancel', className: 'cancelled' },
    shipped: { label: 'Đang giao', icon: 'local_shipping', className: 'shipping' },
    delivered: { label: 'Hoàn tất', icon: 'check_circle', className: 'completed' }
};

const BACKEND_STATUS_MAP = {
    pending: 'pending',
    confirmed: 'confirmed',
    shipping: 'shipped',
    completed: 'delivered',
    cancelled: 'cancelled'
};

function OrderManagement() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [updatingOrderId, setUpdatingOrderId] = useState(null);

    const loadOrders = async () => {
        try {
            setLoading(true);
            setError('');
            const data = await orderService.getAllOrders();
            setOrders(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Lỗi tải danh sách đơn hàng:', err);
            setError('Không thể tải đơn hàng từ máy chủ. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadOrders();
    }, []);

    const statsBentoData = useMemo(() => {
        const counts = {
            pending: 0,
            confirmed: 0,
            shipping: 0,
            completed: 0,
            cancelled: 0
        };

        orders.forEach((order) => {
            const normalizedStatus = (order.status || '').toLowerCase();
            if (normalizedStatus === 'pending') counts.pending += 1;
            else if (normalizedStatus === 'confirmed') counts.confirmed += 1;
            else if (normalizedStatus === 'shipping' || normalizedStatus === 'shipped') counts.shipping += 1;
            else if (normalizedStatus === 'completed' || normalizedStatus === 'delivered') counts.completed += 1;
            else if (normalizedStatus === 'cancelled' || normalizedStatus === 'canceled') counts.cancelled += 1;
        });

        return [
            { id: 'pending', label: 'Đang chờ', value: counts.pending.toLocaleString(), icon: 'pending_actions', trendText: 'Cần xử lý', trendType: 'positive' },
            { id: 'confirmed', label: 'Đã xác nhận', value: counts.confirmed.toLocaleString(), icon: 'verified', trendText: 'Đã duyệt', trendType: 'neutral' },
            { id: 'shipping', label: 'Đang giao', value: counts.shipping.toLocaleString(), icon: 'local_shipping', trendText: 'Đang vận chuyển', trendType: 'neutral' },
            { id: 'completed', label: 'Hoàn tất', value: counts.completed.toLocaleString(), icon: 'check_circle', trendText: 'Giao dịch thành công', trendType: 'positive' },
            { id: 'cancelled', label: 'Đã hủy', value: counts.cancelled.toLocaleString(), icon: 'cancel', trendText: 'Cần kiểm tra', trendType: 'negative' }
        ];
    }, [orders]);

    const filteredOrders = useMemo(() => {
        return orders.filter((order) => {
            const normalizedStatus = (order.status || '').toLowerCase();
            const matchesStatus = selectedStatus === 'all' || normalizedStatus === selectedStatus;
            const createdAt = order.createdAt ? new Date(order.createdAt) : null;
            const matchesDate = !selectedDate || (createdAt && createdAt.toISOString().slice(0, 10) === selectedDate);
            return matchesStatus && matchesDate;
        });
    }, [orders, selectedStatus, selectedDate]);

    const handleStatusChange = async (orderId, nextStatus) => {
        setUpdatingOrderId(orderId);
        try {
            const backendStatus = BACKEND_STATUS_MAP[nextStatus] || nextStatus;
            await orderService.updateOrderStatus(orderId, { status: backendStatus });
            await loadOrders();
        } catch (err) {
            console.error('Lỗi cập nhật trạng thái:', err);
            alert('Không thể cập nhật trạng thái đơn hàng. Vui lòng thử lại.');
        } finally {
            setUpdatingOrderId(null);
        }
    };

    const formatCurrency = (value) => {
        const amount = Number(value || 0);
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            maximumFractionDigits: 0
        }).format(amount);
    };

    const formatDateTime = (value) => {
        if (!value) return '—';
        return new Date(value).toLocaleString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const getStatusMeta = (status) => {
        const normalizedStatus = (status || '').toLowerCase();
        return STATUS_META[normalizedStatus] || STATUS_META.pending;
    };

    const getOrderItemsCount = (order) => {
        return order.orderItems?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
    };

    return (
        <main className={styles.main}>
            <div className={styles.pageContent}>
                <div className={styles.innerContainer}>
                    <div className={styles.pageTitleRow}>
                        <div>
                            <h2 className={styles.pageTitle}>Quản lý đơn hàng</h2>
                            <p className={styles.pageSubtitle}>Theo dõi, lọc và cập nhật trạng thái đơn hàng từ khách hàng.</p>
                        </div>
                    </div>

                    <div className={styles.statsBentoGrid}>
                        {statsBentoData.map((stat) => (
                            <div key={stat.id} className={styles.statCard}>
                                <div className={styles.statCardHeader}>
                                    <span className={styles.statLabel}>{stat.label}</span>
                                    <span className={`material-symbols-outlined ${styles.statIcon} ${styles[stat.id]}`}>
                                        {stat.icon}
                                    </span>
                                </div>
                                <h3 className={styles.statValue}>{stat.value}</h3>
                                <div className={`${styles.statTrend} ${styles[stat.trendType]}`}>
                                    {stat.trendType === 'positive' && (
                                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>trending_up</span>
                                    )}
                                    {stat.trendType === 'negative' && (
                                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>trending_down</span>
                                    )}
                                    {stat.trendText}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className={styles.tableContainerCard}>
                        <div className={styles.filtersHeader}>
                            <div className={styles.filterControlsLeft}>
                                <div className={styles.selectGroupBlock}>
                                    <span className={styles.filterMetaLabel}>Trạng thái:</span>
                                    <select
                                        className={styles.selectDropdown}
                                        value={selectedStatus}
                                        onChange={(e) => setSelectedStatus(e.target.value)}
                                    >
                                        {statusOptions.map((option) => (
                                            <option key={option.value} value={option.value}>{option.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className={styles.dateGroupBlock}>
                                    <span className={styles.filterMetaLabel}>Ngày đặt:</span>
                                    <input
                                        className={styles.dateInput}
                                        type="date"
                                        value={selectedDate}
                                        onChange={(e) => setSelectedDate(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className={styles.tableWrapper}>
                            {loading ? (
                                <div className={styles.loadingState}>Đang tải dữ liệu đơn hàng...</div>
                            ) : error ? (
                                <div className={styles.emptyState}>{error}</div>
                            ) : filteredOrders.length === 0 ? (
                                <div className={styles.emptyState}>Không có đơn hàng phù hợp với bộ lọc hiện tại.</div>
                            ) : (
                                <table className={styles.table}>
                                    <thead>
                                    <tr>
                                        <th className={styles.th}>Mã đơn hàng</th>
                                        <th className={styles.th}>Khách hàng</th>
                                        <th className={styles.th}>Ngày đặt</th>
                                        <th className={styles.th}>Tổng tiền</th>
                                        <th className={styles.th}>Thanh toán</th>
                                        <th className={styles.th}>Trạng thái</th>
                                        <th className={`${styles.th} ${styles.textRight}`}>Thao tác</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {filteredOrders.map((order, idx) => {
                                        const statusMeta = getStatusMeta(order.status);
                                        return (
                                            <tr key={order.id} className={`${styles.tr} ${idx % 2 === 1 ? styles.zebraRow : ''}`}>
                                                <td className={`${styles.td} ${styles.orderId}`}>
                                                    <div className={styles.orderCodeBlock}>
                                                        <span>{order.orderCode || `#ORD-${order.id}`}</span>
                                                        <small>{getOrderItemsCount(order)} sản phẩm</small>
                                                    </div>
                                                </td>
                                                <td className={styles.td}>
                                                    <div className={styles.customerBox}>
                                                        <span className={styles.customerName}>{order.shippingName || `Khách hàng #${order.userId || order.id}`}</span>
                                                        <span className={styles.customerEmail}>{order.shippingPhone || '—'}</span>
                                                    </div>
                                                </td>
                                                <td className={`${styles.td} ${styles.dateTimeText}`}>{formatDateTime(order.createdAt)}</td>
                                                <td className={`${styles.td} ${styles.totalPrice}`}>{formatCurrency(order.finalAmount || order.totalAmount)}</td>
                                                <td className={styles.td}>
                                                    <span className={styles.paymentBadge}>{order.paymentMethod || 'COD'}</span>
                                                </td>
                                                <td className={styles.td}>
                                                    <select
                                                        className={styles.statusSelect}
                                                        value={order.status || 'pending'}
                                                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                                        disabled={updatingOrderId === order.id}
                                                    >
                                                        {statusOptions.slice(1).map((option) => (
                                                            <option key={option.value} value={option.value}>{option.label}</option>
                                                        ))}
                                                    </select>
                                                    <span className={`${styles.statusBadge} ${styles[statusMeta.className]}`}>
                                                        {statusMeta.label}
                                                    </span>
                                                </td>
                                                <td className={`${styles.td} ${styles.textRight}`}>
                                                    <div className={styles.rowActions}>
                                                        <button
                                                            className={styles.actionRowBtn}
                                                            title="Chi tiết"
                                                            onClick={() => setSelectedOrder(order)}
                                                        >
                                                            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>visibility</span>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    </tbody>
                                </table>
                            )}
                        </div>

                        <div className={styles.pagination}>
                            <span className={styles.paginationInfoText}>Hiển thị {filteredOrders.length} đơn hàng</span>
                            <div className={styles.paginationControls}>
                                <button className={styles.pageNavBtn} disabled>
                                    <span className="material-symbols-outlined">chevron_left</span>
                                </button>
                                <button className={`${styles.pageNumberBtn} ${styles.active}`}>1</button>
                                <button className={styles.pageNavBtn}>
                                    <span className="material-symbols-outlined">chevron_right</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className={styles.footerSummaryGrid}>
                        <div className={styles.performanceSummaryBox}>
                            <div className={styles.analyticsIconWrapper}>
                                <span className="material-symbols-outlined" style={{ fontSize: '48px' }}>analytics</span>
                            </div>
                            <div className={styles.perfContent}>
                                <h3 className={styles.perfTitle}>Tóm tắt hiệu suất hôm nay</h3>
                                <p className={styles.perfDescription}>
                                    Các đơn hàng đang được theo dõi theo thời gian thực và có thể cập nhật trạng thái ngay từ bảng quản trị.
                                </p>
                                <div className={styles.perfTagsGroup}>
                                    <div className={styles.perfTagItem}>
                                        <div className={`${styles.dotIndicator} ${styles.primary}`}></div>
                                        <span>Đã xử lý: {statsBentoData.find((item) => item.id === 'completed')?.value || 0}</span>
                                    </div>
                                    <div className={styles.perfTagItem}>
                                        <div className={`${styles.dotIndicator} ${styles.amber}`}></div>
                                        <span>Chờ xử lý: {statsBentoData.find((item) => item.id === 'pending')?.value || 0}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className={styles.alertNotificationCard}>
                            <h3 className={styles.alertCardTitle}>Thông báo mới</h3>
                            <p className={styles.alertCardText}>Quản trị viên có thể kiểm tra và cập nhật toàn bộ trạng thái đơn hàng ngay tại đây.</p>
                            <button className={styles.checkNowBtn} onClick={() => loadOrders()}>Tải lại dữ liệu</button>
                            <span className={`${styles.bgDecorativeIcon} material-symbols-outlined`}>priority_high</span>
                        </div>
                    </div>
                </div>
            </div>

            {selectedOrder && (
                <div className={styles.modalOverlay} onClick={() => setSelectedOrder(null)}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <div>
                                <h3 className={styles.modalTitle}>Chi tiết đơn hàng</h3>
                                <p className={styles.modalSubtitle}>{selectedOrder.orderCode || `#ORD-${selectedOrder.id}`}</p>
                            </div>
                            <button className={styles.closeBtn} onClick={() => setSelectedOrder(null)}>
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className={styles.detailGrid}>
                            <div className={styles.detailCard}>
                                <h4>Thông tin người nhận</h4>
                                <p><strong>Họ tên:</strong> {selectedOrder.shippingName || '—'}</p>
                                <p><strong>Số điện thoại:</strong> {selectedOrder.shippingPhone || '—'}</p>
                                <p><strong>Địa chỉ:</strong> {selectedOrder.shippingAddress || '—'}</p>
                                <p><strong>Ghi chú:</strong> {selectedOrder.notes || 'Không có'}</p>
                            </div>
                            <div className={styles.detailCard}>
                                <h4>Thông tin thanh toán</h4>
                                <p><strong>Phương thức:</strong> {selectedOrder.paymentMethod || 'COD'}</p>
                                <p><strong>Trạng thái thanh toán:</strong> {selectedOrder.paymentStatus || 'unpaid'}</p>
                                <p><strong>Giảm giá:</strong> {formatCurrency(selectedOrder.discountAmount)}</p>
                                <p><strong>Phí ship:</strong> {formatCurrency(selectedOrder.shippingFee)}</p>
                                <p><strong>Tổng tiền:</strong> {formatCurrency(selectedOrder.finalAmount || selectedOrder.totalAmount)}</p>
                            </div>
                        </div>

                        <div className={styles.detailCard}>
                            <h4>Sản phẩm trong đơn</h4>
                            <div className={styles.itemList}>
                                {(selectedOrder.orderItems || []).map((item) => (
                                    <div key={item.id} className={styles.itemRow}>
                                        <div>
                                            <strong>{item.productName || 'Sản phẩm'}</strong>
                                            <div className={styles.itemMeta}>{item.size ? `Size ${item.size}` : ''}{item.color ? ` • ${item.color}` : ''}</div>
                                        </div>
                                        <div className={styles.itemPrice}>
                                            <span>x{item.quantity}</span>
                                            <strong>{formatCurrency(item.totalPrice || item.unitPrice)}</strong>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}

export default OrderManagement;