import API from './api';

const favoriteService = {
    // 1. Lấy danh sách sản phẩm yêu thích của User (Yêu cầu Đăng nhập)
    getFavorites: async () => {
        const response = await API.get('/favorites');
        return response.data;
    },

    // 2. Bật/Tắt yêu thích sản phẩm - Thêm nếu chưa có, Xóa nếu đã có (Yêu cầu Đăng nhập)
    toggleFavorite: async (productId) => {
        const response = await API.post('/favorites/toggle', { productId });
        return response.data;
    },

    // 3. Xóa bỏ 1 sản phẩm cụ thể khỏi danh sách yêu thích (Yêu cầu Đăng nhập)
    removeFavorite: async (productId) => {
        const response = await API.delete(`/favorites/${productId}`);
        return response.data;
    },

    // 4. Xóa sạch sành sanh toàn bộ danh sách yêu thích (Yêu cầu Đăng nhập)
    clearAllFavorites: async () => {
        const response = await API.delete('/favorites/all');
        return response.data;
    }
};

export default favoriteService;