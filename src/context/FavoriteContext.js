import React, { createContext, useState, useContext } from 'react';

const FavoriteContext = createContext();

export const FavoriteProvider = ({ children }) => {
    // Kho lưu trữ danh sách ID của các sản phẩm đã được thích: Ví dụ [1, 5, 12]
    const [likedProductIds, setLikedProductIds] = useState([]);

    // Hàm cập nhật trạng thái khi nhấn tim ở BẤT KỲ ĐÂU
    const setProductLikedStatus = (productId, isLiked) => {
        setLikedProductIds(prevIds => {
            if (isLiked) {
                // Nếu thích -> Thêm ID vào mảng (nếu chưa có)
                if (!prevIds.includes(productId)) return [...prevIds, productId];
                return prevIds;
            } else {
                // Nếu bỏ thích -> Xóa ID khỏi mảng
                return prevIds.filter(id => id !== productId);
            }
        });
    };

    // Hàm đồng bộ nhanh mảng ID từ API danh sách sản phẩm đổ về
    const syncInitialHomeData = (products) => {
        if (!products) return;
        const activeIds = products.filter(p => p.isLiked || p.liked).map(p => p.id);
        setLikedProductIds(prev => {
            // Gộp các ID mới mà không làm trùng lặp
            const merged = new Set([...prev, ...activeIds]);
            return Array.from(merged);
        });
    };

    const clearAllFavorites = () => {
        setLikedProductIds([]);
    };

    return (
        <FavoriteContext.Provider value={{
            likedProductIds,
            setProductLikedStatus,
            syncInitialHomeData,
            clearAllFavorites
        }}>
            {children}
        </FavoriteContext.Provider>
    );
};

export const useFavorites = () => useContext(FavoriteContext);