import React from 'react';
import { Link } from 'react-router-dom';
import './ProductCard.css';

const ProductCard = ({ data }) => {
    // Hàm format tiền tệ VNĐ
    const formatCurrency = (value) => {
        if (!value) return '0 ₫';
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(value);
    };

    // Trích xuất dữ liệu an toàn từ API
    const id = data?.id; // Lấy id để gắn vào URL route
    const name = data?.name || "Tên sản phẩm";
    const brand = data?.brandName || "Thương hiệu";
    const category = data?.categoryName || data?.category || "Giày thể thao";
    const price = data?.basePrice ? formatCurrency(data.basePrice) : (data?.price || "0 ₫");
    const img = data?.imageUrl || data?.img || "https://placehold.co/300x300?text=No+Image";

    return (
        <Link to={`/detail/${id}`} className="product-card">
            <div className="product-img-wrapper">
                <img alt={name} src={img} className="product-img" />
            </div>
            <div className="product-info">
                <span className="product-category">{brand} • {category}</span>
                <h3 className="product-title">{name}</h3>
                <span className="product-price">{price}</span>
            </div>
        </Link>
    );
};

export default ProductCard;