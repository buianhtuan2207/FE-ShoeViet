import API from './api';
import productService from './ProductService';

const searchService = {
    // Tìm kiếm sản phẩm theo từ khóa, danh mục, thương hiệu, giá
    searchProducts: async (filters = {}) => {
        try {
            // Lấy tất cả sản phẩm 
            const allProducts = await productService.getAllProducts();
            let results = allProducts;

            // Lọc theo từ khóa 
            if (filters.keyword && filters.keyword.trim()) {
                const keyword = filters.keyword.toLowerCase().trim();
                results = results.filter(product => 
                    product.name.toLowerCase().includes(keyword) ||
                    product.description?.toLowerCase().includes(keyword)
                );
            }

            // Lọc theo danh mục
            if (filters.categoryId) {
                results = results.filter(product => product.categoryId == filters.categoryId);
            }

            // Lọc theo thương hiệu
            if (filters.brandId) {
                results = results.filter(product => product.brandId == filters.brandId);
            }

            // Lọc theo khoảng giá
            if (filters.minPrice !== undefined) {
                results = results.filter(product => product.price >= filters.minPrice);
            }
            if (filters.maxPrice !== undefined) {
                results = results.filter(product => product.price <= filters.maxPrice);
            }

            // Sắp xếp kết quả
            if (filters.sort) {
                results = sortProducts(results, filters.sort);
            }

            return {
                success: true,
                data: results,
                total: results.length,
                filters: filters
            };
        } catch (error) {
            console.error('Lỗi tìm kiếm sản phẩm:', error);
            return {
                success: false,
                data: [],
                total: 0,
                error: error.message
            };
        }
    },

    //Gợi ý tiềm kiếm
    getSearchSuggestions: async (keyword) => {
        try {
            if (!keyword || keyword.trim().length < 2) {
                return [];
            }

            const allProducts = await productService.getAllProducts();
            const keyword_lower = keyword.toLowerCase();
            const suggestions = [];
            const seenNames = new Set();

            for (const product of allProducts) {
                if (product.name.toLowerCase().includes(keyword_lower)) {
                    if (!seenNames.has(product.name)) {
                        suggestions.push({
                            id: product.id,
                            name: product.name,
                            type: 'product'
                        });
                        seenNames.add(product.name);
                    }
                }
                
                if (suggestions.length >= 5) break;
            }

            return suggestions;
        } catch (error) {
            console.error('Lỗi lấy gợi ý tìm kiếm:', error);
            return [];
        }
    },


};

// Hàm hỗ trợ: Sắp xếp sản phẩm
function sortProducts(products, sortType) {
    const sorted = [...products];

    switch (sortType) {
        case 'Newest':
            return sorted.reverse(); // Giả sử ID gần đây hơn ở cuối
        case 'PriceHighLow':
            return sorted.sort((a, b) => b.price - a.price);
        case 'PriceLowHigh':
            return sorted.sort((a, b) => a.price - b.price);
        case 'Featured':
        default:
            return sorted;
    }
}

export default searchService;
