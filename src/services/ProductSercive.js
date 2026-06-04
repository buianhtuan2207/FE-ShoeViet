// src/services/productService.js
const BASE_URL = 'http://localhost:8080/api/products';

const productService = {
    // 1. Lấy danh sách sản phẩm
    getAllProducts: async () => {
        try {
            const response = await fetch(BASE_URL);
            if (!response.ok) throw new Error('Không thể lấy danh sách sản phẩm!');
            return await response.json(); // Trả về mảng ProductResponse
        } catch (error) {
            throw error;
        }
    },

    // 2. Thêm sản phẩm mới
    addProduct: async (productData) => {
        try {
            const response = await fetch(BASE_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(productData)
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Thêm sản phẩm thất bại!');
            return data;
        } catch (error) {
            throw error;
        }
    },

    // 3. Cập nhật sản phẩm
    updateProduct: async (id, productData) => {
        try {
            const response = await fetch(`${BASE_URL}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(productData)
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Cập nhật sản phẩm thất bại!');
            return data;
        } catch (error) {
            throw error;
        }
    },

    // 4. Xóa sản phẩm
    deleteProduct: async (id) => {
        try {
            const response = await fetch(`${BASE_URL}/${id}`, {
                method: 'DELETE'
            });
            const data = await response.text(); // BE trả về String text thuần túy khi xóa thành công
            if (!response.ok) throw new Error(data || 'Xóa sản phẩm thất bại!');
            return data;
        } catch (error) {
            throw error;
        }
    }
};

export default productService;