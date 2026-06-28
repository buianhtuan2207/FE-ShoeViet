import React, { useState, useEffect } from 'react';
import categoryService from '../../../../services/CategoryService';
import styles from './CategoryManagement.module.scss';

function CategoryManagement() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    // State dùng cho Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentCategory, setCurrentCategory] = useState(null);
    const [formData, setFormData] = useState({ name: '', description: '', imageUrl: '', isActive: true });

    // State dùng cho bộ lọc (Tất cả, Hiển thị, Đang ẩn)
    const [filterTab, setFilterTab] = useState('all');

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const data = await categoryService.getAllCategories();
            setCategories(data);
        } catch (error) {
            console.error("Lỗi khi tải danh mục:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (category = null) => {
        setCurrentCategory(category);
        setFormData(category ? {
            name: category.name,
            description: category.description,
            imageUrl: category.imageUrl || '',
            isActive: category.isActive !== false
        } : { name: '', description: '', imageUrl: '', isActive: true });
        setIsModalOpen(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            if (currentCategory) {
                await categoryService.updateCategory(currentCategory.id, formData);
            } else {
                await categoryService.addCategory(formData);
            }
            setIsModalOpen(false);
            fetchCategories();
        } catch (error) {
            alert('Lưu thất bại: ' + (error.response?.data || error.message));
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa danh mục này?')) {
            try {
                await categoryService.deleteCategory(id);
                fetchCategories();
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

            setFormData(prev => ({ ...prev, imageUrl: data.secure_url }));
        } catch (error) {
            alert("Lỗi upload ảnh: " + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Tính toán số liệu thống kê
    const totalProducts = categories.reduce((sum, cat) => sum + (cat.productCount || 0), 0);
    const activeCount = categories.filter(cat => cat.isActive !== false).length;

    // Lọc mảng dữ liệu dựa trên tab đang chọn
    const filteredCategories = categories.filter(cat => {
        if (filterTab === 'active') return cat.isActive !== false;
        if (filterTab === 'hidden') return cat.isActive === false;
        return true; // 'all'
    });

    return (
        <main className={styles.mainContent}>
            {isModalOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <div className={styles.modalHeader}>
                            <h3>{currentCategory ? 'Cập nhật danh mục' : 'Thêm danh mục mới'}</h3>
                            <button className={styles.closeBtn} onClick={() => setIsModalOpen(false)}>
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <form onSubmit={handleSave} className={styles.modalForm}>
                            <div className={styles.formGroup}>
                                <label>Ảnh đại diện danh mục</label>
                                <div className={styles.uploadArea}>
                                    {formData.imageUrl ? (
                                        <div className={styles.imagePreview}>
                                            <img src={formData.imageUrl} alt="Preview" />
                                            <button
                                                type="button"
                                                className={styles.removeImgBtn}
                                                onClick={() => setFormData({...formData, imageUrl: ''})}
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
                                <label>Tên danh mục</label>
                                <input
                                    placeholder="VD: Giày Thể Thao"
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    required
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Mô tả ngắn</label>
                                <textarea
                                    placeholder="Nhập mô tả..."
                                    rows="4"
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Trạng thái</label>
                                <select
                                    className={styles.formControl}
                                    value={formData.isActive}
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
                                    {isLoading ? 'Đang xử lý...' : (currentCategory ? 'Lưu thay đổi' : 'Thêm mới')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className={styles.container}>
                <div className={styles.pageHeader}>
                    <div className={styles.titleSection}>
                        <h2 className={styles.title}>Quản lý danh mục</h2>
                        <p className={styles.subtitle}>Quản lý các nhóm sản phẩm giày và phụ kiện trong hệ thống.</p>
                    </div>
                    <button className={styles.addButton} onClick={() => handleOpenModal()}>
                        <span className="material-symbols-outlined">add</span>
                        Thêm danh mục mới
                    </button>
                </div>

                <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                        <p className={styles.statLabel}>Tổng danh mục</p>
                        <div className={styles.statValueGroup}>
                            <h3 className={styles.statValue}>{categories.length}</h3>
                            <span className={`${styles.badge} ${styles.badgePrimary}`}>+2 tháng này</span>
                        </div>
                    </div>
                    <div className={styles.statCard}>
                        <p className={styles.statLabel}>Sản phẩm liên kết</p>
                        <div className={styles.statValueGroup}>
                            <h3 className={styles.statValue}>{totalProducts}</h3>
                            <span className={`${styles.badge} ${styles.badgeTertiary}`}>8.4% tăng</span>
                        </div>
                    </div>
                    <div className={styles.statCard}>
                        <p className={styles.statLabel}>Đang hiển thị</p>
                        <div className={styles.statValueGroup}>
                            <h3 className={styles.statValue}>{activeCount}</h3>
                            <div className={styles.progressBar}>
                                <div className={styles.progressFill} style={{ width: '88%' }}></div>
                            </div>
                        </div>
                    </div>
                    <div className={styles.statCard}>
                        <p className={styles.statLabel}>Lượt xem danh mục</p>
                        <div className={styles.statValueGroup}>
                            <h3 className={styles.statValue}>45.2K</h3>
                            <span className={`${styles.badge} ${styles.badgeError}`}>-2% tuần</span>
                        </div>
                    </div>
                </div>

                <div className={styles.tableCard}>
                    <div className={styles.tableHeader}>
                        <div className={styles.tableActions}>
                            <h4 className={styles.tableTitle}>Danh sách danh mục</h4>
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

                    <div className={styles.tableWrapper}>
                        <table className={styles.table}>
                            <thead>
                            <tr>
                                <th>Tên danh mục</th>
                                <th>Mô tả ngắn</th>
                                <th>Số lượng SP</th>
                                <th>Trạng thái</th>
                                <th className={styles.textRight}>Thao tác</th>
                            </tr>
                            </thead>
                            <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className={styles.emptyState}>Đang tải dữ liệu...</td>
                                </tr>
                            ) : filteredCategories.length > 0 ? (
                                filteredCategories.map((cat) => (
                                    <tr key={cat.id}>
                                        <td>
                                            <div className={styles.catInfo}>
                                                <div className={styles.catImage}>
                                                    {cat.imageUrl ? (
                                                        <img
                                                            src={cat.imageUrl}
                                                            alt={cat.name}
                                                            onError={(e) => { e.target.src = '/default-category.png'; }}
                                                        />
                                                    ) : (
                                                        <span className="material-symbols-outlined">category</span>
                                                    )}
                                                </div>
                                                <span className={styles.catName}>{cat.name}</span>
                                            </div>
                                        </td>
                                        <td className={styles.description}>
                                            {cat.description || 'Chưa có mô tả.'}
                                        </td>
                                        <td>
                                            <span className={styles.productCount}>{cat.productCount || 0} sản phẩm</span>
                                        </td>
                                        <td>
                                            {cat.isActive !== false ? (
                                                <span className={`${styles.statusBadge} ${styles.statusActive}`}>
                                                    <span className={styles.statusDot}></span> Hiển thị
                                                </span>
                                            ) : (
                                                <span className={`${styles.statusBadge} ${styles.statusHidden}`}>
                                                    <span className={styles.statusDot}></span> Ẩn
                                                </span>
                                            )}
                                        </td>
                                        <td className={styles.actions}>
                                            <button className={styles.actionBtn} title="Sửa" onClick={() => handleOpenModal(cat)}>
                                                <span className="material-symbols-outlined">edit</span>
                                            </button>
                                            <button
                                                className={`${styles.actionBtn} ${styles.deleteBtn}`}
                                                title="Xóa"
                                                onClick={() => handleDelete(cat.id)}
                                            >
                                                <span className="material-symbols-outlined">delete</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className={styles.emptyState}>Không tìm thấy danh mục nào.</td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>
                    {/* Phần pagination tạm ẩn vì trong hình không có, nếu cần bạn tự mở lại */}
                    <div className={styles.pagination} style={{ display: 'none' }}>
                        <p>Hiển thị 1 - {filteredCategories.length} trên tổng {filteredCategories.length} danh mục</p>
                        <div className={styles.pageControls}>
                            <button className={styles.pageBtn} disabled><span className="material-symbols-outlined">chevron_left</span></button>
                            <button className={`${styles.pageBtn} ${styles.activePage}`}>1</button>
                            <button className={styles.pageBtn}>2</button>
                            <button className={styles.pageBtn}><span className="material-symbols-outlined">chevron_right</span></button>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}

export default CategoryManagement;