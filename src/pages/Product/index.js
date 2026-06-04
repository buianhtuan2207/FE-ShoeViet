import React, { useState, useEffect } from 'react';
import ProductCard from '../../components/ProductCard';
import productService from '../../services/ProductService';
import './Product.scss';

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
                {/* --- SIDEBAR BỘ LỌC TÌM KIẾM --- */}
                <aside className="sidebar">

                    {/* Lọc theo Thương hiệu */}
                    <div className="filter-group">
                        <h3 className="filter-title">Thương hiệu</h3>
                        <div className="filter-list">
                            <label className="filter-checkbox"><input type="checkbox" defaultChecked /><span>Nike</span></label>
                            <label className="filter-checkbox"><input type="checkbox" /><span>Adidas</span></label>
                            <label className="filter-checkbox"><input type="checkbox" /><span>Jordan</span></label>
                            <label className="filter-checkbox"><input type="checkbox" /><span>Puma</span></label>
                        </div>
                    </div>

                    {/* Lọc theo Khoảng giá */}
                    <div className="filter-group">
                        <h3 className="filter-title">Mức giá</h3>
                        <div className="filter-list">
                            <label className="filter-checkbox"><input type="radio" name="price" /><span>Dưới 1.000.000 ₫</span></label>
                            <label className="filter-checkbox"><input type="radio" name="price" /><span>1.000.000 ₫ - 3.000.000 ₫</span></label>
                            <label className="filter-checkbox"><input type="radio" name="price" /><span>Trên 3.000.000 ₫</span></label>
                        </div>
                    </div>

                    {/* Lọc theo Màu sắc */}
                    <div className="filter-group">
                        <h3 className="filter-title">Màu sắc</h3>
                        <div className="color-swatches">
                            <button className="color-btn" style={{ backgroundColor: '#000000' }} aria-label="Đen"></button>
                            <button className="color-btn" style={{ backgroundColor: '#ffffff', border: '1px solid #ddd' }} aria-label="Trắng"></button>
                            <button className="color-btn" style={{ backgroundColor: '#dc2626' }} aria-label="Đỏ"></button>
                            <button className="color-btn" style={{ backgroundColor: '#2563eb' }} aria-label="Xanh dương"></button>
                            <button className="color-btn" style={{ backgroundColor: '#16a34a' }} aria-label="Xanh lá"></button>
                            <button className="color-btn" style={{ backgroundColor: '#eab308' }} aria-label="Vàng"></button>
                        </div>
                    </div>

                    {/* Lọc theo Kích cỡ (Size) */}
                    <div className="filter-group">
                        <h3 className="filter-title">Kích cỡ</h3>
                        <div className="size-grid">
                            <button className="size-btn">38</button>
                            <button className="size-btn">39</button>
                            <button className="size-btn active">40</button>
                            <button className="size-btn">41</button>
                            <button className="size-btn">42</button>
                            <button className="size-btn">43</button>
                        </div>
                    </div>

                    <button className="btn-clear-filter">Xóa tất cả bộ lọc</button>
                </aside>

                {/* --- KHU VỰC HIỂN THỊ SẢN PHẨM --- */}
                <div className="product-list-container">
                    {loading && <div className="loading-state">Đang tải danh sách sản phẩm...</div>}
                    {error && <div className="error-state">{error}</div>}

                    {!loading && !error && (
                        <div className="product-grid">
                            {products.length === 0 ? (
                                <div className="empty-state">
                                    Không tìm thấy sản phẩm nào phù hợp với tiêu chí của bạn.
                                </div>
                            ) : (
                                products.map((product) => (
                                    <ProductCard key={product.id} data={product} />
                                ))
                            )}
                        </div>
                    )}

                    {/* Phân trang */}
                    <div className="pagination">
                        <button className="page-btn disabled" disabled aria-label="Trang trước">
                            <span className="material-symbols-outlined">chevron_left</span>
                        </button>
                        <button className="page-btn active">1</button>
                        <button className="page-btn">2</button>
                        <span className="page-dots">...</span>
                        <button className="page-btn">8</button>
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