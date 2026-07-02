import API from './api';

const shippingService = {
    // 1. Lấy danh sách Tỉnh/Thành
    getProvinces: async () => {
        const response = await API.get('/v1/shipping/provinces');
        return response.data;
    },

    // 2. Lấy danh sách Quận/Huyện theo ID Tỉnh/Thành
    getDistricts: async (provinceId) => {
        const response = await API.get(`/v1/shipping/districts?provinceId=${provinceId}`);
        return response.data;
    },

    // 3. Lấy danh sách Phường/Xã theo ID Quận/Huyện
    getWards: async (districtId) => {
        const response = await API.get(`/v1/shipping/wards?districtId=${districtId}`);
        return response.data;
    },

    // 4. Tính phí vận chuyển (Truyền body data)
    calculateFee: async (shippingData) => {
        const response = await API.post('/v1/shipping/calculate-fee', shippingData);
        return response.data;
    }
};

export default shippingService;