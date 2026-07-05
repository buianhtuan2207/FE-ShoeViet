import React, { useState, useEffect } from 'react';
import styles from './OrderManagement.module.scss';
import OrderService from '../../../../services/OrderService';

function OrderManagement() {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // State để lưu trữ bộ lọc trạng thái hiện tại
    const [filterStatus, setFilterStatus] = useState('all');

    // Gọi API lấy danh sách đơn hàng
    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setIsLoading(true);
                const data = await OrderService.getAllOrders();
                setOrders(data);
            } catch (error) {
                console.error("Lỗi khi tải danh sách đơn hàng:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchOrders();
    }, []);

    // 1. Hàm map trạng thái từ Backend sang UI
    const getStatusUI = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending': return { text: 'Đang chờ', key: 'pending' };
            case 'confirmed': return { text: 'Đã xác nhận', key: 'confirmed' };
            case 'shipping': case 'shipped': return { text: 'Đang giao', key: 'shipping' };
            case 'completed': case 'delivered': return { text: 'Hoàn tất', key: 'completed' };
            case 'cancelled': return { text: 'Đã hủy', key: 'cancelled' };
            default: return { text: status || 'Không rõ', key: 'pending' };
        }
    };

    // 2. Tính toán linh động dữ liệu cho khối Bento Thống kê dựa trên mảng orders
    const statsCount = { pending: 0, confirmed: 0, shipping: 0, completed: 0, cancelled: 0 };
    orders.forEach(order => {
        const key = getStatusUI(order.status).key;
        if (statsCount[key] !== undefined) statsCount[key]++;
    });

    const dynamicStatsBentoData = [
        { id: 'pending', label: 'Đang chờ', value: statsCount.pending, icon: 'pending_actions', trendText: 'Cần xử lý', trendType: 'neutral' },
        { id: 'confirmed', label: 'Đã xác nhận', value: statsCount.confirmed, icon: 'verified', trendText: 'Đã duyệt', trendType: 'positive' },
        { id: 'shipping', label: 'Đang giao', value: statsCount.shipping, icon: 'local_shipping', trendText: 'Đang vận chuyển', trendType: 'neutral' },
        { id: 'completed', label: 'Hoàn tất', value: statsCount.completed, icon: 'check_circle', trendText: 'Thành công', trendType: 'positive' },
        { id: 'cancelled', label: 'Đã hủy', value: statsCount.cancelled, icon: 'cancel', trendText: 'Khách hủy', trendType: 'negative' }
    ];

    // 3. Lọc mảng orders dựa trên trạng thái đã chọn
    const filteredOrders = orders.filter(order => {
        if (filterStatus === 'all') return true;
        return getStatusUI(order.status).key === filterStatus;
    });

    // Hàm định dạng tiền tệ và ngày tháng
    const formatCurrency = (amount) => {
        if (amount == null) return '0₫';
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleString('vi-VN', {
            hour: '2-digit', minute: '2-digit',
            day: '2-digit', month: '2-digit', year: 'numeric'
        });
    };

    return (
        <main className={styles.main}>
            <div className={styles.pageContent}>
                <div className={styles.innerContainer}>

                    {/* Page Title & CTA */}
                    <div className={styles.pageTitleRow}>
                        <div>
                            <h2 className={styles.pageTitle}>Quản lý đơn hàng</h2>
                            <p className={styles.pageSubtitle}>Kiểm soát và xử lý tất cả các giao dịch từ khách hàng.</p>
                        </div>
                        <button className={styles.createOrderBtn}>
                            <span className="material-symbols-outlined">add</span>
                            Tạo đơn hàng mới
                        </button>
                    </div>

                    {/* Stats Bento Grid - CÓ THỂ BẤM ĐỂ LỌC */}
                    <div className={styles.statsBentoGrid}>
                        {dynamicStatsBentoData.map((stat) => (
                            <div
                                key={stat.id}
                                className={`${styles.statCard} ${filterStatus === stat.id ? styles.activeFilter : ''}`}
                                onClick={() => setFilterStatus(filterStatus === stat.id ? 'all' : stat.id)} // Bấm lại sẽ hủy lọc
                                style={{ cursor: 'pointer' }}
                                title="Nhấn để lọc đơn hàng"
                            >
                                <div className={styles.statCardHeader}>
                                    <span className={styles.statLabel}>{stat.label}</span>
                                    <span className={`material-symbols-outlined ${styles.statIcon} ${styles[stat.id]}`}>
                                        {stat.icon}
                                    </span>
                                </div>
                                <h3 className={styles.statValue}>{stat.value}</h3>
                                <div className={`${styles.statTrend} ${styles[stat.trendType]}`}>
                                    {stat.trendType === 'positive' && <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>trending_up</span>}
                                    {stat.trendType === 'negative' && <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>trending_down</span>}
                                    {stat.trendText}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Filters and Table Area Container */}
                    <div className={styles.tableContainerCard}>
                        {/* Filters Header */}
                        <div className={styles.filtersHeader}>
                            <div className={styles.filterControlsLeft}>
                                <div className={styles.selectGroupBlock}>
                                    <span className={styles.filterMetaLabel}>Trạng thái:</span>
                                    {/* Liên kết value của thẻ select với state filterStatus */}
                                    <select
                                        className={styles.selectDropdown}
                                        value={filterStatus}
                                        onChange={(e) => setFilterStatus(e.target.value)}
                                    >
                                        <option value="all">Tất cả trạng thái</option>
                                        <option value="pending">Đang chờ</option>
                                        <option value="confirmed">Đã xác nhận</option>
                                        <option value="shipping">Đang giao</option>
                                        <option value="completed">Hoàn tất</option>
                                        <option value="cancelled">Đã hủy</option>
                                    </select>
                                </div>

                                <div className={styles.dateGroupBlock}>
                                    <span className={styles.filterMetaLabel}>Ngày đặt:</span>
                                    <input className={styles.dateInput} type="date" />
                                </div>
                            </div>

                            <div className={styles.filterControlsRight}>
                                <button className={styles.actionUtilBtn}>
                                    <span className="material-symbols-outlined">filter_list</span>
                                    Lọc nâng cao
                                </button>
                                <button className={styles.actionUtilBtn}>
                                    <span className="material-symbols-outlined">download</span>
                                    Xuất báo cáo
                                </button>
                            </div>
                        </div>

                        {/* Table Area */}
                        <div className={styles.tableWrapper}>
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
                                {isLoading ? (
                                    <tr>
                                        <td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>
                                            Đang tải dữ liệu đơn hàng...
                                        </td>
                                    </tr>
                                ) : filteredOrders.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>
                                            Không tìm thấy đơn hàng nào ở trạng thái này.
                                        </td>
                                    </tr>
                                ) : (
                                    // SỬ DỤNG MẢNG ĐÃ LỌC (filteredOrders) THAY VÌ TẤT CẢ (orders)
                                    filteredOrders.map((order, idx) => {
                                        const statusUI = getStatusUI(order.status);
                                        const isZebra = idx % 2 !== 0;

                                        return (
                                            <tr key={order.id || idx} className={`${styles.tr} ${isZebra ? styles.zebraRow : ''}`}>
                                                <td className={`${styles.td} ${styles.orderId}`}>{order.orderCode}</td>
                                                <td className={styles.td}>
                                                    <div className={styles.customerBox}>
                                                        <span className={styles.customerName}>{order.shippingName}</span>
                                                        <span className={styles.customerEmail}>{order.shippingPhone}</span>
                                                    </div>
                                                </td>
                                                <td className={`${styles.td} ${styles.dateTimeText}`}>{formatDate(order.createdAt)}</td>
                                                <td className={`${styles.td} ${styles.totalPrice}`}>{formatCurrency(order.finalAmount)}</td>
                                                <td className={styles.td}>
                                                    {/* HIỂN THỊ CHỮ COD */}
                                                    <span className={styles.paymentBadge}>
                                                        {(order.paymentMethod === 'COD' || order.paymentMethod?.toLowerCase() === 'thanh toán khi nhận hàng')
                                                            ? 'COD'
                                                            : order.paymentMethod}
                                                    </span>
                                                </td>
                                                <td className={styles.td}>
                                                    <span className={`${styles.statusBadge} ${styles[statusUI.key]}`}>
                                                        {statusUI.text}
                                                    </span>
                                                </td>
                                                <td className={`${styles.td} ${styles.textRight}`}>
                                                    <div className={styles.rowActions}>
                                                        <button className={styles.actionRowBtn} title="Chi tiết">
                                                            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>visibility</span>
                                                        </button>
                                                        <button className={`${styles.actionRowBtn} ${styles.moreBtn}`} title="Thêm thao tác">
                                                            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>more_vert</span>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Footer */}
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
                </div>
            </div>
        </main>
    );
}

export default OrderManagement;