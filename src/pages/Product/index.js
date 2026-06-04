import React, { useState, useEffect } from 'react';
import ProductCard from '../../components/ProductCard';
import productService from '../../services/ProductSercive';
import './Product.module.scss';

function ProductPage() {
    // --- 1. KHAI BÁO CÁC STATE QUẢN LÝ DỮ LIỆU TỪ BACKEND ---
    const [products, setProducts] = useState([]);      // Lưu danh sách sản phẩm thực tế
    const [loading, setLoading] = useState(true);        // Trạng thái chờ tải dữ liệu
    const [error, setError] = useState(null);            // Trạng thái lưu thông báo lỗi (nếu có)

    // --- 2. HÀM GỌI API QUA TẦNG SERVICE ---
    const fetchAllProductsData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Gọi hàm từ productService
            const data = await productService.getAllProducts();
            setProducts(data);
        } catch (err) {
            console.error("Lỗi khi kết nối dữ liệu:", err);
            setError(err.message || 'Đã có lỗi xảy ra khi tải danh sách sản phẩm.');
        } finally {
            setLoading(false);
        }
    };

    // --- 3. TRIGGER GỌI API NGAY KHI COMPONENT MOUNT ---
    useEffect(() => {
        fetchAllProductsData();
    }, []);

    // --- 4. HÀM ĐỊNH DẠNG TIỀN TỆ ĐỒNG BỘ VNĐ (Ví dụ: 1500000 -> 1.500.000 ₫) ---
    const formatCurrency = (value) => {
        if (!value) return '0 ₫';
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(value);
    };

    return (
        <main className="product-page">
            {/* Tiêu đề trang / Breadcrumbs */}
            <div className="page-header">
                <div className="header-info">
                    <h1 className="page-title">Bộ Sưu Tập Nổi Bật</h1>
                    <p className="page-desc">
                        Tối ưu cho tốc độ, thiết kế cho phong cách đường phố. Khám phá những mẫu giày hiệu năng mới nhất của chúng tôi.
                    </p>
                </div>

                {/* Thanh Sắp Xếp */}
                <div className="header-actions">
                    {/* Hiển thị số lượng dựa trên mảng thực tế */}
                    <span className="result-count">Hiển thị {products.length} sản phẩm</span>
                    <div className="select-wrapper">
                        <select className="sort-select" defaultValue="Featured">
                            <option value="Featured">Sắp xếp: Nổi bật</option>
                            <option value="Newest">Sắp xếp: Mới nhất</option>
                            <option value="PriceHighLow">Giá: Từ cao đến thấp</option>
                            <option value="PriceLowHigh">Giá: Từ thấp đến cao</option>
                        </select>
                        <span className="material-symbols-outlined select-icon">expand_more</span>
                    </div>
                </div>
            </div>

            <div className="page-content">
                {/* Bộ lọc Sidebar */}
                <aside className="sidebar">
                    <div className="filter-group">
                        <h3 className="filter-title">Thương hiệu</h3>
                        <div className="filter-list">
                            <label className="filter-checkbox">
                                <input type="checkbox" defaultChecked />
                                <span>Nike</span>
                            </label>
                            <label className="filter-checkbox">
                                <input type="checkbox" />
                                <span>Adidas</span>
                            </label>
                            <label className="filter-checkbox">
                                <input type="checkbox" />
                                <span>Jordan</span>
                            </label>
                        </div>
                    </div>

                    <div className="filter-group">
                        <h3 className="filter-title">Kích cỡ (US)</h3>
                        <div className="size-chips">
                            <button className="chip">7</button>
                            <button className="chip active">8</button>
                            <button className="chip">9</button>
                            <button className="chip">10</button>
                            <button className="chip">11</button>
                            <button className="chip disabled" disabled>12</button>
                        </div>
                    </div>

                    <div className="filter-group">
                        <h3 className="filter-title">Màu sắc</h3>
                        <div className="color-chips">
                            <button className="color-btn active" style={{ backgroundColor: '#000' }}></button>
                            <button className="color-btn" style={{ backgroundColor: '#fff', border: '1px solid #e5e5e5' }}></button>
                            <button className="color-btn" style={{ backgroundColor: '#e2e2e2' }}></button>
                            <button className="color-btn" style={{ backgroundColor: '#93000a' }}></button>
                        </div>
                    </div>

                    <div className="filter-group">
                        <h3 className="filter-title">Khoảng giá</h3>
                        <div className="price-grid">
                            <button className="price-btn">Dưới 500k</button>
                            <button className="price-btn">500k - 1M</button>
                            <button className="price-btn active">1M - 2M</button>
                            <button className="price-btn">Trên 2M</button>
                        </div>
                    </div>
                </aside>

                {/* Lưới sản phẩm và phân trang */}
                <div className="product-list-container" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>

                    {/* --- TRẠNG THÁI LOADING / ERROR / HIỂN THỊ DỮ LIỆU THẬT --- */}
                    {loading && (
                        <div style={{ textAlign: 'center', padding: '40px', fontSize: '1.2rem', color: '#757575' }}>
                            Đang tải danh sách sản phẩm...
                        </div>
                    )}

                    {error && (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#93000a', fontWeight: '500' }}>
                            {error}
                        </div>
                    )}

                    {!loading && !error && (
                        <div className="product-grid">
                            {products.length === 0 ? (
                                <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: '#757575' }}>
                                    Không có sản phẩm nào trong hệ thống.
                                </div>
                            ) : (
                                products.map((product) => (
                                    <ProductCard
                                        key={product.id}
                                        data={{
                                            id: product.id,
                                            name: product.name,
                                            category: product.categoryName || "Giày thể thao",
                                            // Sử dụng hàm formatCurrency để chuyển đổi số thành định dạng tiền tệ Việt Nam mượt mà
                                            price: formatCurrency(product.basePrice),
                                            img: product.imageUrl || "https://placehold.co/300"
                                        }}
                                    />
                                ))
                            )}
                        </div>
                    )}

                    {/* Phân trang bằng Tiếng Việt */}
                    <div className="pagination">
                        <button className="page-btn disabled" disabled aria-label="Trang trước">
                            <span className="material-symbols-outlined">chevron_left</span>
                        </button>

                        <button className="page-btn active">1</button>
                        <button className="page-btn">2</button>
                        <button className="page-btn">3</button>

                        <span className="page-dots">...</span>

                        <button className="page-btn">12</button>

                        <button className="page-btn" aria-label="Trang tiếp theo">
                            <span className="material-symbols-outlined">chevron_right</span>
                        </button>
                    </div>
                </div>

            </div>
        </main>
    );
}

export default ProductPage;