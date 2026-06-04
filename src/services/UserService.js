const BASE_URL = 'http://localhost:8080/api/users';

// Hàm helper để lấy header cấu hình (bao gồm cả Token JWT nếu có)
const getHeaders = () => {
    const token = localStorage.getItem('accessToken');

    // THÊM DÒNG NÀY ĐỂ KIỂM TRA TRÊN TAB CONSOLE CỦA TRÌNH DUYỆT
    console.log("Token lấy ra từ localStorage:", token);

    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
};

export const userService = {
    // 1. Lấy tất cả danh sách user (Admin dùng)
    getAllUsers: async () => {
        const response = await fetch(`${BASE_URL}`, {
            method: 'GET',
            headers: getHeaders()
        });
        if (!response.ok) {
            throw new Error('Không thể tải danh sách người dùng từ hệ thống!');
        }
        return response.json();
    },

    // 2. Xem chi tiết user bất kỳ theo ID (Admin dùng)
    getUserById: async (id) => {
        const response = await fetch(`${BASE_URL}/${id}`, {
            method: 'GET',
            headers: getHeaders()
        });
        if (!response.ok) {
            throw new Error(`Không tìm thấy người dùng với ID: ${id}`);
        }
        return response.json();
    },

    // 3. Lấy thông tin profile cá nhân
    getMyProfile: async () => {
        const response = await fetch(`${BASE_URL}/my-profile`, {
            method: 'GET',
            headers: getHeaders()
        });
        if (!response.ok) {
            throw new Error('Không thể lấy thông tin trang cá nhân!');
        }
        return response.json();
    },

    // 4. Cập nhật thông tin profile cá nhân
    updateProfile: async (profileData) => {
        const response = await fetch(`${BASE_URL}/my-profile`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(profileData)
        });
        if (!response.ok) {
            throw new Error('Cập nhật thông tin thất bại!');
        }
        return response.json();
    }
};