import React, { useState, useEffect } from 'react';
import styles from './ProductManagement.module.scss';
import productService from '../../../../services/ProductService';

function ProductManagement() {
    // --- CÁC STATE QUẢN LÝ DỮ LIỆU ---
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    // --- STATE QUẢN LÝ BỘ LỌC ---
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Tất cả danh mục');
    const [selectedBrand, setSelectedBrand] = useState('Tất cả thương hiệu');

    // 1. State thông tin cơ bản sản phẩm
    const [formData, setFormData] = useState({
        name: '',
        categoryId: '',
        brandId: '',
        basePrice: '',
        imageUrl: '',
        description: ''
    });

    // 2. State quản lý DANH SÁCH BIẾN THỂ (Dòng động)
    const [formVariants, setFormVariants] = useState([
        { size: '', color: '', stockQuantity: '', sku: '' }
    ]);

    // 3. ĐỒNG BỘ CÁCH 1: Quản lý danh sách URL ảnh phụ dạng mảng sạch (mặc định trống)
    const [formGallery, setFormGallery] = useState([]);

    // Hàm tải danh sách sản phẩm từ Spring Boot
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

    const lowStockCount = products.filter(product => {
        const totalStock = product.variants ? product.variants.reduce((sum, v) => sum + (v.stockQuantity || 0), 0) : 0;
        return totalStock <= 5;
    }).length;

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
        const firstVariantSku = product.variants?.[0]?.sku || '';
        const matchesSearch =
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            firstVariantSku.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCategory =
            selectedCategory === 'Tất cả danh mục' ||
            (product.categoryName && product.categoryName.toLowerCase() === selectedCategory.toLowerCase());

        const matchesBrand =
            selectedBrand === 'Tất cả thương hiệu' ||
            (product.brandName && product.brandName.toLowerCase() === selectedBrand.toLowerCase());

        return matchesSearch && matchesCategory && matchesBrand;
    });

    // Hàm mở modal (Đã đồng bộ map dữ liệu ảnh cũ khi Update)
    const openModal = (product = null) => {
        if (product) {
            setEditingProduct(product);
            setFormData({
                name: product.name,
                categoryId: product.categoryId || '1',
                brandId: product.brandId || '1',
                basePrice: product.basePrice,
                imageUrl: product.imageUrl || '',
                description: product.description || ''
            });
            setFormVariants(product.variants && product.variants.length > 0
                ? product.variants.map(v => ({ size: v.size, color: v.color, stockQuantity: v.stockQuantity, sku: v.sku }))
                : [{ size: '', color: '', stockQuantity: '', sku: '' }]
            );
            // Lấy danh sách ảnh phụ cũ của sản phẩm nếu có
            setFormGallery(product.galleryImages && product.galleryImages.length > 0
                ? product.galleryImages
                : []
            );
        } else {
            setEditingProduct(null);
            setFormData({ name: '', categoryId: '1', brandId: '1', basePrice: '', imageUrl: '', description: '' });
            setFormVariants([{ size: '', color: '', stockQuantity: '', sku: '' }]);
            setFormGallery([]); // Thêm mới thì album trống rỗng
        }
        setIsModalOpen(true);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // --- HÀM THAO TÁC BIẾN THỂ ---
    const handleVariantChange = (index, field, value) => {
        const updated = [...formVariants];
        updated[index][field] = value;
        setFormVariants(updated);
    };

    const addVariantRow = () => {
        setFormVariants([...formVariants, { size: '', color: '', stockQuantity: '', sku: '' }]);
    };

    const removeVariantRow = (index) => {
        if (formVariants.length > 1) {
            setFormVariants(formVariants.filter((_, i) => i !== index));
        }
    };

    // --- ĐỒNG BỘ CÁCH 1: HÀM UPLOAD ẢNH THẲNG LÊN CLOUDINARY MIỄN PHÍ ---
    const handleImageUploadLocal = async (e, type) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        // Cấu hình tài khoản Cloudinary (Bạn có thể đổi cloud_name của bạn nếu cần)
        const CLOUD_NAME = "dmg1ezdge";
        const UPLOAD_PRESET = "quetstdf";

        setIsLoading(true);
        try {
            const uploadedUrls = [];

            // Chạy vòng lặp tải từng file lên cloud (xử lý được cả trường hợp chọn nhiều ảnh phụ một lúc)
            for (let i = 0; i < files.length; i++) {
                const formDataCloud = new FormData();
                formDataCloud.append('file', files[i]);
                formDataCloud.append('upload_preset', UPLOAD_PRESET);

                const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
                    method: 'POST',
                    body: formDataCloud
                });

                if (!response.ok) throw new Error("Không thể kết nối đến máy chủ ảnh đám mây!");

                const data = await response.json();
                if (data.secure_url) {
                    uploadedUrls.push(data.secure_url);
                }
            }

            // Đổ link tuyệt đối trả về vào State tương ứng
            if (type === 'main') {
                setFormData(prev => ({ ...prev, imageUrl: uploadedUrls[0] }));
            } else if (type === 'gallery') {
                setFormGallery(prev => [...prev, ...uploadedUrls]);
            }
        } catch (error) {
            alert("Lỗi tải ảnh: " + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Hàm xóa ảnh phụ khỏi danh sách xem trước công việc sửa/thêm
    const removeGalleryImage = (index) => {
        setFormGallery(formGallery.filter((_, i) => i !== index));
    };

    // 4. Hàm gửi form (Payload giữ nguyên link URL như BE yêu cầu)
    const handleFormSubmit = async (e) => {
        e.preventDefault();

        if (!formData.imageUrl) {
            alert("Vui lòng tải lên hình ảnh chính cho sản phẩm!");
            return;
        }

        const payload = {
            name: formData.name,
            description: formData.description || 'Chưa có mô tả',
            basePrice: parseFloat(formData.basePrice) || 0,
            imageUrl: formData.imageUrl,
            categoryId: parseInt(formData.categoryId) || 1,
            brandId: parseInt(formData.brandId) || 1,
            galleryImages: formGallery, // Mảng các link ảnh cloud sạch sẽ
            variants: formVariants.map(v => ({
                size: v.size,
                color: v.color,
                stockQuantity: parseInt(v.stockQuantity) || 0,
                sku: v.sku
            }))
        };

        try {
            if (editingProduct) {
                await productService.updateProduct(editingProduct.id, payload);
                alert('Cập nhật thông tin sản phẩm thành công!');
            } else {
                await productService.addProduct(payload);
                alert('Thêm sản phẩm mới kèm các biến thể thành công!');
            }
            setIsModalOpen(false);
            loadProducts();
        } catch (error) {
            alert('Có lỗi xảy ra: ' + error.message);
        }
    };

    // Hàm xử lý Xóa sản phẩm
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

                {/* Contextual Stats Cards (Bento Style) */}
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

                {/* Filters Section */}
                <div className={styles.filtersBar}>
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
                                <th className={`${styles.th} ${styles.textCenter}`}>Tổng kho</th>
                                <th className={styles.th}>Giá bán</th>
                                <th className={styles.th}>Trạng thái</th>
                                <th className={`${styles.th} ${styles.textRight}`}>Thao tác</th>
                            </tr>
                            </thead>
                            <tbody className={styles.tbody}>
                            {isLoading ? (
                                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>Đang xử lý dữ liệu...</td></tr>
                            ) : filteredProducts.length === 0 ? (
                                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>Không có sản phẩm nào phù hợp với bộ lọc tìm kiếm.</td></tr>
                            ) : (
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
                                                <p className={styles.stockUnit}>Chiếc ({product.variants?.length || 0} biến thể)</p>
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
                </div>

            </div>

            {/* POPUP MODAL SECTION (Đã bóc tách sang Upload file máy tính & Preview ảnh thực) */}
            {isModalOpen && (
                <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
                    <div className={styles.modalContent} style={{ maxWidth: '750px', width: '90%' }} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3 className={styles.modalTitle}>
                                {editingProduct ? `Chỉnh sửa sản phẩm #${editingProduct.id}` : 'Thêm sản phẩm mới'}
                            </h3>
                            <button className={styles.modalCloseBtn} onClick={() => setIsModalOpen(false)}>
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <form onSubmit={handleFormSubmit}>
                            <div className={styles.modalBody} style={{ maxHeight: '70vh', overflowY: 'auto', paddingRight: '5px' }}>

                                {/* 1. THÔNG TIN CƠ BẢN */}
                                <h4 style={{ margin: '0 0 10px 0', borderBottom: '1px dashed #ccc', paddingBottom: '5px', color: '#333' }}>1. Thông tin cơ bản</h4>
                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>Tên sản phẩm *</label>
                                    <input type="text" name="name" value={formData.name} onChange={handleInputChange} className={styles.formInput} placeholder="Ví dụ: Nike Air Force 1" required />
                                </div>

                                <div className={styles.formRow}>
                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>Danh mục *</label>
                                        <select name="categoryId" value={formData.categoryId} onChange={handleInputChange} className={styles.formSelect} required>
                                            <option value="1">Sneakers</option>
                                            <option value="2">Running</option>
                                            <option value="3">Basketball</option>
                                        </select>
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>Thương hiệu *</label>
                                        <select name="brandId" value={formData.brandId} onChange={handleInputChange} className={styles.formSelect} required>
                                            <option value="1">Nike</option>
                                            <option value="2">Adidas</option>
                                            <option value="3">Jordan</option>
                                        </select>
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>Giá bán gốc (₫) *</label>
                                        <input type="number" min="0" name="basePrice" value={formData.basePrice} onChange={handleInputChange} className={styles.formInput} placeholder="3500000" required />
                                    </div>
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>Mô tả chi tiết sản phẩm</label>
                                    <textarea name="description" value={formData.description} onChange={handleInputChange} className={styles.formInput} style={{ height: '60px', padding: '8px' }} placeholder="Nhập mô tả sản phẩm..." />
                                </div>

                                {/* NÂNG CẤP: KHU VỰC CHỌN ẢNH CHÍNH TỪ MÁY */}
                                <div className={styles.formGroup} style={{ marginBottom: '20px' }}>
                                    <label className={styles.formLabel}>Hình ảnh chính sản phẩm *</label>

                                    {formData.imageUrl && (
                                        <div style={{ marginBottom: '10px', position: 'relative', display: 'inline-block' }}>
                                            <img
                                                src={formData.imageUrl}
                                                alt="Main Preview"
                                                style={{ width: '110px', height: '110px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #ddd' }}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, imageUrl: '' }))}
                                                style={{ position: 'absolute', top: '-6px', right: '-6px', background: '#e53935', color: '#fff', border: 'none', borderRadius: '50%', width: '22px', height: '22px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold' }}
                                            >×</button>
                                        </div>
                                    )}

                                    <div>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            id="mainImageFile"
                                            onChange={(e) => handleImageUploadLocal(e, 'main')}
                                            style={{ display: 'none' }}
                                        />
                                        <label
                                            htmlFor="mainImageFile"
                                            style={{ padding: '8px 16px', backgroundColor: '#fafafa', border: '1px dashed #b0bec5', borderRadius: '6px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#37474f' }}
                                        >
                                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>cloud_upload</span>
                                            {formData.imageUrl ? 'Thay ảnh khác' : 'Tải ảnh chính từ thiết bị'}
                                        </label>
                                    </div>
                                </div>

                                {/* NÂNG CẤP: KHU VỰC CHỌN VÀ XEM TRƯỚC ALBUM ẢNH PHỤ */}
                                <h4 style={{ margin: '20px 0 10px 0', borderBottom: '1px dashed #ccc', paddingBottom: '5px', color: '#333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span>2. Danh sách ảnh phụ (Album sản phẩm)</span>
                                    <div>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            id="galleryImagesFile"
                                            onChange={(e) => handleImageUploadLocal(e, 'gallery')}
                                            style={{ display: 'none' }}
                                        />
                                        <label
                                            htmlFor="galleryImagesFile"
                                            style={{ fontSize: '12px', padding: '4px 10px', cursor: 'pointer', backgroundColor: '#e3f2fd', color: '#0d47a1', border: 'none', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                        >
                                            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>add_a_photo</span>
                                            + Chọn nhiều file từ máy
                                        </label>
                                    </div>
                                </h4>

                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '15px', backgroundColor: '#fafafa', padding: formGallery.length > 0 ? '12px' : '0px', borderRadius: '8px' }}>
                                    {formGallery.map((url, index) => (
                                        <div key={index} style={{ position: 'relative', width: '75px', height: '75px' }}>
                                            <img
                                                src={url}
                                                alt={`Sub Preview ${index}`}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '6px', border: '1px solid #cfd8dc' }}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeGalleryImage(index)}
                                                style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'rgba(0,0,0,0.7)', color: '#fff', border: 'none', borderRadius: '50%', width: '18px', height: '18px', cursor: 'pointer', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                            >×</button>
                                        </div>
                                    ))}
                                    {formGallery.length === 0 && (
                                        <p style={{ fontSize: '13px', color: '#78909c', fontStyle: 'italic', margin: '0', padding: '5px 0' }}>Chưa có hình ảnh phụ nào được chọn.</p>
                                    )}
                                </div>

                                {/* 3. QUẢN LÝ DANH SÁCH BIẾN THỂ (VARIANTS) */}
                                <h4 style={{ margin: '20px 0 10px 0', borderBottom: '1px dashed #ccc', paddingBottom: '5px', color: '#333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span>3. Danh sách biến thể (Màu, Size, Tồn kho) *</span>
                                    <button type="button" onClick={addVariantRow} style={{ fontSize: '12px', padding: '2px 8px', cursor: 'pointer', backgroundColor: '#e8f5e9', color: '#1b5e20', border: 'none', borderRadius: '4px' }}>+ Thêm dòng thuộc tính</button>
                                </h4>

                                {formVariants.map((variant, index) => (
                                    <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '10px', backgroundColor: '#f9f9f9', padding: '10px', borderRadius: '6px', border: '1px solid #f0f0f0', alignItems: 'flex-end' }}>
                                        <div style={{ flex: 2 }}>
                                            <label style={{ fontSize: '12px', color: '#666' }}>Kích thước (Size) *</label>
                                            <input type="text" value={variant.size} onChange={(e) => handleVariantChange(index, 'size', e.target.value)} className={styles.formInput} placeholder="Ví dụ: 40, 41, M" required />
                                        </div>
                                        <div style={{ flex: 2 }}>
                                            <label style={{ fontSize: '12px', color: '#666' }}>Màu sắc *</label>
                                            <input type="text" value={variant.color} onChange={(e) => handleVariantChange(index, 'color', e.target.value)} className={styles.formInput} placeholder="Ví dụ: Trắng, Đen" required />
                                        </div>
                                        <div style={{ flex: 2 }}>
                                            <label style={{ fontSize: '12px', color: '#666' }}>Số lượng nhập kho *</label>
                                            <input type="number" min="0" value={variant.stockQuantity} onChange={(e) => handleVariantChange(index, 'stockQuantity', e.target.value)} className={styles.formInput} placeholder="0" required />
                                        </div>
                                        <div style={{ flex: 3 }}>
                                            <label style={{ fontSize: '12px', color: '#666' }}>Mã SKU (Bỏ trống để tự sinh)</label>
                                            <input type="text" value={variant.sku} onChange={(e) => handleVariantChange(index, 'sku', e.target.value)} className={styles.formInput} placeholder="Tự sinh nếu để trống" />
                                        </div>
                                        <button type="button" onClick={() => removeVariantRow(index)} disabled={formVariants.length === 1} style={{ border: 'none', background: 'none', color: '#d32f2f', cursor: 'pointer', paddingBottom: '8px' }}>
                                            <span className="material-symbols-outlined">delete</span>
                                        </button>
                                    </div>
                                ))}

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