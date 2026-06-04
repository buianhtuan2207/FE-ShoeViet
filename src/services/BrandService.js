import API from './api';

const brandService = {
    // 1. Lấy tất cả thương hiệu (Public)
    getAllBrands: async () => {
        const response = await API.get('/brands');
        return response.data;
    },

    // 2. Lấy chi tiết thương hiệu theo ID (Public)
    getBrandById: async (id) => {
        const response = await API.get(`/brands/${id}`);
        return response.data;
    },

    // 3. Thêm thương hiệu mới (Yêu cầu quyền Admin)
    addBrand: async (brandData) => {
        const response = await API.post('/brands', brandData);
        return response.data;
    },

    // 4. Cập nhật thương hiệu (Yêu cầu quyền Admin)
    updateBrand: async (id, brandData) => {
        const response = await API.put(`/brands/${id}`, brandData);
        return response.data;
    },

    // 5. Xóa thương hiệu (Yêu cầu quyền Admin)
    deleteBrand: async (id) => {
        const response = await API.delete(`/brands/${id}`);
        return response.data;
    }
};

export default brandService;