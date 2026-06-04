import API from './api'; // Import instance Axios chung

const productService = {
    // 1. Lấy danh sách sản phẩm (Public - Không cần token)
    getAllProducts: async () => {
        const response = await API.get('/products');
        return response.data;
    },

    // 2. Thêm sản phẩm mới (Tự động đính token Admin qua interceptor)
    addProduct: async (productData) => {
        const response = await API.post('/products', productData);
        return response.data;
    },

    // 3. Cập nhật sản phẩm (Tự động đính token Admin)
    updateProduct: async (id, productData) => {
        const response = await API.put(`/products/${id}`, productData);
        return response.data;
    },

    // 4. Xóa sản phẩm (Tự động đính token Admin)
    deleteProduct: async (id) => {
        const response = await API.delete(`/products/${id}`);
        return response.data; // Axios tự xử lý nếu BE trả về chuỗi Text thuần
    }
};

export default productService;