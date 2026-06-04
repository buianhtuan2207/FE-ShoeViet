import API from './api';

export const userService = {
    // 1. Lấy tất cả danh sách user (Admin dùng)
    getAllUsers: async () => {
        const response = await API.get('/users');
        return response.data;
    },

    // 2. Xem chi tiết user bất kỳ theo ID
    getUserById: async (id) => {
        const response = await API.get(`/users/${id}`);
        return response.data;
    },

    // 3. Lấy thông tin profile cá nhân
    getMyProfile: async () => {
        const response = await API.get('/users/my-profile');
        return response.data;
    },

    // 4. Cập nhật thông tin profile cá nhân
    updateProfile: async (profileData) => {
        const response = await API.put('/users/my-profile', profileData);
        return response.data;
    }
};