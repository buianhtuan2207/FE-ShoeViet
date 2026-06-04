import API from './api';

const categoryService = {
    // 1. Lấy tất cả danh mục (Public)
    getAllCategories: async () => {
        const response = await API.get('/categories');
        return response.data;
    },

    // 2. Lấy chi tiết danh mục theo ID (Public)
    getCategoryById: async (id) => {
        const response = await API.get(`/categories/${id}`);
        return response.data;
    },

    // 3. Thêm danh mục mới (Yêu cầu quyền Admin)
    addCategory: async (categoryData) => {
        const response = await API.post('/categories', categoryData);
        return response.data;
    },

    // 4. Cập nhật danh mục (Yêu cầu quyền Admin)
    updateCategory: async (id, categoryData) => {
        const response = await API.put(`/categories/${id}`, categoryData);
        return response.data;
    },

    // 5. Xóa danh mục (Yêu cầu quyền Admin)
    deleteCategory: async (id) => {
        const response = await API.delete(`/categories/${id}`);
        return response.data;
    }
};

export default categoryService;