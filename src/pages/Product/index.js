import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../../components/ProductCard';
import productService from '../../services/ProductService';
import brandService from '../../services/BrandService';
import categoryService from '../../services/CategoryService';
import './Product.scss';

function ProductPage() {
    // --- HOOK QUẢN LÝ URL QUERY PARAMETERS ---
    const [searchParams, setSearchParams] = useSearchParams();

    // --- STATE QUẢN LÝ DỮ LIỆU GỐC TỪ API ---
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- STATE QUẢN LÝ BỘ LỌC ĐANG TÍCH CHỌN ---
    const [selectedBrands, setSelectedBrands] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [selectedPriceRange, setSelectedPriceRange] = useState('All');
    const [sortBy, setSortBy] = useState('Featured');

    // 1. EFFECT 1: Tải dữ liệu ban đầu từ Spring Boot API
    useEffect(() => {
        const initData = async () => {
            try {
                setLoading(true);
                const [productsData, categoriesData, brandsData] = await Promise.all([
                    productService.getAllProducts(),
                    categoryService.getAllCategories(),
                    brandService.getAllBrands()
                ]);

                // Nhật ký kiểm tra dữ liệu thô từ Backend
                console.log("--- 1. DỮ LIỆU THÔ TỪ BACKEND ---");
                console.log("Danh sách Sản phẩm:", productsData);
                console.log("Danh sách Danh mục:", categoriesData);
                console.log("Danh sách Thương hiệu:", brandsData);

                setProducts(productsData || []);
                setCategories(categoriesData || []);
                setBrands(brandsData || []);
            } catch (err) {
                console.error("Lỗi khi kết nối API:", err);
                setError(err.message || 'Đã có lỗi xảy ra khi tải dữ liệu.');
            } finally {
                setLoading(false);
            }
        };
        initData();
    }, []);

    // 2. EFFECT 2: ĐỒNG BỘ URL ĐANG CÓ (?brandId=... hoặc ?categoryId=...) VÀO STATE SIDEBAR
    useEffect(() => {
        const brandIdFromUrl = searchParams.get('brandId');
        const catIdFromUrl = searchParams.get('categoryId');
        const sortByFromUrl = searchParams.get('sortBy');

        if (brandIdFromUrl) {
            setSelectedBrands([parseInt(brandIdFromUrl, 10)]);
        } else {
            setSelectedBrands([]);
        }

        if (catIdFromUrl) {
            setSelectedCategories([parseInt(catIdFromUrl, 10)]);
        } else {
            setSelectedCategories([]);
        }

        if (sortByFromUrl) {
            setSortBy(sortByFromUrl);
        } else {
            setSortBy('Featured');
        }
    }, [searchParams]);

    const handleSortChange = (e) => {
        const value = e.target.value;
        const nextParams = new URLSearchParams(searchParams);

        if (value === 'Featured') {
            nextParams.delete('sortBy'); // Nếu chọn mặc định thì xóa chữ trên URL cho sạch
        } else {
            nextParams.set('sortBy', value); // Nếu chọn cái khác thì thêm vào URL
        }
        setSearchParams(nextParams);
    };

    // --- CÁC HÀM SỰ KIỆN KHI NGƯỜI DÙNG TÍCH VÀO CHECKBOX Ở SIDEBAR ---
    const handleBrandCheckboxChange = (brandId) => {
        const nextParams = new URLSearchParams(searchParams);
        const idNum = parseInt(brandId, 10);

        if (selectedBrands.includes(idNum)) {
            nextParams.delete('brandId');
        } else {
            nextParams.set('brandId', idNum);
        }
        setSearchParams(nextParams);
    };

    const handleCategoryCheckboxChange = (catId) => {
        const nextParams = new URLSearchParams(searchParams);
        const idNum = parseInt(catId, 10);

        if (selectedCategories.includes(idNum)) {
            nextParams.delete('categoryId');
        } else {
            nextParams.set('categoryId', idNum);
        }
        setSearchParams(nextParams);
    };

    const handleClearAllFilters = () => {
        setSearchParams({});
        setSelectedPriceRange('All');
        setSortBy('Featured');
    };

    // --- BỘ LỌC DỮ LIỆU THỜI GIAN THỰC ---
    const filteredProducts = products.filter((product) => {

        // 1. LỌC THEO THƯƠNG HIỆU (Dựa trên brandName của sản phẩm)
        if (selectedBrands.length > 0) {
            // Chuyển đổi mảng ID đang tích chọn thành mảng các "Tên thương hiệu" viết thường
            const activeBrandNames = brands
                .filter(b => selectedBrands.map(Number).includes(Number(b.id)))
                .map(b => b.name.toLowerCase().trim());

            // Lấy tên thương hiệu của sản phẩm hiện tại
            const pBrandName = product.brandName ? product.brandName.toLowerCase().trim() : '';

            // Nếu tên thương hiệu sản phẩm không nằm trong danh sách đang tích chọn -> Loại bỏ
            if (!activeBrandNames.includes(pBrandName)) {
                return false;
            }
        }

        // 2. LỌC THEO DANH MỤC (Dựa trên categoryName của sản phẩm)
        if (selectedCategories.length > 0) {
            // Chuyển đổi mảng ID danh mục đang tích chọn thành mảng các "Tên danh mục" viết thường
            const activeCategoryNames = categories
                .filter(c => selectedCategories.map(Number).includes(Number(c.id)))
                .map(c => c.name.toLowerCase().trim());

            // Lấy tên danh mục của sản phẩm hiện tại
            const pCategoryName = product.categoryName ? product.categoryName.toLowerCase().trim() : '';

            // Nếu tên danh mục sản phẩm không nằm trong danh sách đang tích chọn -> Loại bỏ
            if (!activeCategoryNames.includes(pCategoryName)) {
                return false;
            }
        }

        // 3. LỌC THEO MỨC GIÁ (Giữ nguyên logic chuẩn)
        const productPrice = product.basePrice || product.price || 0;
        if (selectedPriceRange === 'under1m' && productPrice >= 1000000) return false;
        if (selectedPriceRange === '1m-3m' && (productPrice < 1000000 || productPrice > 3000000)) return false;
        if (selectedPriceRange === 'above3m' && productPrice <= 3000000) return false;

        return true;
    });

    // --- BỘ SẮP XẾP SẢN PHẨM (SORTING) ---
    const sortedProducts = [...filteredProducts].sort((a, b) => {
        const priceA = a.basePrice || a.price || 0;
        const priceB = b.basePrice || b.price || 0;

        if (sortBy === 'Newest') return b.id - a.id;
        if (sortBy === 'PriceLowHigh') return priceA - priceB;
        if (sortBy === 'PriceHighLow') return priceB - priceA;
        return 0;
    });

    return (
        <main className="product-page">
            <div className="page-header">
                <div className="header-info">
                    <h1 className="page-title">Bộ Sưu Tập Nổi Bật</h1>
                    <p className="page-desc">
                        Tối ưu cho tốc độ, thiết kế cho phong cách đường phố. Khám phá những mẫu giày hiệu năng mới nhất của chúng tôi.
                    </p>
                </div>

                <div className="header-actions">
                    <span className="result-count">Hiển thị {sortedProducts.length} sản phẩm</span>
                    <div className="select-wrapper">
                        <select className="sort-select" value={sortBy} onChange={handleSortChange}>
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
                {/* --- SIDEBAR BỘ LỌC ĐỘNG THỜI GIAN THỰC --- */}
                <aside className="sidebar">

                    {/* Lọc theo Thương hiệu */}
                    <div className="filter-group">
                        <h3 className="filter-title">Thương hiệu</h3>
                        <div className="filter-list">
                            {brands.map((brand) => (
                                <label className="filter-checkbox" key={brand.id}>
                                    <input
                                        type="checkbox"
                                        checked={selectedBrands.map(Number).includes(Number(brand.id))}
                                        onChange={() => handleBrandCheckboxChange(brand.id)}
                                    />
                                    <span>{brand.name}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Lọc theo Danh mục */}
                    <div className="filter-group">
                        <h3 className="filter-title">Danh mục</h3>
                        <div className="filter-list">
                            {categories.map((cat) => (
                                <label className="filter-checkbox" key={cat.id}>
                                    <input
                                        type="checkbox"
                                        checked={selectedCategories.map(Number).includes(Number(cat.id))}
                                        onChange={() => handleCategoryCheckboxChange(cat.id)}
                                    />
                                    <span>{cat.name}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Lọc theo Khoảng giá */}
                    <div className="filter-group">
                        <h3 className="filter-title">Mức giá</h3>
                        <div className="filter-list">
                            <label className="filter-checkbox">
                                <input type="radio" name="price" checked={selectedPriceRange === 'All'} onChange={() => setSelectedPriceRange('All')} />
                                <span>Tất cả mức giá</span>
                            </label>
                            <label className="filter-checkbox">
                                <input type="radio" name="price" checked={selectedPriceRange === 'under1m'} onChange={() => setSelectedPriceRange('under1m')} />
                                <span>Dưới 1.000.000 ₫</span>
                            </label>
                            <label className="filter-checkbox">
                                <input type="radio" name="price" checked={selectedPriceRange === '1m-3m'} onChange={() => setSelectedPriceRange('1m-3m')} />
                                <span>1.000.000 ₫ - 3.000.000 ₫</span>
                            </label>
                            <label className="filter-checkbox">
                                <input type="radio" name="price" checked={selectedPriceRange === 'above3m'} onChange={() => setSelectedPriceRange('above3m')} />
                                <span>Trên 3.000.000 ₫</span>
                            </label>
                        </div>
                    </div>

                    <button className="btn-clear-filter" onClick={handleClearAllFilters}>Xóa tất cả bộ lọc</button>
                </aside>

                {/* --- KHU VỰC HIỂN THỊ SẢN PHẨM --- */}
                <div className="product-list-container">
                    {loading && <div className="loading-state">Đang kết xuất sản phẩm...</div>}
                    {error && <div className="error-state">{error}</div>}

                    {!loading && !error && (
                        <div className="product-grid">
                            {sortedProducts.length === 0 ? (
                                <div className="empty-state">
                                    Không tìm thấy sản phẩm nào phù hợp với tiêu chí của bạn.
                                </div>
                            ) : (
                                sortedProducts.map((product) => (
                                    <ProductCard key={product.id} data={product} />
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}

export default ProductPage;