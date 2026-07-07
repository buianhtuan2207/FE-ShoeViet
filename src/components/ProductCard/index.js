import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import favoriteService from '../../services/FavoriteService';
import styles from './ProductCard.module.scss';
import { useFavorites } from '../../context/FavoriteContext';

const ProductCard = ({ data, isInitiallyLiked = false, onFavoriteToggle }) => {
    const id = data?.id;

    const { likedProductIds, setProductLikedStatus } = useFavorites();

    const isLiked = likedProductIds.includes(id);

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
                setProductLikedStatus(id, response.isFavorite);

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