import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './ProductDetail.css';
import ProductCard from "../../components/ProductCard";
import productService from '../../services/ProductService';

function ProductDetail() {
    const { id } = useParams(); // Lấy ID sản phẩm từ URL thanh địa chỉ

    // --- CÁC STATE QUẢN LÝ DỮ LIỆU API ---
    const [product, setProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- CÁC STATE ĐIỀU HƯỚNG GIAO DIỆN ---
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [selectedColor, setSelectedColor] = useState(''); // Lưu màu khách chọn
    const [selectedSize, setSelectedSize] = useState('');   // Lưu size khách chọn

    // 1. GỌI API LẤY DỮ LIỆU KHI COMPONENT LOAD
    useEffect(() => {
        const fetchProductDetail = async () => {
            try {
                setLoading(true);
                setError(null);
                setCurrentImageIndex(0);

                // Lấy chi tiết sản phẩm theo ID từ database
                const currentProduct = await productService.getProductById(id);
                setProduct(currentProduct);

                // Điền sẵn màu sắc và kích cỡ mặc định từ biến thể (variant) đầu tiên
                if (currentProduct?.variants && currentProduct.variants.length > 0) {
                    setSelectedColor(currentProduct.variants[0].color);
                    setSelectedSize(currentProduct.variants[0].size);
                }

                // Lấy danh sách sản phẩm liên quan (Cùng danh mục)
                const allProducts = await productService.getAllProducts();
                if (allProducts && currentProduct) {
                    let filtered = allProducts.filter(
                        p => p.id !== currentProduct.id && p.categoryName === currentProduct.categoryName
                    );
                    // Nếu ít hơn 4 sản phẩm cùng danh mục, lấy thêm sản phẩm khác bù vào cho đẹp khung
                    if (filtered.length < 4) {
                        const extra = allProducts.filter(p => p.id !== currentProduct.id && p.categoryName !== currentProduct.categoryName);
                        filtered = [...filtered, ...extra];
                    }
                    setRelatedProducts(filtered.slice(0, 4));
                }
            } catch (err) {
                console.error("Lỗi tải chi tiết sản phẩm:", err);
                setError("Không thể tải thông tin sản phẩm này.");
            } finally {
                setLoading(false);
            }
        };

        fetchProductDetail();
    }, [id]);

    // Hàm chuyển đổi tiền tệ sang VNĐ
    const formatCurrency = (value) => {
        if (!value) return '0 ₫';
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(value);
    };

    // Trạng thái chờ load dữ liệu
    if (loading) return <div className="loading-box" style={{ textAlign: 'center', padding: '100px' }}>Đang tải thông tin sản phẩm...</div>;
    if (error || !product) return <div className="error-box" style={{ textAlign: 'center', padding: '100px', color: 'red' }}>{error || "Không tìm thấy sản phẩm!"}</div>;

    // --- XỬ LÝ TRÍCH XUẤT MẢNG DỮ LIỆU ĐỘNG ---

    // 1. Lấy toàn bộ danh sách ảnh từ galleryImages (nếu trống sẽ dùng imageUrl làm mặc định)
    const productImages = product.galleryImages && product.galleryImages.length > 0
        ? product.galleryImages
        : (product.imageUrl ? [product.imageUrl] : ["https://placehold.co/600x600?text=No+Image"]);

    // 2. Lọc danh sách các màu sắc không trùng lặp từ danh sách variants
    const uniqueColors = product.variants
        ? [...new Set(product.variants.map(v => v.color))]
        : [];

    // 3. Lọc danh sách size thuộc về màu sắc đang chọn
    const availableSizesForColor = product.variants
        ? product.variants.filter(v => v.color === selectedColor)
        : [];

    // 4. Tìm kiếm đúng variant được chọn để kiểm tra SKU và số lượng kho (stockQuantity)
    const activeVariant = product.variants?.find(v => v.color === selectedColor && v.size === selectedSize);

    // --- LOGIC DI CHUYỂN SLIDE ẢNH ---
    const handleNextImage = () => {
        setCurrentImageIndex((prevIndex) => prevIndex === productImages.length - 1 ? 0 : prevIndex + 1);
    };
    const handlePrevImage = () => {
        setCurrentImageIndex((prevIndex) => prevIndex === 0 ? productImages.length - 1 : prevIndex - 1);
    };

    // Hàm chuyển chữ Tiếng Việt thành mã màu HEX để hiện vòng tròn màu sắc
    const getColorHex = (colorName) => {
        switch (colorName?.toLowerCase()) {
            case 'trắng': return '#ffffff';
            case 'đen': return '#000000';
            case 'đỏ': return '#dc2626';
            case 'xanh': return '#2563eb';
            case 'vàng': return '#eab308';
            default: return '#cccccc'; // Màu xám mặc định
        }
    };

    return (
        <main className="product-detail-container">
            {/* Breadcrumbs (Đã map thương hiệu và tên sản phẩm động) */}
            <nav aria-label="Breadcrumb" className="breadcrumb">
                <ol className="breadcrumb-list">
                    <li><a href="/">Home</a></li>
                    <li className="separator"><span className="material-symbols-outlined">chevron_right</span></li>
                    <li><a href={`/products?brand=${product.brandName}`}>{product.brandName}</a></li>
                    <li className="separator"><span className="material-symbols-outlined">chevron_right</span></li>
                    <li><a href={`/products?category=${product.categoryName}`}>{product.categoryName}</a></li>
                    <li className="separator"><span className="material-symbols-outlined">chevron_right</span></li>
                    <li aria-current="page" className="current-page">{product.name}</li>
                </ol>
            </nav>

            {/* Product Hero Section */}
            <div className="product-hero">
                {/* Left Column: Gallery (Slide ảnh động lấy từ galleryImages) */}
                <div className="product-gallery">
                    <div className="main-image-wrapper group relative">
                        {productImages.length > 1 && (
                            <button className="gallery-nav-btn prev" onClick={handlePrevImage}>
                                <span className="material-symbols-outlined">chevron_left</span>
                            </button>
                        )}

                        <img
                            alt={product.name}
                            src={productImages[currentImageIndex]}
                            className="main-image w-full h-full object-cover"
                        />

                        {productImages.length > 1 && (
                            <button className="gallery-nav-btn next" onClick={handleNextImage}>
                                <span className="material-symbols-outlined">chevron_right</span>
                            </button>
                        )}

                        <div className="badge new-release absolute top-4 left-4">Mới ra mắt</div>
                        <button className="btn-favorite absolute top-4 right-4" aria-label="Thêm vào mục yêu thích">
                            <span className="material-symbols-outlined">favorite</span>
                        </button>
                    </div>

                    {/* Danh sách Ảnh nhỏ thu nhỏ (Thumbnails) */}
                    {productImages.length > 1 && (
                        <div className="thumbnail-grid">
                            {productImages.map((imgSrc, index) => (
                                <button
                                    key={index}
                                    className={`thumbnail-btn ${currentImageIndex === index ? 'active' : ''}`}
                                    onClick={() => setCurrentImageIndex(index)}
                                >
                                    <img alt={`Hình thu nhỏ ${index + 1}`} src={imgSrc} />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right Column: Product Info */}
                <div className="product-info-wrapper">
                    <div className="product-info-sticky">
                        <div className="title-price-group">
                            <h1 className="product-title">{product.name}</h1>
                            <div className="product-price">{formatCurrency(product.basePrice)}</div>
                        </div>

                        <p className="product-description">
                            {product.description || "Sản phẩm chính hãng chất lượng cao, kiểu dáng thời thượng ôm chân, mang lại cảm giác thoải mái tối đa khi di chuyển."}
                        </p>

                        {/* Chọn màu sắc động dựa trên Variants của API */}
                        {uniqueColors.length > 0 && (
                            <div className="selection-group">
                                <div className="selection-header">
                                    <span className="selection-label">Màu sắc</span>
                                    <span className="selection-value" style={{ fontWeight: 600 }}>{selectedColor}</span>
                                </div>
                                <div className="color-options">
                                    {uniqueColors.map((color, idx) => (
                                        <button
                                            key={idx}
                                            className={`color-btn ${selectedColor === color ? 'active' : ''}`}
                                            onClick={() => {
                                                setSelectedColor(color);
                                                // Tự động tìm và chọn size có sẵn đầu tiên của màu sắc mới
                                                const firstSize = product.variants.find(v => v.color === color)?.size;
                                                setSelectedSize(firstSize || '');
                                            }}
                                        >
                                            <span
                                                className="color-indicator"
                                                style={{
                                                    backgroundColor: getColorHex(color),
                                                    border: color.toLowerCase() === 'trắng' ? '1px solid #ddd' : 'none'
                                                }}
                                            ></span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Chọn Kích cỡ động dựa trên màu sắc được click */}
                        <div className="selection-group">
                            <div className="selection-header">
                                <span className="selection-label">Kích cỡ</span>
                                <button className="size-guide-link">Hướng dẫn chọn size</button>
                            </div>
                            <div className="size-grid">
                                {availableSizesForColor.map((variant) => (
                                    <button
                                        key={variant.id}
                                        className={`size-btn ${selectedSize === variant.size ? 'active' : ''}`}
                                        disabled={variant.stockQuantity <= 0} // Vô hiệu hóa nút bấm nếu hết hàng kho = 0
                                        onClick={() => setSelectedSize(variant.size)}
                                    >
                                        {variant.size}
                                    </button>
                                ))}
                            </div>
                            {activeVariant && (
                                <div style={{ marginTop: '8px', fontSize: '0.85rem', color: activeVariant.stockQuantity > 0 ? '#16a34a' : '#dc2626' }}>
                                    {activeVariant.stockQuantity > 0 ? `Còn lại trong kho: ${activeVariant.stockQuantity} sản phẩm` : 'Sản phẩm hiện đang tạm hết hàng'}
                                </div>
                            )}
                        </div>

                        {/* Nhóm nút thêm vào giỏ hàng hành động (CTA) */}
                        <div className="cta-group">
                            <button
                                className="btn-add-to-cart"
                                disabled={!activeVariant || activeVariant.stockQuantity <= 0}
                                style={{ opacity: (!activeVariant || activeVariant.stockQuantity <= 0) ? 0.6 : 1 }}
                            >
                                <span>{activeVariant?.stockQuantity > 0 ? 'Thêm vào giỏ hàng' : 'Tạm hết hàng'}</span>
                                <span className="material-symbols-outlined">arrow_forward</span>
                            </button>
                            <div className="shipping-info">
                                <span className="material-symbols-outlined icon-small">local_shipping</span>
                                <span>Miễn phí vận chuyển cho đơn hàng trên 1.500.000 ₫</span>
                            </div>
                            {activeVariant && <small style={{ color: '#888', display: 'block', marginTop: '6px' }}>Mã SKU: {activeVariant.sku}</small>}
                        </div>

                    </div>
                </div>
            </div>

            {/* --- GIỮ NGUYÊN HOÀN TOÀN KHU VỰC REVIEWS CỨNG (REVIEW CARD BAN ĐẦU CỦA BẠN) --- */}
            <section className="reviews-section">
                <div className="reviews-header">
                    <div className="reviews-summary">
                        <h2 className="section-title">Đánh giá từ khách hàng</h2>
                        <div className="rating-summary">
                            <div className="stars">
                                <span className="material-symbols-outlined filled">star</span>
                                <span className="material-symbols-outlined filled">star</span>
                                <span className="material-symbols-outlined filled">star</span>
                                <span className="material-symbols-outlined filled">star</span>
                                <span className="material-symbols-outlined half">star_half</span>
                            </div>
                            <span className="rating-score">4.8</span>
                            <span className="rating-count">(124 Đánh giá)</span>
                        </div>
                    </div>
                    <button className="btn-outline">Viết đánh giá</button>
                </div>

                <div className="reviews-grid">
                    {/* Review Card 1 */}
                    <div className="review-card">
                        <div className="review-card-header">
                            <div className="stars small">
                                <span className="material-symbols-outlined filled">star</span>
                                <span className="material-symbols-outlined filled">star</span>
                                <span className="material-symbols-outlined filled">star</span>
                                <span className="material-symbols-outlined filled">star</span>
                                <span className="material-symbols-outlined filled">star</span>
                            </div>
                            <span className="review-date">2 ngày trước</span>
                        </div>
                        <h3 className="review-title">Tuyệt vời cho chạy bộ đường dài</h3>
                        <p className="review-content">"Khả năng hoàn trả năng lượng thực sự đáng kinh ngạc. Tôi đã cải thiện được vài phút cho kỷ lục 10k của mình, và đôi giày cũng đủ đẹp để đi dạo phố sau đó."</p>
                        <div className="review-author">
                            <div className="author-avatar">JD</div>
                            <span className="author-name">James D. <span className="verified">Đã mua hàng</span></span>
                        </div>
                    </div>

                    {/* Review Card 2 */}
                    <div className="review-card">
                        <div className="review-card-header">
                            <div className="stars small">
                                <span className="material-symbols-outlined filled">star</span>
                                <span className="material-symbols-outlined filled">star</span>
                                <span className="material-symbols-outlined filled">star</span>
                                <span className="material-symbols-outlined filled">star</span>
                                <span className="material-symbols-outlined outline">star_border</span>
                            </div>
                            <span className="review-date">1 tuần trước</span>
                        </div>
                        <h3 className="review-title">Form hơi ôm một chút</h3>
                        <p className="review-content">"Thiết kế đẹp và rất nhẹ. Bàn chân tôi khá bè nên lúc đầu hơi chật, nhưng giày đã giãn ra vừa vặn sau khi chạy được vài dặm."</p>
                        <div className="review-author">
                            <div className="author-avatar">MK</div>
                            <span className="author-name">Michael K. <span className="verified">Đã mua hàng</span></span>
                        </div>
                    </div>

                    {/* Review Card 3 */}
                    <div className="review-card highlight-card">
                        <div className="review-card-header">
                            <div className="stars small">
                                <span className="material-symbols-outlined filled">star</span>
                                <span className="material-symbols-outlined filled">star</span>
                                <span className="material-symbols-outlined filled">star</span>
                                <span className="material-symbols-outlined filled">star</span>
                                <span className="material-symbols-outlined filled">star</span>
                            </div>
                            <span className="review-date">1 tháng trước</span>
                        </div>
                        <h3 className="review-title">Đôi giày mang hằng ngày của tôi</h3>
                        <p className="review-content">"Tôi là người sưu tập sneaker và đôi này lập tức trở thành mục yêu thích của tôi. Thẩm mỹ tối giản nên phối với đồ nào cũng hợp. Rất đáng mua."</p>
                        <div className="review-author">
                            <div className="author-avatar">AS</div>
                            <span className="author-name">Alex S. <span className="verified">Đã mua hàng</span></span>
                        </div>
                    </div>
                </div>
                <div className="reviews-footer">
                    <button className="link-btn">Xem tất cả đánh giá</button>
                </div>
            </section>

            {/* Related Products Section (Đã chuyển sang map mảng sản phẩm liên quan từ API) */}
            {relatedProducts.length > 0 && (
                <section className="related-section">
                    <h2 className="section-title mb-large">Sản phẩm liên quan</h2>
                    <div className="product-grid">
                        {relatedProducts.map((relatedProduct) => (
                            <ProductCard key={relatedProduct.id} data={relatedProduct} />
                        ))}
                    </div>
                </section>
            )}
        </main>
    );
}

export default ProductDetail;