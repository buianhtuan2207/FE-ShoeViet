import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../../components/ProductCard';
import favoriteService from '../../services/FavoriteService';
import styles from './Favorite.module.scss';
import {useFavorites} from '../../context/FavoriteContext';

const Favorite = () => {
    const [favoriteProducts, setFavoriteProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { clearAllFavorites } = useFavorites();

    const fetchFavorites = async (isFirstLoad = false) => {
        try {
            if (isFirstLoad) setLoading(true);
            const response = await favoriteService.getFavorites();
            if (response.success) {
                setFavoriteProducts(response.data || []);
            }
        } catch (error) {
            console.error("Lỗi khi tải danh sách yêu thích:", error);
        } finally {
            if (isFirstLoad) setLoading(false);
        }
    };

    useEffect(() => {
        fetchFavorites(true);
    }, []);

    const handleCardFavoriteToggle = (productId, isFavorite) => {
        if (!isFavorite) {
            setFavoriteProducts(prev => prev.filter(product => product.id !== productId));
        }
    };

    // 2. Hàm xóa toàn bộ danh sách bằng API
    const handleClearAll = async () => {
        if (window.confirm("Bạn có chắc chắn muốn xóa toàn bộ sản phẩm yêu thích?")) {
            try {
                const response = await favoriteService.clearAllFavorites();
                if (response.success) {
                    clearAllFavorites();
                    setFavoriteProducts([]);
                }
            } catch (error) {
                console.error("Lỗi khi xóa tất cả sản phẩm yêu thích:", error);
                alert("Không thể xóa danh sách lúc này, vui lòng thử lại sau!");
            }
        }
    };

    // Giao diện hiển thị khi đang đợi API tải dữ liệu
    if (loading) {
        return (
            <div className={styles['favorite-container']}>
                <div style={{ textAlign: 'center', padding: '100px 0', color: '#747d8c', fontWeight: '600' }}>
                    Đang tải danh sách yêu thích...
                </div>
            </div>
        );
    }

    return (
        <div className={styles['favorite-container']}>
            {/* Header của trang */}
            <div className={styles['favorite-header']}>
                <div className={styles['header-left']}>
                    <h1>Sản phẩm yêu thích của tôi</h1>
                    <span className={styles['count-badge']}>
                        {favoriteProducts.length} sản phẩm
                    </span>
                </div>
                {favoriteProducts.length > 0 && (
                    <button className={styles['clear-btn']} onClick={handleClearAll}>
                        <span className="material-symbols-outlined">delete</span>
                        Xóa tất cả
                    </button>
                )}
            </div>

            {/* Nội dung trang */}
            {favoriteProducts.length === 0 ? (
                // Giao diện khi trống (Empty State)
                <div className={styles['empty-state']}>
                    <div className={styles['icon-wrapper']}>
                        <span className="material-symbols-outlined">heart_broken</span>
                    </div>
                    <h2>Danh sách yêu thích trống</h2>
                    <p>Hãy khám phá thêm các sản phẩm tuyệt vời khác và lưu lại mẫu giày bạn ưng ý nhất nhé!</p>
                    <Link to="/" className={styles['shop-now-btn']}>
                        Quay lại mua sắm
                        <span className="material-symbols-outlined">arrow_forward</span>
                    </Link>
                </div>
            ) : (
                // Lưới sản phẩm khi có data thật từ API
                <div className={styles['product-grid']}>
                    {favoriteProducts.map((product) => (
                        <div key={product.id} className={styles['grid-item']}>
                            {/* Truyền callback fetchFavorites xuống nếu cần cập nhật lại trang khi bấm bỏ thích ở Card */}
                            <ProductCard
                                data={product}
                                isInitiallyLiked={true}
                                onFavoriteToggle={handleCardFavoriteToggle}
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Favorite;