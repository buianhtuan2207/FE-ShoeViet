import React from 'react';
import { Link } from 'react-router-dom';
import styles from './ProductCard.module.scss';

const ProductCard = ({ data }) => {
    const formatCurrency = (value) => {
        if (!value) return '0 ₫';
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(value);
    };

    const id = data?.id;
    const name = data?.name || "Tên sản phẩm";
    const brand = data?.brandName || "Thương hiệu";
    const category = data?.categoryName || data?.category || "Giày thể thao";
    const price = data?.basePrice ? formatCurrency(data.basePrice) : (data?.price || "0 ₫");
    const img = data?.imageUrl || data?.img || "https://placehold.co/300x300?text=No+Image";

    const handleFavorite = (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log(`Thêm vào yêu thích sản phẩm ID: ${id}`);
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
                    <button className={`${styles['action-btn']} ${styles['btn-favorite']}`} onClick={handleFavorite} title="Yêu thích">
                        <span className="material-symbols-outlined">favorite</span>
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