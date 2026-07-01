import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import styles from './ProductDetail.module.scss';
import ProductCard from "../../components/ProductCard";
import productService from '../../services/ProductService';
import CartService from '../../services/CartService';

function ProductDetail() {
    const { id } = useParams();

    // --- CÁC STATE QUẢN LÝ DỮ LIỆU API ---
    const [product, setProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- CÁC STATE ĐIỀU HƯỚNG GIAO DIỆN ---
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [selectedColor, setSelectedColor] = useState('');
    const [selectedSize, setSelectedSize] = useState('');
    const [cartNotification, setCartNotification] = useState('');

    useEffect(() => {
        const fetchProductDetail = async () => {
            try {
                setLoading(true);
                setError(null);
                setCurrentImageIndex(0);

                const currentProduct = await productService.getProductById(id);
                setProduct(currentProduct);

                if (currentProduct?.variants && currentProduct.variants.length > 0) {
                    setSelectedColor(currentProduct.variants[0].color);
                    setSelectedSize(currentProduct.variants[0].size);
                }

                const allProducts = await productService.getAllProducts();
                if (allProducts && currentProduct) {
                    let filtered = allProducts.filter(
                        p => p.id !== currentProduct.id && p.categoryName === currentProduct.categoryName
                    );
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

    const formatCurrency = (value) => {
        if (!value) return '0 ₫';
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(value);
    };

    if (loading) return <div className="loading-box" style={{ textAlign: 'center', padding: '100px' }}>Đang tải thông tin sản phẩm...</div>;
    if (error || !product) return <div className="error-box" style={{ textAlign: 'center', padding: '100px', color: 'red' }}>{error || "Không tìm thấy sản phẩm!"}</div>;

    const productImages = product.galleryImages && product.galleryImages.length > 0
        ? product.galleryImages
        : (product.imageUrl ? [product.imageUrl] : ["https://placehold.co/600x600?text=No+Image"]);

    const uniqueColors = product.variants
        ? [...new Set(product.variants.map(v => v.color))]
        : [];

    const availableSizesForColor = product.variants
        ? product.variants.filter(v => v.color === selectedColor)
        : [];

    const activeVariant = product.variants?.find(v => v.color === selectedColor && v.size === selectedSize);

    const handleAddToCart = () => {
        if (!activeVariant || activeVariant.stockQuantity <= 0) return;

        const cartItem = {
            id: product.id,
            productId: product.id,
            productVariantId: activeVariant.id,
            variantId: activeVariant.id,
            name: product.name,
            image: productImages[0],
            price: activeVariant.price ?? product.basePrice,
            color: selectedColor,
            size: selectedSize,
            quantity: 1,
            stockQuantity: activeVariant.stockQuantity,
            sku: activeVariant.sku
        };

        CartService.addItem(cartItem);
        setCartNotification('Đã thêm sản phẩm vào giỏ hàng.');
        setTimeout(() => setCartNotification(''), 2500);
    };

    const handleNextImage = () => {
        setCurrentImageIndex((prevIndex) => prevIndex === productImages.length - 1 ? 0 : prevIndex + 1);
    };
    const handlePrevImage = () => {
        setCurrentImageIndex((prevIndex) => prevIndex === 0 ? productImages.length - 1 : prevIndex - 1);
    };

    const getColorHex = (colorName) => {
        switch (colorName?.toLowerCase()) {
            case 'trắng': return '#ffffff';
            case 'đen': return '#000000';
            case 'đỏ': return '#dc2626';
            case 'xanh': return '#2563eb';
            case 'vàng': return '#eab308';
            default: return '#cccccc';
        }
    };

    return (
        <main className={styles['product-detail-container']}>
            {/* Breadcrumbs */}
            <nav aria-label="Breadcrumb" className={styles.breadcrumb}>
                <ol className={styles['breadcrumb-list']}>
                    <li><a href="/">Home</a></li>
                    <li className={styles.separator}><span className="material-symbols-outlined">chevron_right</span></li>
                    <li><a href={`/products?brand=${product.brandName}`}>{product.brandName}</a></li>
                    <li className={styles.separator}><span className="material-symbols-outlined">chevron_right</span></li>
                    <li><a href={`/products?category=${product.categoryName}`}>{product.categoryName}</a></li>
                    <li className={styles.separator}><span className="material-symbols-outlined">chevron_right</span></li>
                    <li aria-current="page" className={styles['current-page']}>{product.name}</li>
                </ol>
            </nav>

            {/* Product Hero Section */}
            <div className={styles['product-hero']}>
                {/* Left Column: Gallery */}
                <div className={styles['product-gallery']}>
                    <div className={`${styles['main-image-wrapper']} group relative`}>
                        {productImages.length > 1 && (
                            <button className={`${styles['gallery-nav-btn']} ${styles.prev}`} onClick={handlePrevImage}>
                                <span className="material-symbols-outlined">chevron_left</span>
                            </button>
                        )}

                        <img
                            alt={product.name}
                            src={productImages[currentImageIndex]}
                            className={`${styles['main-image']} w-full h-full object-cover`}
                        />

                        {productImages.length > 1 && (
                            <button className={`${styles['gallery-nav-btn']} ${styles.next}`} onClick={handleNextImage}>
                                <span className="material-symbols-outlined">chevron_right</span>
                            </button>
                        )}

                        <div className={`${styles.badge} ${styles['new-release']} absolute top-4 left-4`}>Mới ra mắt</div>
                        <button className={`${styles['btn-favorite']} absolute top-4 right-4`} aria-label="Thêm vào mục yêu thích">
                            <span className="material-symbols-outlined">favorite</span>
                        </button>
                    </div>

                    {/* Thumbnails */}
                    {productImages.length > 1 && (
                        <div className={styles['thumbnail-grid']}>
                            {productImages.map((imgSrc, index) => (
                                <button
                                    key={index}
                                    className={`${styles['thumbnail-btn']} ${currentImageIndex === index ? styles.active : ''}`}
                                    onClick={() => setCurrentImageIndex(index)}
                                >
                                    <img alt={`Hình thu nhỏ ${index + 1}`} src={imgSrc} />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right Column: Product Info */}
                <div className={styles['product-info-wrapper']}>
                    <div className={styles['product-info-sticky']}>
                        <div className={styles['title-price-group']}>
                            <h1 className={styles['product-title']}>{product.name}</h1>
                            <div className={styles['product-price']}>{formatCurrency(product.basePrice)}</div>
                        </div>

                        <p className={styles['product-description']}>
                            {product.description || "Sản phẩm chính hãng chất lượng cao, kiểu dáng thời thượng ôm chân, mang lại cảm giác thoải mái tối đa khi di chuyển."}
                        </p>

                        {/* Chọn màu sắc */}
                        {uniqueColors.length > 0 && (
                            <div className={styles['selection-group']}>
                                <div className={styles['selection-header']}>
                                    <span className={styles['selection-label']}>Màu sắc</span>
                                    <span className={styles['selection-value']} style={{ fontWeight: 600 }}>{selectedColor}</span>
                                </div>
                                <div className={styles['color-options']}>
                                    {uniqueColors.map((color, idx) => (
                                        <button
                                            key={idx}
                                            className={`${styles['color-btn']} ${selectedColor === color ? styles.active : ''}`}
                                            onClick={() => {
                                                setSelectedColor(color);
                                                const firstSize = product.variants.find(v => v.color === color)?.size;
                                                setSelectedSize(firstSize || '');
                                            }}
                                        >
                                            <span
                                                className={styles['color-indicator']}
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

                        {/* Chọn Kích cỡ */}
                        <div className={styles['selection-group']}>
                            <div className={styles['selection-header']}>
                                <span className={styles['selection-label']}>Kích cỡ</span>
                                <button className={styles['size-guide-link']}>Hướng dẫn chọn size</button>
                            </div>
                            <div className={styles['size-grid']}>
                                {availableSizesForColor.map((variant) => (
                                    <button
                                        key={variant.id}
                                        className={`${styles['size-btn']} ${selectedSize === variant.size ? styles.active : ''}`}
                                        disabled={variant.stockQuantity <= 0}
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

                        {/* CTA Buttons */}
                        <div className={styles['cta-group']}>
                            <button
                                className={styles['btn-add-to-cart']}
                                disabled={!activeVariant || activeVariant.stockQuantity <= 0}
                                style={{ opacity: (!activeVariant || activeVariant.stockQuantity <= 0) ? 0.6 : 1 }}
                                onClick={handleAddToCart}
                            >
                                <span>{activeVariant?.stockQuantity > 0 ? 'Thêm vào giỏ hàng' : 'Tạm hết hàng'}</span>
                                <span className="material-symbols-outlined">arrow_forward</span>
                            </button>
                            {cartNotification && (
                                <div style={{ marginTop: '14px', color: '#047857', fontWeight: 600 }}>
                                    {cartNotification}
                                </div>
                            )}
                            <div className={styles['shipping-info']}>
                                <span className="material-symbols-outlined icon-small">local_shipping</span>
                                <span>Miễn phí vận chuyển cho đơn hàng trên 1.500.000 ₫</span>
                            </div>
                            {activeVariant && <small style={{ color: '#888', display: 'block', marginTop: '6px' }}>Mã SKU: {activeVariant.sku}</small>}
                        </div>

                    </div>
                </div>
            </div>

            {/* Reviews Section */}
            <section className={styles['reviews-section']}>
                <div className={styles['reviews-header']}>
                    <div className={styles['reviews-summary']}>
                        <h2 className={styles['section-title']}>Đánh giá từ khách hàng</h2>
                        <div className={styles['rating-summary']}>
                            <div className={styles.stars}>
                                <span className="material-symbols-outlined filled">star</span>
                                <span className="material-symbols-outlined filled">star</span>
                                <span className="material-symbols-outlined filled">star</span>
                                <span className="material-symbols-outlined filled">star</span>
                                <span className="material-symbols-outlined half">star_half</span>
                            </div>
                            <span className={styles['rating-score']}>4.8</span>
                            <span className={styles['rating-count']}>(124 Đánh giá)</span>
                        </div>
                    </div>
                    <button className={styles['btn-outline']}>Viết đánh giá</button>
                </div>

                <div className={styles['reviews-grid']}>
                    {/* Review Card 1 */}
                    <div className={styles['review-card']}>
                        <div className={styles['review-card-header']}>
                            <div className={`${styles.stars} ${styles.small}`}>
                                <span className="material-symbols-outlined filled">star</span>
                                <span className="material-symbols-outlined filled">star</span>
                                <span className="material-symbols-outlined filled">star</span>
                                <span className="material-symbols-outlined filled">star</span>
                                <span className="material-symbols-outlined filled">star</span>
                            </div>
                            <span className={styles['review-date']}>2 ngày trước</span>
                        </div>
                        <h3 className={styles['review-title']}>Tuyệt vời cho chạy bộ đường dài</h3>
                        <p className={styles['review-content']}>"Khả năng hoàn trả năng lượng thực sự đáng kinh ngạc. Tôi đã cải thiện được vài phút cho kỷ lục 10k của mình, và đôi giày cũng đủ đẹp để đi dạo phố sau đó."</p>
                        <div className={styles['review-author']}>
                            <div className={styles['author-avatar']}>JD</div>
                            <span className={styles['author-name']}>James D. <span className={styles.verified}>Đã mua hàng</span></span>
                        </div>
                    </div>

                    {/* Review Card 2 */}
                    <div className={styles['review-card']}>
                        <div className={styles['review-card-header']}>
                            <div className={`${styles.stars} ${styles.small}`}>
                                <span className="material-symbols-outlined filled">star</span>
                                <span className="material-symbols-outlined filled">star</span>
                                <span className="material-symbols-outlined filled">star</span>
                                <span className="material-symbols-outlined filled">star</span>
                                <span className="material-symbols-outlined outline">star_border</span>
                            </div>
                            <span className={styles['review-date']}>1 tuần trước</span>
                        </div>
                        <h3 className={styles['review-title']}>Form hơi ôm một chút</h3>
                        <p className={styles['review-content']}>"Thiết kế đẹp và rất nhẹ. Bàn chân tôi khá bè nên lúc đầu hơi chật, nhưng giày đã giãn ra vừa vặn sau khi chạy được vài dặm."</p>
                        <div className={styles['review-author']}>
                            <div className={styles['author-avatar']}>MK</div>
                            <span className={styles['author-name']}>Michael K. <span className={styles.verified}>Đã mua hàng</span></span>
                        </div>
                    </div>

                    {/* Review Card 3 */}
                    <div className={`${styles['review-card']} ${styles['highlight-card']}`}>
                        <div className={styles['review-card-header']}>
                            <div className={`${styles.stars} ${styles.small}`}>
                                <span className="material-symbols-outlined filled">star</span>
                                <span className="material-symbols-outlined filled">star</span>
                                <span className="material-symbols-outlined filled">star</span>
                                <span className="material-symbols-outlined filled">star</span>
                                <span className="material-symbols-outlined filled">star</span>
                            </div>
                            <span className={styles['review-date']}>1 tháng trước</span>
                        </div>
                        <h3 className={styles['review-title']}>Đôi giày mang hằng ngày của tôi</h3>
                        <p className={styles['review-content']}>"Tôi là người sưu tập sneaker và đôi này lập tức trở thành mục yêu thích của tôi. Thẩm mỹ tối giản nên phối với đồ nào cũng hợp. Rất đáng mua."</p>
                        <div className={styles['review-author']}>
                            <div className={styles['author-avatar']}>AS</div>
                            <span className={styles['author-name']}>Alex S. <span className={styles.verified}>Đã mua hàng</span></span>
                        </div>
                    </div>
                </div>
                <div className={styles['reviews-footer']}>
                    <button className={styles['link-btn']}>Xem tất cả đánh giá</button>
                </div>
            </section>

            {/* Related Products Section */}
            {relatedProducts.length > 0 && (
                <section className={styles['related-section']}>
                    <h2 className={`${styles['section-title']} ${styles['mb-large']}`}>Sản phẩm liên quan</h2>
                    <div className={styles['product-grid']}>
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