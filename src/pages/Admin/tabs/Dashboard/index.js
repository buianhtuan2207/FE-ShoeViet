import React, { useEffect, useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import styles from './Dashboard.module.scss';
import OrderService from '../../../../services/OrderService';
import ProductService from '../../../../services/ProductService';

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
    return new Date(value).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
};

const formatYAxis = (value) => {
    if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)} Tỷ`;
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)} Tr`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)} K`;
    return value;
};

const getStatusConfig = (status) => {
    const normalizedStatus = (status || '').toLowerCase();
    switch (normalizedStatus) {
        case 'pending': return { theme: 'pending', text: 'Đang chờ' };
        case 'confirmed': return { theme: 'processing', text: 'Đã xác nhận' };
        case 'shipping':
        case 'shipped': return { theme: 'processing', text: 'Đang giao' };
        case 'completed':
        case 'delivered': return { theme: 'delivered', text: 'Hoàn tất' };
        case 'cancelled':
        case 'canceled': return { theme: 'cancelled', text: 'Đã hủy' };
        default: return { theme: 'pending', text: 'Chờ xử lý' };
    }
};

function Dashboard() {
    const [orders, setOrders] = useState([]);
    const [allProducts, setAllProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [chartFilter, setChartFilter] = useState("30");

    const [summaryCards, setSummaryCards] = useState([
        { title: 'Tổng doanh thu', value: '0đ', subtext: 'Tính từ hệ thống', icon: 'payments', iconTheme: 'primary', trend: '+0%', trendType: 'positive', trendIcon: 'trending_up' },
        { title: 'Tổng đơn hàng', value: '0', subtext: 'Đơn hàng đã ghi nhận', icon: 'local_shipping', iconTheme: 'secondary', trend: '+0%', trendType: 'positive', trendIcon: 'trending_up' },
        { title: 'Khách hàng mới', value: '---', subtext: 'Đăng ký trong 30 ngày qua', icon: 'person_add', iconTheme: 'tertiary', trend: '+0%', trendType: 'positive', trendIcon: 'trending_up' },
        { title: 'Chiến dịch đang chạy', value: '0', subtext: 'Chương trình khuyến mãi', icon: 'bolt', iconTheme: 'error', trend: 'Đang chạy', trendType: 'neutral', trendIcon: '' },
    ]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);

                const [ordersData, productsData] = await Promise.all([
                    OrderService.getAllOrders(),
                    ProductService.getAllProducts().catch(err => {
                        console.error(err);
                        return [];
                    })
                ]);

                const ordersArray = Array.isArray(ordersData) ? ordersData : [];
                const productsArray = Array.isArray(productsData) ? productsData : [];

                setAllProducts(productsArray);
                setOrders(ordersArray);

                const totalOrdersCount = ordersArray.length;
                const totalRevenue = ordersArray.reduce((acc, curr) => {
                    return acc + Number(curr.finalAmount || curr.totalAmount || 0);
                }, 0);

                setSummaryCards(prevCards => {
                    const updated = [...prevCards];
                    updated[0].value = formatCurrency(totalRevenue);
                    updated[1].value = totalOrdersCount.toLocaleString('vi-VN');
                    return updated;
                });

            } catch (err) {
                console.error(err);
                setError("Không thể tải dữ liệu từ máy chủ. Vui lòng thử lại sau.");
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const productStats = useMemo(() => {
        if (!allProducts || allProducts.length === 0) return { topSelling: [], unsold: [] };

        const fourMonthsAgo = new Date();
        fourMonthsAgo.setMonth(fourMonthsAgo.getMonth() - 4);

        const salesMap = {};
        orders.forEach(order => {
            const orderDate = new Date(order.createdAt);
            const normalizedStatus = (order.status || '').toLowerCase();

            if (orderDate >= fourMonthsAgo && normalizedStatus !== 'cancelled' && normalizedStatus !== 'canceled') {
                if (Array.isArray(order.orderItems)) {
                    order.orderItems.forEach(item => {
                        const pid = item.productId;
                        if (pid) {
                            salesMap[pid] = (salesMap[pid] || 0) + (item.quantity || 1);
                        }
                    });
                }
            }
        });

        const fullProductList = allProducts.map(product => {
            const pid = product.id || product._id;
            const sales = salesMap[pid] || 0;
            return {
                id: pid,
                name: product.name || 'Sản phẩm không tên',
                sales: sales,
                price: formatCurrency(product.basePrice || 0),
                img: product.imageUrl || product.image || product.thumbnail || 'https://via.placeholder.com/48?text=No+Img'
            };
        });

        const topSelling = fullProductList
            .filter(p => p.sales > 0)
            .sort((a, b) => b.sales - a.sales)
            .map(p => ({ ...p, salesText: `${p.sales} sản phẩm` }));

        const unsold = fullProductList
            .filter(p => p.sales === 0)
            .map(p => ({ ...p, salesText: '0 sản phẩm' }));

        return { topSelling, unsold };
    }, [orders, allProducts]);

    const chartData = useMemo(() => {
        const now = new Date();
        const dataMap = {};
        const result = [];

        if (chartFilter === "7" || chartFilter === "30") {
            const days = parseInt(chartFilter);
            for (let i = days - 1; i >= 0; i--) {
                const d = new Date(now);
                d.setDate(d.getDate() - i);
                const dateStr = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`;
                dataMap[dateStr] = 0;
            }

            const cutoffDate = new Date(now);
            cutoffDate.setDate(now.getDate() - days);

            orders.forEach(order => {
                const orderDate = new Date(order.createdAt);
                const status = (order.status || '').toLowerCase();
                if (orderDate >= cutoffDate && status !== 'cancelled' && status !== 'canceled') {
                    const dateStr = `${orderDate.getDate().toString().padStart(2, '0')}/${(orderDate.getMonth() + 1).toString().padStart(2, '0')}`;
                    if (dataMap[dateStr] !== undefined) {
                        dataMap[dateStr] += Number(order.finalAmount || order.totalAmount || 0);
                    }
                }
            });

            for (const [key, value] of Object.entries(dataMap)) {
                result.push({ name: key, value: value });
            }
        } else if (chartFilter === "year") {
            for (let i = 1; i <= 12; i++) {
                dataMap[`Thg ${i}`] = 0;
            }
            const currentYear = now.getFullYear();

            orders.forEach(order => {
                const orderDate = new Date(order.createdAt);
                const status = (order.status || '').toLowerCase();
                if (orderDate.getFullYear() === currentYear && status !== 'cancelled' && status !== 'canceled') {
                    const monthStr = `Thg ${orderDate.getMonth() + 1}`;
                    if (dataMap[monthStr] !== undefined) {
                        dataMap[monthStr] += Number(order.finalAmount || order.totalAmount || 0);
                    }
                }
            });

            for (const [key, value] of Object.entries(dataMap)) {
                result.push({ name: key, value: value });
            }
        }

        return result;
    }, [orders, chartFilter]);

    const isChartEmpty = useMemo(() => {
        return chartData.every(item => item.value === 0);
    }, [chartData]);

    const getOrderSummaryText = (order) => {
        if (!order.orderItems || order.orderItems.length === 0) return 'Đang cập nhật...';
        const firstItem = order.orderItems[0];
        const totalQuantity = order.orderItems.reduce((sum, item) => sum + (item.quantity || 0), 0);

        let text = firstItem.productName || 'Sản phẩm';
        if (totalQuantity > 1) {
            text += ` (và ${totalQuantity - 1} sp khác)`;
        }
        return text;
    };

    if (loading) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontWeight: 'bold' }}>Đang tải dữ liệu Dashboard...</div>;
    }

    if (error) {
        return <div style={{ color: '#dc2626', textAlign: 'center', padding: '40px', fontWeight: 'bold' }}>{error}</div>;
    }

    const recentOrdersToShow = orders.slice(0, 5);

    return (
        <main className={styles.main}>
            <div className={styles.summaryGrid}>
                {summaryCards.map((card, index) => (
                    <div key={index} className={styles.card}>
                        <div className={styles.cardHeader}>
                            <div className={`${styles.iconWrapper} ${styles[card.iconTheme]}`}>
                                <span className="material-symbols-outlined">{card.icon}</span>
                            </div>
                            <span className={`${styles.trendInfo} ${styles[card.trendType]}`}>
                                {card.trend}
                                {card.trendIcon && (
                                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                                        {card.trendIcon}
                                    </span>
                                )}
                            </span>
                        </div>
                        <p className={styles.cardLabel}>{card.title}</p>
                        <h3 className={styles.cardValue}>{card.value}</h3>
                        <p className={styles.cardSubtext}>{card.subtext}</p>
                    </div>
                ))}
            </div>

            <div className={styles.middleGrid}>
                <div className={styles.chartSection}>
                    <div className={styles.sectionHeader}>
                        <div>
                            <h4 className={styles.sectionTitle}>Xu hướng Doanh thu</h4>
                            <p className={styles.sectionSubtitle}>Thống kê chi tiết dựa trên đơn hàng hoàn tất</p>
                        </div>
                        <select
                            className={styles.selectInput}
                            value={chartFilter}
                            onChange={(e) => setChartFilter(e.target.value)}
                        >
                            <option value="30">30 ngày qua</option>
                            <option value="7">7 ngày qua</option>
                            <option value="year">Năm nay</option>
                        </select>
                    </div>

                    <div style={{ height: '320px', width: '100%', marginTop: '24px', position: 'relative' }}>
                        {isChartEmpty ? (
                            <div className={styles.emptyChartState}>
                                <span>Chưa có dữ liệu thống kê doanh thu trong khoảng thời gian này.</span>
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#edf2f7" />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 12, fill: '#64748b' }}
                                        dy={10}
                                        minTickGap={20}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 12, fill: '#64748b' }}
                                        tickFormatter={formatYAxis}
                                    />
                                    <Tooltip
                                        formatter={(value) => [formatCurrency(value), 'Doanh thu']}
                                        contentStyle={{ borderRadius: '8px', border: '1px solid #edf2f7', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        labelStyle={{ fontWeight: 'bold', color: '#0f172a', marginBottom: '4px' }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="value"
                                        stroke="#7e22ce"
                                        strokeWidth={3}
                                        dot={{ r: 4, fill: '#ffffff', strokeWidth: 2, stroke: '#7e22ce' }}
                                        activeDot={{ r: 6, fill: '#7e22ce', stroke: '#ffffff' }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                <div className={styles.productsTwinGrid}>
                    <div className={styles.topProductsSection}>
                        <div className={styles.sectionHeader}>
                            <h4 className={styles.sectionTitle}>Sản phẩm bán được (4 tháng)</h4>
                            <button className={styles.headerLink}>Xem tất cả</button>
                        </div>

                        <div className={styles.productList}>
                            {productStats.topSelling.length > 0 ? (
                                productStats.topSelling.map((product, index) => (
                                    <div key={index} className={styles.productItem}>
                                        <div className={styles.imgWrapper}>
                                            <img src={product.img} alt={product.name} className={styles.productImg} onError={(e) => { e.target.src = 'https://via.placeholder.com/48?text=No+Img'; }} />
                                        </div>
                                        <div className={styles.productInfo}>
                                            <p className={styles.productName}>{product.name}</p>
                                            <p className={styles.productSales}>{product.salesText}</p>
                                        </div>
                                        <p className={styles.productPrice}>{product.price}</p>
                                    </div>
                                ))
                            ) : (
                                <div className={styles.emptyState}>
                                    Chưa có dữ liệu sản phẩm trong 4 tháng qua.
                                </div>
                            )}
                        </div>
                    </div>

                    <div className={styles.topProductsSection}>
                        <div className={styles.sectionHeader}>
                            <h4 className={styles.sectionTitle}>Sản phẩm không bán được</h4>
                            <button className={styles.headerLink} style={{ color: '#dc2626' }}>Kiểm tra kho</button>
                        </div>

                        <div className={styles.productList}>
                            {productStats.unsold.length > 0 ? (
                                productStats.unsold.map((product, index) => (
                                    <div key={index} className={styles.productItem}>
                                        <div className={styles.imgWrapper}>
                                            <img src={product.img} alt={product.name} className={styles.productImg} onError={(e) => { e.target.src = 'https://via.placeholder.com/48?text=No+Img'; }} />
                                        </div>
                                        <div className={styles.productInfo}>
                                            <p className={styles.productName}>{product.name}</p>
                                            <p className={styles.productSales} style={{ color: '#dc2626' }}>{product.salesText}</p>
                                        </div>
                                        <p className={styles.productPrice} style={{ color: '#64748b' }}>{product.price}</p>
                                    </div>
                                ))
                            ) : (
                                <div className={styles.emptyState}>
                                    Tất cả sản phẩm đều đã có lượt bán! 🎉
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.tableContainer}>
                <div className={styles.tableHeader}>
                    <div>
                        <h4 className={styles.sectionTitle}>Đơn hàng gần đây</h4>
                        <p className={styles.sectionSubtitle}>Cập nhật thời gian thực từ API</p>
                    </div>
                    <div className={styles.buttonGroup}>
                        <button className={styles.btnSecondary}>Xuất file CSV</button>
                        <button className={styles.btnPrimary}>Tạo đơn mới</button>
                    </div>
                </div>

                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                        <tr>
                            <th className={styles.th}>Mã đơn hàng</th>
                            <th className={styles.th}>Khách hàng</th>
                            <th className={styles.th}>Sản phẩm</th>
                            <th className={styles.th}>Ngày đặt</th>
                            <th className={styles.th}>Số tiền</th>
                            <th className={styles.th}>Trạng thái</th>
                            <th className={`${styles.th} ${styles.alignRight}`}>Thao tác</th>
                        </tr>
                        </thead>
                        <tbody>
                        {recentOrdersToShow.map((order, index) => {
                            const orderCode = order.orderCode || `#ORD-${order.id || index}`;
                            const customerName = order.shippingName || `Khách hàng #${order.userId || order.id || 'N/A'}`;
                            const productSummary = getOrderSummaryText(order);
                            const orderDate = formatDateTime(order.createdAt);
                            const amount = formatCurrency(order.finalAmount || order.totalAmount);
                            const statusConfig = getStatusConfig(order.status);

                            return (
                                <tr key={order.id || index} className={styles.tr}>
                                    <td className={`${styles.td} ${styles.bold}`}>{orderCode}</td>
                                    <td className={styles.td}>{customerName}</td>
                                    <td className={styles.td}>{productSummary}</td>
                                    <td className={styles.td}>{orderDate}</td>
                                    <td className={`${styles.td} ${styles.bold}`}>{amount}</td>
                                    <td className={styles.td}>
                                            <span className={`${styles.badge} ${styles[statusConfig.theme]}`}>
                                                {statusConfig.text}
                                            </span>
                                    </td>
                                    <td className={`${styles.td} ${styles.alignRight}`}>
                                        <button className={styles.actionBtn}>
                                            <span className="material-symbols-outlined">more_vert</span>
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
                </div>

                <div className={styles.pagination}>
                    <p className={styles.pageInfo}>Hiển thị {recentOrdersToShow.length} trên tổng số {orders.length} đơn hàng</p>
                    <div className={styles.pageButtons}>
                        <button className={styles.pageBtn} disabled>
                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>chevron_left</span>
                        </button>
                        <button className={`${styles.pageBtn} ${styles.active}`}>1</button>
                        <button className={styles.pageBtn}>2</button>
                        <button className={styles.pageBtn}>3</button>
                        <button className={styles.pageBtn}>
                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>chevron_right</span>
                        </button>
                    </div>
                </div>
            </div>
        </main>
    );
}

export default Dashboard;