import React, { useState, useEffect } from 'react';
import styles from './ProductManagement.module.scss';
import productService from '../../../../services/ProductService';

function ProductManagement() {
    // --- CÁC STATE QUẢN LÝ DỮ LIỆU ---
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    // --- STATE QUẢN LÝ BỘ LỌC (MỚI THÊM) ---
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Tất cả danh mục');
    const [selectedBrand, setSelectedBrand] = useState('Tất cả thương hiệu');

    // State quản lý form điền dữ liệu
    const [formData, setFormData] = useState({
        name: '',
        categoryId: '',
        brandId: '',
        sku: '',
        stockQuantity: '',
        basePrice: '',
        imageUrl: ''
    });

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

    // --- LOGIC TÍNH TOÁN THỐNG KÊ ĐỘNG (BENTO) ---
    const totalProductsCount = products.length;

    // Đếm số sản phẩm có tổng kho dưới hoặc bằng 5 (Sắp hết hàng)
    const lowStockCount = products.filter(product => {
        const totalStock = product.variants ? product.variants.reduce((sum, v) => sum + (v.stockQuantity || 0), 0) : 0;
        return totalStock <= 5;
    }).length;

    // Tính tỷ lệ trung bình giá trị sản phẩm hoặc giữ số liệu chu kỳ cố định cho bento
    const statsBentoData = [
        {
            label: 'Tổng dòng sản phẩm',
            value: totalProductsCount.toLocaleString(),
            icon: 'package_2',
            themeClass: 'primaryCard',
            iconTheme: 'primary',
            trendText: 'Hệ thống thực',
            trendClass: 'positive',
            trendIcon: 'sync'
        },
        {
            label: 'Sắp hết hàng (≤ 5 chiếc)',
            value: lowStockCount.toLocaleString(),
            icon: 'running_with_errors',
            themeClass: lowStockCount > 0 ? 'errorCard' : 'primaryCard',
            iconTheme: lowStockCount > 0 ? 'error' : 'secondary',
            trendText: lowStockCount > 0 ? 'Cần nhập hàng' : 'An toàn',
            trendClass: lowStockCount > 0 ? 'warning' : 'positive',
            trendIcon: lowStockCount > 0 ? 'warning' : 'check_circle'
        },
        {
            label: 'Danh mục hiện có',
            value: '4 nhóm',
            icon: 'avg_pace',
            themeClass: 'primaryCard',
            iconTheme: 'secondary',
            trendText: 'Chu kỳ kiểm kho: 30 ngày',
            trendClass: 'neutral'
        }
    ];

    // --- LOGIC LỌC DỮ LIỆU SẢN PHẨM ---
    const filteredProducts = products.filter(product => {
        // 1. Tìm kiếm theo Tên sản phẩm hoặc SKU
        const firstVariantSku = product.variants?.[0]?.sku || '';
        const matchesSearch =
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            firstVariantSku.toLowerCase().includes(searchTerm.toLowerCase());

        // 2. Lọc theo tên Danh mục (Khớp tên trả về từ BE như categoryName)
        const matchesCategory =
            selectedCategory === 'Tất cả danh mục' ||
            (product.categoryName && product.categoryName.toLowerCase() === selectedCategory.toLowerCase());

        // 3. Lọc theo tên Thương hiệu (Khớp brandName)
        const matchesBrand =
            selectedBrand === 'Tất cả thương hiệu' ||
            (product.brandName && product.brandName.toLowerCase() === selectedBrand.toLowerCase());

        return matchesSearch && matchesCategory && matchesBrand;
    });

    // 2. Hàm mở modal
    const openModal = (product = null) => {
        if (product) {
            setEditingProduct(product);
            setFormData({
                name: product.name,
                categoryId: product.categoryId || '1',
                brandId: product.brandId || '1',
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

    // 4. Hàm gửi form (Submit)
    const handleFormSubmit = async (e) => {
        e.preventDefault();

        const payload = {
            name: formData.name,
            description: `Mã SKU: ${formData.sku}`,
            basePrice: parseFloat(formData.basePrice) || 0,
            imageUrl: formData.imageUrl,
            categoryId: parseInt(formData.categoryId) || 1,
            brandId: parseInt(formData.brandId) || 1,
            galleryImages: []
        };

        try {
            if (editingProduct) {
                await productService.updateProduct(editingProduct.id, payload);
                alert('Cập nhật thông tin sản phẩm thành công!');
            } else {
                await productService.addProduct(payload);
                alert('Thêm sản phẩm mới thành công!');
            }
            setIsModalOpen(false);
            loadProducts();
        } catch (error) {
            alert('Có lỗi xảy ra: ' + error.message);
        }
    };

    // 5. Hàm xử lý Xóa sản phẩm
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

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    };

    return (
        <main className={styles.main}>
            <div className={styles.container}>

                {/* Page Header Section */}
                <div className={styles.headerSection}>
                    <div>
                        <h2 className={styles.pageTitle}>Quản lý sản phẩm</h2>
                        <p className={styles.pageSubtitle}>Danh sách tất cả giày và phụ kiện hiện có trong hệ thống.</p>
                    </div>
                    <button className={styles.addBtn} onClick={() => openModal(null)}>
                        <span className="material-symbols-outlined">add</span>
                        Thêm sản phẩm mới
                    </button>
                </div>

                {/* Contextual Stats Cards (Bento Style) - Sử dụng data thật */}
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

                {/* Filters Section - Đã gắn State điều khiển */}
                <div className={styles.filtersBar}>
                    {/* Thanh tìm kiếm nhanh mới bổ sung */}
                    <div className={styles.searchWrapper} style={{ display: 'flex', alignItems: 'center', backgroundColor: '#fff', padding: '0 10px', borderRadius: '8px', border: '1px solid #e0e0e0', marginRight: '12px', flex: 1 }}>
                        <span className="material-symbols-outlined" style={{ color: '#757575', marginRight: '6px' }}>search</span>
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo tên, mã SKU..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ border: 'none', outline: 'none', padding: '8px 0', width: '100%', fontSize: '14px' }}
                        />
                    </div>

                    <div className={styles.selectWrapper}>
                        <span className={`${styles.filterIcon} material-symbols-outlined`}>category</span>
                        <select
                            className={styles.selectInput}
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                        >
                            <option value="Tất cả danh mục">Tất cả danh mục</option>
                            <option value="Sneakers">Sneakers</option>
                            <option value="Running">Running</option>
                            <option value="Basketball">Basketball</option>
                            <option value="Casual">Casual</option>
                        </select>
                    </div>

                    <div className={styles.selectWrapper}>
                        <span className={`${styles.filterIcon} material-symbols-outlined`}>brand_family</span>
                        <select
                            className={styles.selectInput}
                            value={selectedBrand}
                            onChange={(e) => setSelectedBrand(e.target.value)}
                        >
                            <option value="Tất cả thương hiệu">Tất cả thương hiệu</option>
                            <option value="Nike">Nike</option>
                            <option value="Adidas">Adidas</option>
                            <option value="Jordan">Jordan</option>
                            <option value="Yeezy">Yeezy</option>
                        </select>
                    </div>

                    <div className={styles.divider}></div>

                    <button className={styles.advancedFilterBtn} onClick={loadProducts} title="Làm mới danh sách">
                        <span className="material-symbols-outlined">refresh</span>
                        Làm mới
                    </button>
                </div>

                {/* Product Table Area */}
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
                            ) : filteredProducts.length === 0 ? (
                                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>Không có sản phẩm nào phù hợp với bộ lọc tìm kiếm.</td></tr>
                            ) : (
                                // Render dựa trên danh sách filteredProducts sau lọc
                                filteredProducts.map((product) => {
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
                                                    <button className={styles.actionBtn} title="Chỉnh sửa" onClick={() => openModal(product)}>
                                                        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>edit</span>
                                                    </button>
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

                    {/* Pagination Footer */}
                    <div className={styles.pagination}>
                        <p className={styles.pageText}>
                            Hiển thị <span>1 - {filteredProducts.length}</span> trong số <span>{filteredProducts.length}</span> sản phẩm phù hợp
                        </p>
                        <div className={styles.pageControls}>
                            <button className={styles.pageBtn} disabled>
                                <span className="material-symbols-outlined">chevron_left</span>
                            </button>
                            <button className={`${styles.pageBtn} ${styles.active}`}>1</button>
                            <button className={styles.pageBtn}>
                                <span className="material-symbols-outlined">chevron_right</span>
                            </button>
                        </div>
                    </div>
                </div>

            </div>

            {/* POPUP MODAL SECTION */}
            {isModalOpen && (
                <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3 className={styles.modalTitle}>
                                {editingProduct ? `Chỉnh sửa sản phẩm #${editingProduct.id}` : 'Thêm sản phẩm mới'}
                            </h3>
                            <button className={styles.modalCloseBtn} onClick={() => setIsModalOpen(false)}>
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

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

                            <div className={styles.modalFooter}>
                                <button type="button" className={styles.cancelBtn} onClick={() => setIsModalOpen(false)}>Hủy bỏ</button>
                                <button type="submit" className={styles.submitBtn}>Xác nhận lưu</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
    );
}

export default ProductManagement;