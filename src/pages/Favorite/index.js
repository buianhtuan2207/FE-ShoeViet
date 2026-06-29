import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../../components/ProductCard';
import styles from './Favorite.module.scss';

const Favorite = () => {
    const [favoriteProducts, setFavoriteProducts] = useState([
        {
            id: 1,
            name: "Giày Thể Thao Nike Air Force 1 '07 Next Nature",
            brandName: "Nike",
            categoryName: "Sneaker",
            basePrice: 2990000,
            imageUrl: "https://placehold.co/400x400?text=Nike+Air+Force+1"
        },
        {
            id: 2,
            name: "Giày Chạy Bộ Adidas Ultraboost Light",
            brandName: "Adidas",
            categoryName: "Chạy bộ",
            basePrice: 4500000,
            imageUrl: "https://placehold.co/400x400?text=Adidas+Ultraboost"
        },
        {
            id: 3,
            name: "Giày Bóng Rổ Puma Clyde All-Pro",
            brandName: "Puma",
            categoryName: "Bóng rổ",
            basePrice: 3200000,
            imageUrl: "https://placehold.co/400x400?text=Puma+Clyde"
        }
    ]);

    const handleClearAll = () => {
        if (window.confirm("Bạn có chắc chắn muốn xóa toàn bộ sản phẩm yêu thích?")) {
            setFavoriteProducts([]);
        }
    };

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
                // Lưới sản phẩm khi có data
                <div className={styles['product-grid']}>
                    {favoriteProducts.map((product) => (
                        <div key={product.id} className={styles['grid-item']}>
                            <ProductCard data={product} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Favorite;