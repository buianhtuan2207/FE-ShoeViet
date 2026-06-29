import React, { createContext, useState, useContext, useEffect } from 'react';

const FavoriteContext = createContext();

export const FavoriteProvider = ({ children }) => {
    const [likedProductIds, setLikedProductIds] = useState([]);

    // Theo dõi token để quản lý trạng thái cô lập giữa các tài khoản
    const token = localStorage.getItem('accessToken');

    // Lắng nghe token: Nếu logout (token mất) thì reset sạch sẽ trạng thái lập tức
    useEffect(() => {
        if (!token) {
            setLikedProductIds([]);
        }
    }, [token]);

    // Hàm cập nhật trạng thái khi nhấn tim ở BẤT KỲ ĐÂU
    const setProductLikedStatus = (productId, isLiked) => {
        // Chặn thao tác nếu user chưa đăng nhập
        if (!localStorage.getItem('accessToken')) return;

        setLikedProductIds(prevIds => {
            if (isLiked) {
                if (!prevIds.includes(productId)) return [...prevIds, productId];
                return prevIds;
            } else {
                return prevIds.filter(id => id !== productId);
            }
        });
    };

    // Hàm đồng bộ mảng ID từ danh sách sản phẩm đổ về
    const syncInitialHomeData = (products) => {
        // 🎯 KHẮC PHỤC: Nếu không có token đăng nhập, tuyệt đối không đồng bộ trạng thái "isLiked" lung tung
        if (!localStorage.getItem('accessToken') || !products) {
            return;
        }

        const activeIds = products.filter(p => p.isLiked || p.liked).map(p => p.id);

        setLikedProductIds(prev => {
            // Nếu mảng cũ trống (vừa đổi tài khoản), thay thế hoàn toàn chứ không gộp bừa bãi
            if (prev.length === 0) return activeIds;

            // Nếu gộp, đảm bảo dữ liệu luôn được cập nhật chính xác theo danh sách mới nhất từ API
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