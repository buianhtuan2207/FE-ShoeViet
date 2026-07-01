import React, { useEffect } from 'react'; // 🎯 XÓA BỎ useState vì không dùng nữa
import { Link } from 'react-router-dom';
import favoriteService from '../../services/FavoriteService';
import styles from './ProductCard.module.scss';
import { useFavorites } from '../../context/FavoriteContext'; // <-- Kiểm tra lại đường dẫn import cho đúng

const ProductCard = ({ data, isInitiallyLiked = false, onFavoriteToggle }) => {
    const id = data?.id;

    // 1. LẤY DỮ LIỆU TỪ KHO CHUNG (CONTEXT) RA ĐÂY
    const { likedProductIds, setProductLikedStatus } = useFavorites();

    // 2. BIẾN KIỂM TRA TRÁI TIM ĐỎ: Kiểm tra xem ID sản phẩm này có nằm trong mảng kho chung không
    const isLiked = likedProductIds.includes(id);

    // 3. ĐỒNG BỘ BAN ĐẦU: Khi card load lần đầu, nếu BE báo đã thích, nạp ID này vào kho chung
    useEffect(() => {
        if (data?.isLiked || data?.liked || isInitiallyLiked) {
            setProductLikedStatus(id, true);
        }
    }, [id, data?.isLiked, data?.liked, isInitiallyLiked]);

    const formatCurrency = (value) => {
        if (!value) return '0 ₫';
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(value);
    };

    const name = data?.name || "Tên sản phẩm";
    const brand = data?.brandName || "Thương hiệu";
    const category = data?.categoryName || data?.category || "Giày thể thao";
    const price = data?.basePrice ? formatCurrency(data.basePrice) : (data?.price || "0 ₫");
    const img = data?.imageUrl || data?.img || "https://placehold.co/300x300?text=No+Image";

    const handleFavorite = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        try {
            const response = await favoriteService.toggleFavorite(id);
            if (response.success) {
                // 4. CẬP NHẬT LÊN KHO CHUNG:
                // Thay vì setIsLiked(response.isFavorite), ta bắn trạng thái mới lên Context
                setProductLikedStatus(id, response.isFavorite);

                // Sau đó thông báo lên component cha xử lý tiếp logic xóa phần tử khỏi grid (nếu ở trang Favorite)
                if (onFavoriteToggle) {
                    onFavoriteToggle(id, response.isFavorite);
                }
            }
        } catch (error) {
            console.error("Lỗi khi xử lý yêu thích sản phẩm:", error);
        }
    };

    const handleAddToCart = (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log(`Thêm vào giỏ hàng sản phẩm ID: ${id}`);
    };

    return (
        <Link to={`/detail/${id}`} className={styles['product-card']}>
            <div className={styles['product-img-wrapper']}>
                <img alt={name} src={img} className={styles['product-img']} />

                <div className={styles['product-actions']}>
                    {/* Giữ nguyên phần render này, class styles['liked'] sẽ tự động ăn theo biến isLiked lấy từ Context */}
                    <button
                        className={`${styles['action-btn']} ${styles['btn-favorite']} ${isLiked ? styles['liked'] : ''}`}
                        onClick={handleFavorite}
                        title={isLiked ? "Bỏ yêu thích" : "Yêu thích"}
                    >
                        <span className="material-symbols-outlined">
                            favorite
                        </span>
                    </button>
                    <button className={`${styles['action-btn']} ${styles['btn-cart']}`} onClick={handleAddToCart} title="Thêm vào giỏ">
                        <span className="material-symbols-outlined">shopping_cart</span>
                    </button>
                </div>
            </div>
            <div className={styles['product-info']}>
                <span className={styles['product-category']}>{brand} • {category}</span>
                <h3 className={styles['product-title']}>{name}</h3>
                <span className={styles['product-price']}>{price}</span>
            </div>
        </Link>
    );
};

export default ProductCard;