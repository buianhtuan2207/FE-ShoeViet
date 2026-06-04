import React, { useState, useEffect } from 'react';
import ProductCard from '../../components/ProductCard';
import productService from '../../services/ProductSercive';
import './Product.module.scss';

function ProductPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchAllProductsData = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await productService.getAllProducts();
            setProducts(data);
        } catch (err) {
            console.error("Lỗi khi kết nối dữ liệu:", err);
            setError(err.message || 'Đã có lỗi xảy ra khi tải danh sách sản phẩm.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllProductsData();
    }, []);

    return (
        <main className="product-page">
            <div className="page-header">
                <div className="header-info">
                    <h1 className="page-title">Bộ Sưu Tập Nổi Bật</h1>
                    <p className="page-desc">
                        Tối ưu cho tốc độ, thiết kế cho phong cách đường phố. Khám phá những mẫu giày hiệu năng mới nhất của chúng tôi.
                    </p>
                </div>

                <div className="header-actions">
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
                <aside className="sidebar">
                    {/* Giữ nguyên các bộ lọc của bạn */}
                    <div className="filter-group">
                        <h3 className="filter-title">Thương hiệu</h3>
                        <div className="filter-list">
                            <label className="filter-checkbox"><input type="checkbox" defaultChecked /><span>Nike</span></label>
                            <label className="filter-checkbox"><input type="checkbox" /><span>Adidas</span></label>
                            <label className="filter-checkbox"><input type="checkbox" /><span>Jordan</span></label>
                        </div>
                    </div>
                </aside>

                <div className="product-list-container" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    {loading && <div style={{ textAlign: 'center', padding: '40px', fontSize: '1.2rem', color: '#757575' }}>Đang tải danh sách sản phẩm...</div>}
                    {error && <div style={{ textAlign: 'center', padding: '40px', color: '#93000a', fontWeight: '500' }}>{error}</div>}

                    {!loading && !error && (
                        <div className="product-grid">
                            {products.length === 0 ? (
                                <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: '#757575' }}>
                                    Không có sản phẩm nào trong hệ thống.
                                </div>
                            ) : (
                                // CODE MỚI RẤT GỌN: Chỉ việc ném thẳng object product vào
                                products.map((product) => (
                                    <ProductCard key={product.id} data={product} />
                                ))
                            )}
                        </div>
                    )}

                    <div className="pagination">
                        <button className="page-btn disabled" disabled aria-label="Trang trước"><span className="material-symbols-outlined">chevron_left</span></button>
                        <button className="page-btn active">1</button>
                        <button className="page-btn">2</button>
                        <span className="page-dots">...</span>
                        <button className="page-btn" aria-label="Trang tiếp theo"><span className="material-symbols-outlined">chevron_right</span></button>
                    </div>
                </div>
            </div>
        </main>
    );
}

export default ProductPage;