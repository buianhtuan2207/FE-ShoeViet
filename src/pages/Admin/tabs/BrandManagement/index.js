import React, { useState, useEffect } from 'react';
import brandService from '../../../../services/BrandService';
import styles from './BrandManagement.module.scss';

function BrandManagement() {
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentBrand, setCurrentBrand] = useState(null);
    const [formData, setFormData] = useState({ name: '', description: '', website: '', logo: '', isActive: true });
    const [filterTab, setFilterTab] = useState('all');

    useEffect(() => {
        fetchBrands();
    }, []);

    const fetchBrands = async () => {
        try {
            setLoading(true);
            const data = await brandService.getAllBrands();
            setBrands(data);
        } catch (error) {
            console.error("Lỗi khi tải thương hiệu:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (brand = null) => {
        setCurrentBrand(brand);

        // Lấy đúng trạng thái dù BE trả về is_action, isAction hay isActive
        const currentStatus = brand ? (brand.is_action ?? brand.isAction ?? brand.isActive) : true;

        setFormData(brand ? {
            name: brand.name,
            description: brand.description || brand.desc || '',
            website: brand.website || '',
            logo: brand.logo || '',
            isActive: currentStatus === 1 || currentStatus === true || currentStatus === "1"
        } : { name: '', description: '', website: '', logo: '', isActive: true });

        setIsModalOpen(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const payload = {
                ...formData,
                is_action: formData.isActive ? 1 : 0,
                isActive: formData.isActive
            };

            if (currentBrand) {
                await brandService.updateBrand(currentBrand.id, payload);
            } else {
                await brandService.addBrand(payload);
            }
            setIsModalOpen(false);
            fetchBrands();
        } catch (error) {
            console.error("Lỗi chi tiết:", error.response?.data);
            alert('Lưu thất bại: ' + (error.response?.data?.message || error.message));
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa thương hiệu này?')) {
            try {
                await brandService.deleteBrand(id);
                fetchBrands();
            } catch (error) {
                alert('Xóa thất bại. Vui lòng thử lại.');
            }
        }
    };

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const CLOUD_NAME = "dmg1ezdge";
        const UPLOAD_PRESET = "quetstdf";

        setIsLoading(true);
        try {
            const formDataCloud = new FormData();
            formDataCloud.append('file', file);
            formDataCloud.append('upload_preset', UPLOAD_PRESET);

            const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
                method: 'POST',
                body: formDataCloud
            });
            const data = await res.json();

            setFormData(prev => ({ ...prev, logo: data.secure_url }));
        } catch (error) {
            alert("Lỗi upload ảnh: " + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const totalProducts = brands.reduce((sum, b) => sum + (b.products || b.productCount || 0), 0);

    // ĐÃ SỬA: Tính toán số lượng và bộ lọc dựa trên hàm đọc trạng thái chuẩn
    const activeCount = brands.filter(b => {
        const status = b.is_action ?? b.isAction ?? b.isActive;
        return status !== false && status !== 0;
    }).length;

    const filteredBrands = brands.filter(b => {
        const status = b.is_action ?? b.isAction ?? b.isActive;
        const isShowing = status !== false && status !== 0;

        if (filterTab === 'active') return isShowing;
        if (filterTab === 'hidden') return !isShowing;
        return true;
    });

    return (
        <main className={styles.container}>
            {isModalOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <div className={styles.modalHeader}>
                            <h3>{currentBrand ? 'Cập nhật thương hiệu' : 'Thêm thương hiệu mới'}</h3>
                            <button className={styles.closeBtn} onClick={() => setIsModalOpen(false)}>
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <form onSubmit={handleSave} className={styles.modalForm}>
                            <div className={styles.formGroup}>
                                <label>Logo thương hiệu</label>
                                <div className={styles.uploadArea}>
                                    {formData.logo ? (
                                        <div className={styles.imagePreview}>
                                            <img src={formData.logo} alt="Preview" />
                                            <button
                                                type="button"
                                                className={styles.removeImgBtn}
                                                onClick={() => setFormData({...formData, logo: ''})}
                                                title="Xóa ảnh"
                                            >
                                                <span className="material-symbols-outlined">close</span>
                                            </button>
                                        </div>
                                    ) : (
                                        <label className={styles.uploadBtn}>
                                            <input type="file" onChange={handleUpload} accept="image/*" hidden />
                                            <span className="material-symbols-outlined">add_photo_alternate</span>
                                            <span>Chọn ảnh</span>
                                        </label>
                                    )}
                                </div>
                            </div>
                            <div className={styles.formGroup}>
                                <label>Tên thương hiệu</label>
                                <input
                                    placeholder="VD: Nike, Adidas..."
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    required
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Mô tả ngắn</label>
                                <textarea
                                    placeholder="Nhập mô tả..."
                                    rows="2"
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Trạng thái</label>
                                <select
                                    className={styles.formControl}
                                    value={formData.isActive ? "true" : "false"}
                                    onChange={(e) => setFormData({...formData, isActive: e.target.value === 'true'})}
                                >
                                    <option value="true">Hiển thị</option>
                                    <option value="false">Ẩn</option>
                                </select>
                            </div>
                            <div className={styles.modalActions}>
                                <button
                                    type="button"
                                    className={styles.cancelBtn}
                                    onClick={() => setIsModalOpen(false)}>Hủy
                                </button>
                                <button
                                    type="submit"
                                    className={styles.saveBtn}
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Đang xử lý...' : (currentBrand ? 'Lưu thay đổi' : 'Thêm mới')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className={styles.content}>
                <div className={styles.pageHeader}>
                    <div>
                        <h2 className={styles.title}>Thương hiệu</h2>
                        <p className={styles.subtitle}>Quản lý và cập nhật các đối tác thương hiệu của hệ thống.</p>
                    </div>
                    <button className={styles.addBtn} onClick={() => handleOpenModal()}>
                        <span className="material-symbols-outlined">add_circle</span>
                        Thêm thương hiệu mới
                    </button>
                </div>

                <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                        <div className={`${styles.iconWrapper} ${styles.blue}`}>
                            <span className="material-symbols-outlined">verified</span>
                        </div>
                        <div className={styles.statInfo}>
                            <p className={styles.statLabel}>Tổng số</p>
                            <h3 className={styles.statValue}>{brands.length}</h3>
                        </div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={`${styles.iconWrapper} ${styles.green}`}>
                            <span className="material-symbols-outlined">check_circle</span>
                        </div>
                        <div className={styles.statInfo}>
                            <p className={styles.statLabel}>HIỂN THỊ</p>
                            <h3 className={`${styles.statValue} ${styles.green}`}>{activeCount}</h3>
                        </div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={`${styles.iconWrapper} ${styles.orange}`}>
                            <span className="material-symbols-outlined">inventory_2</span>
                        </div>
                        <div className={styles.statInfo}>
                            <p className={styles.statLabel}>Sản phẩm</p>
                            <h3 className={styles.statValue}>{totalProducts}</h3>
                        </div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={`${styles.iconWrapper} ${styles.gray}`}>
                            <span className="material-symbols-outlined">lock</span>
                        </div>
                        <div className={styles.statInfo}>
                            <p className={styles.statLabel}>ẨN</p>
                            <h3 className={`${styles.statValue} ${styles.gray}`}>{brands.length - activeCount}</h3>
                        </div>
                    </div>
                </div>

                <div className={styles.tableWrapper}>
                    <div className={styles.tableHeader}>
                        <div className={styles.headerLeft}>
                            <h4 className={styles.tableTitle}>Danh sách thương hiệu</h4>
                            <div className={styles.filterTabs}>
                                <button
                                    className={`${styles.tabBtn} ${filterTab === 'all' ? styles.activeTab : ''}`}
                                    onClick={() => setFilterTab('all')}
                                >
                                    Tất cả
                                </button>
                                <button
                                    className={`${styles.tabBtn} ${filterTab === 'active' ? styles.activeTab : ''}`}
                                    onClick={() => setFilterTab('active')}
                                >
                                    Hiển thị
                                </button>
                                <button
                                    className={`${styles.tabBtn} ${filterTab === 'hidden' ? styles.activeTab : ''}`}
                                    onClick={() => setFilterTab('hidden')}
                                >
                                    Đang ẩn
                                </button>
                            </div>
                        </div>
                        <button className={styles.filterBtn}>
                            <span className="material-symbols-outlined">filter_list</span>
                            Lọc dữ liệu
                        </button>
                    </div>

                    <div className={styles.tableScroll}>
                        <table className={styles.table}>
                            <thead>
                            <tr>
                                <th>Tên thương hiệu</th>
                                <th>Mô tả ngắn</th>
                                <th>Số lượng SP</th>
                                <th style={{ textAlign: 'center' }}>Trạng thái</th>
                                <th style={{ textAlign: 'center' }}>Thao tác</th>
                            </tr>
                            </thead>
                            <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', padding: '24px' }}>Đang tải dữ liệu...</td>
                                </tr>
                            ) : filteredBrands.length > 0 ? (
                                filteredBrands.map((brand) => {
                                    // ĐÃ SỬA: Đọc đúng trạng thái cho từng row trong bảng
                                    const status = brand.is_action ?? brand.isAction ?? brand.isActive;
                                    const isShowing = status !== false && status !== 0;

                                    return (
                                        <tr key={brand.id}>
                                            <td>
                                                <div className={styles.brandCell}>
                                                    <div className={styles.logoBox}>
                                                        {brand.logo ? (
                                                            <img src={brand.logo} alt={brand.name} onError={(e) => { e.target.src = '/default-logo.png'; }} />
                                                        ) : (
                                                            <span className="material-symbols-outlined">image</span>
                                                        )}
                                                    </div>
                                                    <p className={styles.brandName}>{brand.name}</p>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={styles.descText}>
                                                    {brand.description || brand.desc || 'Chưa có mô tả'}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={styles.productCount}>
                                                    {brand.products || brand.productCount || 0} sản phẩm
                                                </span>
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                {/* ĐÃ SỬA: Render class và text dựa trên biến isShowing vừa tính */}
                                                <span className={`${styles.statusBadge} ${isShowing ? styles.active : styles.hidden}`}>
                                                    <span className={styles.statusDot}></span>
                                                    {isShowing ? 'Hiển thị' : 'Đang ẩn'}
                                                </span>
                                            </td>
                                            <td>
                                                <div className={styles.actionButtons}>
                                                    <button className={styles.editBtn} title="Chỉnh sửa" onClick={() => handleOpenModal(brand)}>
                                                        <span className="material-symbols-outlined">edit</span>
                                                    </button>
                                                    <button className={styles.deleteBtn} title="Xóa" onClick={() => handleDelete(brand.id)}>
                                                        <span className="material-symbols-outlined">delete</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>Không tìm thấy thương hiệu nào.</td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>

                    <div className={styles.pagination}>
                        <button className={`${styles.pageBtn} ${styles.outline}`} disabled>
                            <span className="material-symbols-outlined">chevron_left</span>
                        </button>
                        <div className={styles.pageNumbers}>
                            <button className={`${styles.pageBtn} ${styles.active}`}>1</button>
                        </div>
                        <button className={`${styles.pageBtn} ${styles.outline}`} disabled>
                            <span className="material-symbols-outlined">chevron_right</span>
                        </button>
                    </div>
                </div>
            </div>
        </main>
    );
}

export default BrandManagement;