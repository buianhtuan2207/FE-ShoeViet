import React, { useState, useEffect } from 'react';
import styles from './ProductManagement.module.scss';
import productService from '../../../../services/ProductSercive'; // Đảm bảo bạn đã tạo file service ở bước trước

// GIỮ NGUYÊN data bento stats của bạn
const statsBentoData = [
    {
        label: 'Tổng sản phẩm',
        value: '1,284',
        icon: 'package_2',
        themeClass: 'primaryCard',
        iconTheme: 'primary',
        trendText: '+12%',
        trendClass: 'positive',
        trendIcon: 'trending_up'
    },
    {
        label: 'Sắp hết hàng',
        value: '18',
        icon: 'running_with_errors',
        themeClass: 'errorCard',
        iconTheme: 'error',
        trendText: 'Cần nhập',
        trendClass: 'warning',
        trendIcon: 'warning'
    },
    {
        label: 'Tỷ lệ xoay vòng',
        value: '4.2x',
        icon: 'avg_pace',
        themeClass: 'primaryCard',
        iconTheme: 'secondary',
        trendText: 'Chu kỳ: 30 ngày',
        trendClass: 'neutral'
    }
];

function ProductManagement() {
    // --- BỔ SUNG CÁC STATE QUẢN LÝ DỮ LIỆU THẬT ---
    const [products, setProducts] = useState([]); // Thay thế cho mảng productsData ảo
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null); // null = Thêm mới, có giá trị = Sửa

    // State quản lý form điền dữ liệu (khớp hoàn toàn với các ô input trong Modal của bạn)
    const [formData, setFormData] = useState({
        name: '',
        categoryId: '',
        brandId: '',
        sku: '',          // Bạn có thể lưu sku vào description hoặc xử lý tùy BE
        stockQuantity: '', // Đồng bộ số lượng tồn kho
        basePrice: '',     // Đồng bộ giá bán cơ bản
        imageUrl: ''       // Đường dẫn hình ảnh URL
    });

    // --- BỔ SUNG CÁC HÀM GỌI API ---

    // 1. Hàm tải danh sách sản phẩm từ Spring Boot
    const loadProducts = async () => {
        setIsLoading(true);
        try {
            const data = await productService.getAllProducts();
            setProducts(data);
        } catch (error) {
            console.error("Lỗi lấy danh sách sản phẩm:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadProducts();
    }, []);

    // 2. Hàm mở modal (Xử lý cho cả nút Thêm mới và nút Sửa)
    const openModal = (product = null) => {
        if (product) {
            setEditingProduct(product);
            setFormData({
                name: product.name,
                categoryId: '1', // Mặc định ID danh mục phù hợp DB của bạn
                brandId: '1',    // Mặc định ID thương hiệu phù hợp DB của bạn
                sku: product.variants?.[0]?.sku || '',
                stockQuantity: product.variants?.[0]?.stockQuantity || 0,
                basePrice: product.basePrice,
                imageUrl: product.imageUrl || ''
            });
        } else {
            setEditingProduct(null);
            setFormData({ name: '', categoryId: '', brandId: '', sku: '', stockQuantity: '', basePrice: '', imageUrl: '' });
        }
        setIsModalOpen(true);
    };

    // 3. Hàm xử lý thay đổi dữ liệu trong ô input form
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // 4. Hàm gửi form (Submit) - Đã sửa để xử lý cả Thêm mới & Cập nhật API
    const handleFormSubmit = async (e) => {
        e.preventDefault();

        const payload = {
            name: formData.name,
            description: `Mã SKU: ${formData.sku}`, // Tạm lưu kèm SKU vào mô tả nếu bảng Product của bạn chưa có cột SKU độc lập
            basePrice: parseFloat(formData.basePrice) || 0,
            imageUrl: formData.imageUrl,
            categoryId: parseInt(formData.categoryId) || 1,
            brandId: parseInt(formData.brandId) || 1,
            galleryImages: []
        };

        try {
            if (editingProduct) {
                // Gọi API cập nhật sản phẩm
                await productService.updateProduct(editingProduct.id, payload);
                alert('Cập nhật thông tin sản phẩm thành công!');
            } else {
                // Gọi API thêm sản phẩm mới
                await productService.addProduct(payload);
                alert('Thêm sản phẩm mới thành công!');
            }
            setIsModalOpen(false);
            loadProducts(); // Cập nhật lại bảng dữ liệu mới
        } catch (error) {
            alert('Có lỗi xảy ra: ' + error.message);
        }
    };

    // 5. Hàm xử lý Xóa sản phẩm qua API khi click nút Thùng rác
    const handleDeleteProduct = async (id, name) => {
        if (window.confirm(`Bạn có chắc chắn muốn xóa sản phẩm "${name}" không?`)) {
            try {
                const msg = await productService.deleteProduct(id);
                alert(msg);
                loadProducts();
            } catch (error) {
                alert('Xóa thất bại: ' + error.message);
            }
        }
    };

    // Hàm format định dạng hiển thị tiền tệ VND
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    };

    return (
        <main className={styles.main}>
            <div className={styles.container}>

                {/* Page Header Section - GIỮ NGUYÊN GIAO DIỆN */}
                <div className={styles.headerSection}>
                    <div>
                        <h2 className={styles.pageTitle}>Quản lý sản phẩm</h2>
                        <p className={styles.pageSubtitle}>Danh sách tất cả giày và phụ kiện hiện có trong hệ thống.</p>
                    </div>
                    {/* SỬA: Gắn sự kiện openModal(null) để kích hoạt chế độ thêm mới */}
                    <button className={styles.addBtn} onClick={() => openModal(null)}>
                        <span className="material-symbols-outlined">add</span>
                        Thêm sản phẩm mới
                    </button>
                </div>

                {/* Contextual Stats Cards (Bento Style) - GIỮ NGUYÊN 100% */}
                <div className={styles.statsGrid}>
                    {statsBentoData.map((card, idx) => (
                        <div key={idx} className={`${styles.statCard} ${styles[card.themeClass]}`}>
                            <div className={styles.statCardHeader}>
                                <div className={`${styles.statIconWrapper} ${styles[card.iconTheme]}`}>
                                    <span className="material-symbols-outlined">{card.icon}</span>
                                </div>
                                <span className={`${styles.trendTag} ${styles[card.trendClass]}`}>
                                    {card.trendIcon && <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>{card.trendIcon}</span>}
                                    {card.trendText}
                                </span>
                            </div>
                            <p className={styles.statLabel}>{card.label}</p>
                            <h3 className={styles.statValue}>{card.value}</h3>
                        </div>
                    ))}
                </div>

                {/* Filters Section - GIỮ NGUYÊN 100% */}
                <div className={styles.filtersBar}>
                    <div className={styles.selectWrapper}>
                        <span className={`${styles.filterIcon} material-symbols-outlined`}>category</span>
                        <select className={styles.selectInput} defaultValue="Tất cả danh mục">
                            <option>Tất cả danh mục</option>
                            <option>Sneakers</option>
                            <option>Running</option>
                            <option>Basketball</option>
                            <option>Casual</option>
                        </select>
                    </div>

                    <div className={styles.selectWrapper}>
                        <span className={`${styles.filterIcon} material-symbols-outlined`}>brand_family</span>
                        <select className={styles.selectInput} defaultValue="Tất cả thương hiệu">
                            <option>Tất cả thương hiệu</option>
                            <option>Nike</option>
                            <option>Adidas</option>
                            <option>Jordan</option>
                            <option>Yeezy</option>
                        </select>
                    </div>

                    <div className={styles.divider}></div>

                    <div className={styles.sortGroup}>
                        <span className={styles.sortLabel}>Sắp xếp:</span>
                        <button className={styles.sortBtn}>Mới nhất</button>
                    </div>

                    <button className={styles.advancedFilterBtn}>
                        <span className="material-symbols-outlined">filter_list</span>
                        Lọc nâng cao
                    </button>
                </div>

                {/* Product Table Area - ĐỔ DỮ LIỆU THẬT VÀO ĐÂY */}
                <div className={styles.tableCard}>
                    <div className={styles.tableWrapper}>
                        <table className={styles.table}>
                            <thead>
                            <tr>
                                <th className={styles.th}>Hình ảnh</th>
                                <th className={styles.th}>Sản phẩm</th>
                                <th className={styles.th}>SKU</th>
                                <th className={`${styles.th} ${styles.textCenter}`}>Tồn kho</th>
                                <th className={styles.th}>Giá bán</th>
                                <th className={styles.th}>Trạng thái</th>
                                <th className={`${styles.th} ${styles.textRight}`}>Thao tác</th>
                            </tr>
                            </thead>
                            <tbody className={styles.tbody}>
                            {isLoading ? (
                                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>Đang tải dữ liệu từ server...</td></tr>
                            ) : products.length === 0 ? (
                                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>Không có sản phẩm nào trong cơ sở dữ liệu.</td></tr>
                            ) : (
                                products.map((product) => {
                                    // Trích xuất an toàn số lượng và SKU từ phần tử biến thể đầu tiên (nếu có)
                                    const firstVariant = product.variants && product.variants.length > 0 ? product.variants[0] : null;
                                    const totalStock = product.variants ? product.variants.reduce((sum, v) => sum + (v.stockQuantity || 0), 0) : 0;
                                    const skuDisplay = firstVariant?.sku || `PROD-${product.id}`;
                                    const statusText = totalStock > 0 ? 'Còn hàng' : 'Hết hàng';
                                    const statusClass = totalStock > 0 ? 'inStock' : 'outOfStock';

                                    return (
                                        <tr key={product.id} className={styles.tr}>
                                            <td className={styles.td}>
                                                <div className={styles.imgCellWrapper}>
                                                    <img
                                                        src={product.imageUrl || 'https://placehold.co/50'}
                                                        alt={product.name}
                                                        className={styles.productImg}
                                                        onError={(e) => { e.target.src = 'https://placehold.co/50'; }}
                                                    />
                                                </div>
                                            </td>
                                            <td className={styles.td}>
                                                <p className={styles.productName}>{product.name}</p>
                                                <p className={styles.productMeta}>{product.categoryName || 'Giày'} • {product.brandName || 'Chính hãng'}</p>
                                            </td>
                                            <td className={styles.td}>
                                                <span className={styles.skuBadge}>{skuDisplay}</span>
                                            </td>
                                            <td className={`${styles.td} ${styles.textCenter}`}>
                                                <p className={`${styles.stockCount} ${totalStock === 0 ? styles.outOfStock : ''}`}>
                                                    {totalStock}
                                                </p>
                                                <p className={styles.stockUnit}>Chiếc</p>
                                            </td>
                                            <td className={styles.td}>
                                                <span className={styles.priceText}>{formatCurrency(product.basePrice)}</span>
                                            </td>
                                            <td className={styles.td}>
                                                <span className={`${styles.statusBadge} ${styles[statusClass]}`}>
                                                    {statusText}
                                                </span>
                                            </td>
                                            <td className={`${styles.td} ${styles.textRight}`}>
                                                <div className={styles.actionsWrapper}>
                                                    <button className={styles.actionBtn} title="Cập nhật kho">
                                                        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>inventory</span>
                                                    </button>
                                                    {/* SỬA: Thêm sự kiện onClick để mở modal sửa */}
                                                    <button className={styles.actionBtn} title="Chỉnh sửa" onClick={() => openModal(product)}>
                                                        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>edit</span>
                                                    </button>
                                                    {/* SỬA: Thêm sự kiện onClick để gọi hàm xóa */}
                                                    <button className={`${styles.actionBtn} ${styles.deleteBtn}`} title="Xóa" onClick={() => handleDeleteProduct(product.id, product.name)}>
                                                        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>delete</span>
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

                    {/* Pagination Footer - GIỮ NGUYÊN 100% */}
                    <div className={styles.pagination}>
                        <p className={styles.pageText}>
                            Hiển thị <span>1 - {products.length}</span> trong số <span>{products.length}</span> sản phẩm
                        </p>
                        <div className={styles.pageControls}>
                            <button className={styles.pageBtn} disabled>
                                <span className="material-symbols-outlined">chevron_left</span>
                            </button>
                            <button className={`${styles.pageBtn} ${styles.active}`}>1</button>
                            <button className={styles.pageBtn}>2</button>
                            <button className={styles.pageBtn}>3</button>
                            <span className={styles.ellipsis}>...</span>
                            <button className={styles.pageBtn}>25</button>
                            <button className={styles.pageBtn}>
                                <span className="material-symbols-outlined">chevron_right</span>
                            </button>
                        </div>
                    </div>
                </div>

            </div>

            {/* POPUP MODAL SECTION - GIỮ NGUYÊN CẤU TRÚC VÀ THÊM VALUE + ONCHANGE ĐỂ LƯU DATA */}
            {isModalOpen && (
                <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>

                        {/* Modal Header */}
                        <div className={styles.modalHeader}>
                            <h3 className={styles.modalTitle}>
                                {editingProduct ? `Chỉnh sửa sản phẩm #${editingProduct.id}` : 'Thêm sản phẩm mới'}
                            </h3>
                            <button className={styles.modalCloseBtn} onClick={() => setIsModalOpen(false)}>
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        {/* Modal Form Content */}
                        <form onSubmit={handleFormSubmit}>
                            <div className={styles.modalBody}>
                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>Tên sản phẩm *</label>
                                    <input type="text" name="name" value={formData.name} onChange={handleInputChange} className={styles.formInput} placeholder="Ví dụ: Nike Air Force 1" required />
                                </div>

                                <div className={styles.formRow}>
                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>Danh mục *</label>
                                        <select name="categoryId" value={formData.categoryId} onChange={handleInputChange} className={styles.formSelect} required>
                                            <option value="">Chọn danh mục</option>
                                            <option value="1">Sneakers</option>
                                            <option value="2">Running</option>
                                            <option value="3">Basketball</option>
                                        </select>
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>Thương hiệu *</label>
                                        <select name="brandId" value={formData.brandId} onChange={handleInputChange} className={styles.formSelect} required>
                                            <option value="">Chọn thương hiệu</option>
                                            <option value="1">Nike</option>
                                            <option value="2">Adidas</option>
                                            <option value="3">Jordan</option>
                                        </select>
                                    </div>
                                </div>

                                <div className={styles.formRow}>
                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>Mã sản phẩm (SKU) *</label>
                                        <input type="text" name="sku" value={formData.sku} onChange={handleInputChange} className={styles.formInput} placeholder="NK-AF1-001" required />
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>Số lượng tồn kho *</label>
                                        <input type="number" min="0" name="stockQuantity" value={formData.stockQuantity} onChange={handleInputChange} className={styles.formInput} placeholder="0" required />
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>Giá bán (₫) *</label>
                                        <input type="number" min="0" name="basePrice" value={formData.basePrice} onChange={handleInputChange} className={styles.formInput} placeholder="3500000" required />
                                    </div>
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>Đường dẫn hình ảnh (URL)</label>
                                    <input type="url" name="imageUrl" value={formData.imageUrl} onChange={handleInputChange} className={styles.formInput} placeholder="https://example.com/image.png" />
                                </div>
                            </div>

                            {/* Modal Footer Actions */}
                            <div className={styles.modalFooter}>
                                <button type="button" className={styles.cancelBtn} onClick={() => setIsModalOpen(false)}>
                                    Hủy bỏ
                                </button>
                                <button type="submit" className={styles.submitBtn}>
                                    Xác nhận lưu
                                </button>
                            </div>
                        </form>

                    </div>
                </div>
            )}
        </main>
    );
}

export default ProductManagement;