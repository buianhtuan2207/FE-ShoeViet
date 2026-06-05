import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import ProductCard from '../../components/ProductCard';
import searchService from '../../services/SearchService';
import categoryService from '../../services/CategoryService';
import brandService from '../../services/BrandService';
import './SearchResults.scss';

function SearchResults() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);

    // State cho filters
    const [filters, setFilters] = useState({
        keyword: searchParams.get('q') || '',
        categoryId: searchParams.get('category') || '',
        brandId: searchParams.get('brand') || '',
        minPrice: searchParams.get('minPrice') ? parseInt(searchParams.get('minPrice')) : '',
        maxPrice: searchParams.get('maxPrice') ? parseInt(searchParams.get('maxPrice')) : '',
        sort: searchParams.get('sort') || 'Featured'
    });

    const [sortOption, setSortOption] = useState(filters.sort);

    // Lấy danh mục và thương hiệu
    useEffect(() => {
        const fetchFilterData = async () => {
            try {
                const [categoriesData, brandsData] = await Promise.all([
                    categoryService.getAllCategories(),
                    brandService.getAllBrands()
                ]);
                setCategories(categoriesData || []);
                setBrands(brandsData || []);
            } catch (error) {
                console.error('Lỗi khi lấy danh mục và thương hiệu:', error);
            }
        };
        fetchFilterData();
    }, []);

    // Tìm kiếm sản phẩm
    useEffect(() => {
        const performSearch = async () => {
            try {
                setLoading(true);
                setError(null);

                const result = await searchService.searchProducts({
                    ...filters,
                    sort: sortOption
                });

                if (result.success) {
                    setProducts(result.data);
                } else {
                    setError(result.error || 'Không thể tìm kiếm sản phẩm');
                }
            } catch (err) {
                console.error('Lỗi tìm kiếm:', err);
                setError(err.message || 'Đã có lỗi xảy ra');
            } finally {
                setLoading(false);
            }
        };

        performSearch();
    }, [filters, sortOption]);

    // Cập nhật tham số URL khi filter thay đổi
    const updateFilters = (newFilters) => {
        setFilters(newFilters);
        const params = new URLSearchParams();
        
        if (newFilters.keyword) params.set('q', newFilters.keyword);
        if (newFilters.categoryId) params.set('category', newFilters.categoryId);
        if (newFilters.brandId) params.set('brand', newFilters.brandId);
        if (newFilters.minPrice) params.set('minPrice', newFilters.minPrice);
        if (newFilters.maxPrice) params.set('maxPrice', newFilters.maxPrice);
        if (sortOption) params.set('sort', sortOption);

        navigate(`/search?${params.toString()}`, { replace: true });
    };

    // Xử lý thay đổi checkbox danh mục
    const handleCategoryChange = (e) => {
        const categoryId = e.target.value;
        updateFilters({
            ...filters,
            categoryId: filters.categoryId === categoryId ? '' : categoryId
        });
    };

    // Xử lý thay đổi checkbox thương hiệu
    const handleBrandChange = (e) => {
        const brandId = e.target.value;
        updateFilters({
            ...filters,
            brandId: filters.brandId === brandId ? '' : brandId
        });
    };

    // Xử lý thay đổi khoảng giá
    const handlePriceChange = (min, max) => {
        updateFilters({
            ...filters,
            minPrice: min,
            maxPrice: max
        });
    };

    // Xử lý xóa tất cả filter
    const handleClearFilters = () => {
        setFilters({
            keyword: searchParams.get('q') || '',
            categoryId: '',
            brandId: '',
            minPrice: '',
            maxPrice: '',
            sort: 'Featured'
        });
        setSortOption('Featured');
        navigate('/search?q=' + (searchParams.get('q') || ''), { replace: true });
    };

    // Lưu lịch tìm kiếm vào localStorage
    const saveSearchHistory = (keyword) => {
        if (keyword.trim()) {
            const history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
            const newHistory = [keyword, ...history.filter(item => item !== keyword)].slice(0, 10);
            localStorage.setItem('searchHistory', JSON.stringify(newHistory));
        }
    };

    useEffect(() => {
        if (filters.keyword) {
            saveSearchHistory(filters.keyword);
        }
    }, [filters.keyword]);

    return (
        <main className="search-results-page">
            <div className="page-header">
                <div className="header-info">
                    <h1 className="page-title">
                        Kết quả tìm kiếm
                        {filters.keyword && <span className="search-keyword">"{filters.keyword}"</span>}
                    </h1>
                    <p className="result-count">
                        Tìm thấy <strong>{products.length}</strong> sản phẩm
                    </p>
                </div>

                <div className="header-actions">
                    <div className="select-wrapper">
                        <select 
                            className="sort-select" 
                            value={sortOption}
                            onChange={(e) => setSortOption(e.target.value)}
                        >
                            <option value="Featured">Sắp xếp: Nổi bật</option>
                            <option value="Newest">Sắp xếp: Mới nhất</option>
                            <option value="PriceHighLow">Giá: Từ cao đến thấp</option>
                            <option value="PriceLowHigh">Giá: Từ thấp đến cao</option>
                        </select>
                        <span className="material-symbols-outlined select-icon">expand_more</span>
                    </div>
                </div>
            </div>

            <div className="page-content">
                {/* SIDEBAR BỘ LỌC TÌM KIẾM */}
                <aside className="sidebar">
                    <div className="filter-header">
                        <h3>BỘ LỌC</h3>
                        <button className="clear-all-btn" onClick={handleClearFilters}>
                            Xóa tất cả
                        </button>
                    </div>

                    {/* Lọc theo Danh mục */}
                    <div className="filter-group">
                        <h3 className="filter-title">Danh mục</h3>
                        <div className="filter-list">
                            {categories.map(category => (
                                <label key={category.id} className="filter-checkbox">
                                    <input 
                                        type="checkbox"
                                        value={category.id}
                                        checked={filters.categoryId == category.id}
                                        onChange={handleCategoryChange}
                                    />
                                    <span>{category.name}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Lọc theo Thương hiệu */}
                    <div className="filter-group">
                        <h3 className="filter-title">Thương hiệu</h3>
                        <div className="filter-list">
                            {brands.map(brand => (
                                <label key={brand.id} className="filter-checkbox">
                                    <input 
                                        type="checkbox"
                                        value={brand.id}
                                        checked={filters.brandId == brand.id}
                                        onChange={handleBrandChange}
                                    />
                                    <span>{brand.name}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Lọc theo Khoảng giá */}
                    <div className="filter-group">
                        <h3 className="filter-title">Mức giá</h3>
                        <div className="filter-list">
                            <label className="filter-checkbox">
                                <input 
                                    type="radio"
                                    name="price"
                                    checked={filters.minPrice === '' && filters.maxPrice === ''}
                                    onChange={() => handlePriceChange('', '')}
                                />
                                <span>Tất cả giá</span>
                            </label>
                            <label className="filter-checkbox">
                                <input 
                                    type="radio"
                                    name="price"
                                    checked={filters.minPrice === '' && filters.maxPrice === 1000000}
                                    onChange={() => handlePriceChange('', 1000000)}
                                />
                                <span>Dưới 1.000.000 ₫</span>
                            </label>
                            <label className="filter-checkbox">
                                <input 
                                    type="radio"
                                    name="price"
                                    checked={filters.minPrice === 1000000 && filters.maxPrice === 3000000}
                                    onChange={() => handlePriceChange(1000000, 3000000)}
                                />
                                <span>1.000.000 ₫ - 3.000.000 ₫</span>
                            </label>
                            <label className="filter-checkbox">
                                <input 
                                    type="radio"
                                    name="price"
                                    checked={filters.minPrice === 3000000 && filters.maxPrice === ''}
                                    onChange={() => handlePriceChange(3000000, '')}
                                />
                                <span>Trên 3.000.000 ₫</span>
                            </label>
                        </div>
                    </div>
                </aside>

                {/* DANH SÁCH SẢN PHẨM */}
                <section className="products-section">
                    {loading && (
                        <div className="loading-message">
                            <span className="material-symbols-outlined">hourglass_empty</span>
                            <p>Đang tìm kiếm sản phẩm...</p>
                        </div>
                    )}

                    {error && (
                        <div className="error-message">
                            <span className="material-symbols-outlined">error</span>
                            <p>{error}</p>
                        </div>
                    )}

                    {!loading && products.length === 0 && (
                        <div className="no-results">
                            <span className="material-symbols-outlined">search_off</span>
                            <h3>Không tìm thấy sản phẩm</h3>
                            <p>
                                {filters.keyword 
                                    ? `Không có sản phẩm nào khớp với "${filters.keyword}"`
                                    : 'Vui lòng thử lại với từ khóa khác'
                                }
                            </p>
                        </div>
                    )}

                    {!loading && products.length > 0 && (
                        <div className="products-grid">
                            {products.map(product => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}

export default SearchResults;
