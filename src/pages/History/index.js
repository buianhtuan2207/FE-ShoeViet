import React, { useEffect, useState, useMemo } from 'react';
import styles from './History.module.scss';
import { Link } from 'react-router-dom';
import OrderService from '../../services/OrderService';
import { userService } from '../../services/UserService';

const FILTER_TABS = ['Tất cả', 'Đang xử lý', 'Đang giao', 'Đã giao', 'Đã hủy'];
const ITEMS_PER_PAGE = 3;

function History() {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('Tất cả');
    const [currentPage, setCurrentPage] = useState(1);

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

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, activeTab]);

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return isNaN(date.getTime()) ? dateString : date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    const formatMoney = (amount) => {
        if (amount == null) return '0 đ';
        return new Intl.NumberFormat('vi-VN').format(amount) + ' đ';
    };

    const filteredOrders = useMemo(() => {
        return orders.filter(order => {
            const code = order.orderCode || `#${order.id}`;
            const matchSearch = code.toLowerCase().includes(searchTerm.toLowerCase());

            let matchTab = true;
            if (activeTab !== 'Tất cả') {
                const currentStatus = order.status || 'Đang xử lý';
                matchTab = currentStatus.toLowerCase() === activeTab.toLowerCase();
            }

            return matchSearch && matchTab;
        });
    }, [orders, searchTerm, activeTab]);

    const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE) || 1;
    const paginatedOrders = filteredOrders.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const getStatusStyle = (status) => {
        const s = (status || '').toLowerCase();
        if (s.includes('giao hàng') || s.includes('đã giao')) return { icon: 'check_circle', class: styles.statusDelivered };
        if (s.includes('đang xử lý')) return { icon: 'schedule', class: styles.statusPending };
        if (s.includes('đang giao')) return { icon: 'local_shipping', class: styles.statusShipping };
        if (s.includes('hủy')) return { icon: 'cancel', class: styles.statusCancelled };
        return { icon: 'info', class: styles.statusDefault };
    };

    return (
        <main className={styles.mainContainer}>
            <div className={styles.wrapper}>
                <nav className={styles.breadcrumb}>
                    <Link to="/">Trang chủ</Link> &gt; <span>Lịch sử mua hàng</span>
                </nav>

                <header className={styles.header}>
                    <h1 className={styles.title}>Lịch sử mua hàng</h1>
                </header>

                <div className={styles.filterSection}>
                    <div className={styles.searchBox}>
                        <span className="material-symbols-outlined">search</span>
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo mã đơn hàng..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className={styles.tabs}>
                        {FILTER_TABS.map(tab => (
                            <button
                                key={tab}
                                className={`${styles.tabBtn} ${activeTab === tab ? styles.activeTab : ''}`}
                                onClick={() => setActiveTab(tab)}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                <section className={styles.ordersList}>
                    {isLoading ? (
                        <div className={styles.emptyState}>
                            <div className={styles.spinner}></div>
                            <p>Đang tải đơn hàng...</p>
                        </div>
                    ) : error ? (
                        <div className={styles.emptyState}>
                            <p>{error}</p>
                            <Link to="/" className={styles.continueBtn}>Quay lại mua sắm</Link>
                        </div>
                    ) : paginatedOrders.length === 0 ? (
                        <div className={styles.emptyState}>
                            <p>Không tìm thấy đơn hàng nào.</p>
                            <Link to="/product" className={styles.continueBtn}>Mua sắm ngay</Link>
                        </div>
                    ) : (
                        paginatedOrders.map((order) => {
                            const orderCode = order.orderCode || `#SL-${order.id}`;
                            const statusInfo = getStatusStyle(order.status || 'Đang xử lý');

                            const items = order.orderItems || [];
                            const firstItem = items[0] || {};
                            const extraItemsCount = items.length - 1;

                            return (
                                <article key={order.id} className={styles.orderCard}>
                                    <div className={styles.cardHeader}>
                                        <div className={styles.headerLeft}>
                                            <span className={styles.orderId}>{orderCode}</span>
                                            <span className={styles.divider}>|</span>
                                            <span className={styles.orderDate}>Ngày đặt: {formatDate(order.createdAt)}</span>
                                        </div>
                                        <div className={`${styles.orderStatus} ${statusInfo.class}`}>
                                            <span className="material-symbols-outlined">{statusInfo.icon}</span>
                                            {order.status || 'Đang xử lý'}
                                        </div>
                                    </div>

                                    <div className={styles.cardBody}>
                                        <div className={styles.productInfo}>
                                            <img
                                                src={firstItem.productImage || 'https://via.placeholder.com/80?text=Sneaker'}
                                                alt={firstItem.productName || 'Sản phẩm'}
                                                onError={(e) => { e.target.src = 'https://via.placeholder.com/80?text=Sneaker'; }}
                                            />
                                            <div className={styles.productMeta}>
                                                <h3 className={styles.productName}>{firstItem.productName || 'Sản phẩm giày Sneaker'}</h3>
                                                <p className={styles.productVariant}>
                                                    {firstItem.size && `Size: ${firstItem.size} `}
                                                    {firstItem.size && firstItem.color && `| `}
                                                    {firstItem.color && `Màu: ${firstItem.color} `}
                                                    {(firstItem.size || firstItem.color) && firstItem.quantity && `| `}
                                                    {firstItem.quantity && `SL: ${firstItem.quantity}`}
                                                </p>
                                                {extraItemsCount > 0 ? (
                                                    <span className={styles.extraItems}>+{extraItemsCount} sản phẩm khác</span>
                                                ) : (
                                                    <span className={styles.extraItems}>Sản phẩm duy nhất</span>
                                                )}
                                            </div>
                                        </div>

                                        <div className={styles.priceInfo}>
                                            <span className={styles.priceLabel}>Tổng thanh toán</span>
                                            <span className={styles.priceTotal}>{formatMoney(order.finalAmount ?? order.totalAmount)}</span>
                                        </div>
                                    </div>

                                    <div className={styles.cardFooter}>
                                        <Link to={`/order/${order.id}`} className={styles.btnOutline}>Xem chi tiết</Link>
                                        <button className={styles.btnSolid}>Mua lại</button>
                                    </div>
                                </article>
                            );
                        })
                    )}
                </section>

                {!isLoading && totalPages > 1 && (
                    <div className={styles.pagination}>
                        <button
                            className={styles.pageBtn}
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(p => p - 1)}
                        >
                            &lt;
                        </button>
                        {[...Array(totalPages)].map((_, i) => (
                            <button
                                key={i + 1}
                                className={`${styles.pageBtn} ${currentPage === i + 1 ? styles.activePage : ''}`}
                                onClick={() => setCurrentPage(i + 1)}
                            >
                                {i + 1}
                            </button>
                        ))}
                        <button
                            className={styles.pageBtn}
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(p => p + 1)}
                        >
                            &gt;
                        </button>
                    </div>
                )}
            </div>
        </main>
    );
}

export default History;