import React, { useState, useEffect } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import ProductCard from '../../components/ProductCard';
import productService from '../../services/ProductService';
import brandService from '../../services/BrandService';
import categoryService from '../../services/CategoryService';
import styles from './Product.module.scss';

function ProductPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const location = useLocation();

    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [selectedBrands, setSelectedBrands] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [selectedPriceRange, setSelectedPriceRange] = useState('All');
    const [sortBy, setSortBy] = useState('Featured');

    useEffect(() => {
        const initData = async () => {
            try {
                setLoading(true);
                const [productsData, categoriesData, brandsData] = await Promise.all([
                    productService.getAllProducts(),
                    categoryService.getAllCategories(),
                    brandService.getAllBrands()
                ]);

                setProducts(productsData || []);
                setCategories(categoriesData || []);
                setBrands(brandsData || []);
            } catch (err) {
                setError(err.message || 'Đã có lỗi xảy ra khi tải dữ liệu.');
            } finally {
                setLoading(false);
            }
        };
        initData();
    }, [location.key]);

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
            nextParams.delete('sortBy');
        } else {
            nextParams.set('sortBy', value);
        }
        setSearchParams(nextParams);
    };

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

    const filteredProducts = products.filter((product) => {
        if (selectedBrands.length > 0) {
            const activeBrandNames = brands
                .filter(b => selectedBrands.map(Number).includes(Number(b.id)))
                .map(b => b.name.toLowerCase().trim());

            const pBrandName = product.brandName ? product.brandName.toLowerCase().trim() : '';

            if (!activeBrandNames.includes(pBrandName)) {
                return false;
            }
        }

        if (selectedCategories.length > 0) {
            const activeCategoryNames = categories
                .filter(c => selectedCategories.map(Number).includes(Number(c.id)))
                .map(c => c.name.toLowerCase().trim());

            const pCategoryName = product.categoryName ? product.categoryName.toLowerCase().trim() : '';

            if (!activeCategoryNames.includes(pCategoryName)) {
                return false;
            }
        }

        const productPrice = product.basePrice || product.price || 0;
        if (selectedPriceRange === 'under1m' && productPrice >= 1000000) return false;
        if (selectedPriceRange === '1m-3m' && (productPrice < 1000000 || productPrice > 3000000)) return false;
        if (selectedPriceRange === 'above3m' && productPrice <= 3000000) return false;

        return true;
    });

    const sortedProducts = [...filteredProducts].sort((a, b) => {
        const priceA = a.basePrice || a.price || 0;
        const priceB = b.basePrice || b.price || 0;

        if (sortBy === 'Newest') return b.id - a.id;
        if (sortBy === 'PriceLowHigh') return priceA - priceB;
        if (sortBy === 'PriceHighLow') return priceB - priceA;
        return 0;
    });

    return (
        <main className={styles['product-page']}>
            <div className={styles['page-header']}>
                <div className={styles['header-info']}>
                    <h1 className={styles['page-title']}>Bộ Sưu Tập Nổi Bật</h1>
                    <p className={styles['page-desc']}>
                        Tối ưu cho tốc độ, thiết kế cho phong cách đường phố. Khám phá những mẫu giày hiệu năng mới nhất của chúng tôi.
                    </p>
                </div>

                <div className={styles['header-actions']}>
                    <span className={styles['result-count']}>Hiển thị {sortedProducts.length} sản phẩm</span>
                    <div className={styles['select-wrapper']}>
                        <select className={styles['sort-select']} value={sortBy} onChange={handleSortChange}>
                            <option value="Featured">Sắp xếp: Nổi bật</option>
                            <option value="Newest">Sắp xếp: Mới nhất</option>
                            <option value="PriceHighLow">Giá: Từ cao đến thấp</option>
                            <option value="PriceLowHigh">Giá: Từ thấp đến cao</option>
                        </select>
                        <span className={`material-symbols-outlined ${styles['select-icon']}`}>expand_more</span>
                    </div>
                </div>
            </div>

            <div className={styles['page-content']}>
                <aside className={styles['sidebar']}>
                    <div className={styles['filter-group']}>
                        <h3 className={styles['filter-title']}>Thương hiệu</h3>
                        <div className={styles['filter-list']}>
                            {brands.map((brand) => (
                                <label className={styles['filter-checkbox']} key={brand.id}>
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

                    <div className={styles['filter-group']}>
                        <h3 className={styles['filter-title']}>Danh mục</h3>
                        <div className={styles['filter-list']}>
                            {categories.map((cat) => (
                                <label className={styles['filter-checkbox']} key={cat.id}>
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

                    <div className={styles['filter-group']}>
                        <h3 className={styles['filter-title']}>Mức giá</h3>
                        <div className={styles['filter-list']}>
                            <label className={styles['filter-checkbox']}>
                                <input type="radio" name="price" checked={selectedPriceRange === 'All'} onChange={() => setSelectedPriceRange('All')} />
                                <span>Tất cả mức giá</span>
                            </label>
                            <label className={styles['filter-checkbox']}>
                                <input type="radio" name="price" checked={selectedPriceRange === 'under1m'} onChange={() => setSelectedPriceRange('under1m')} />
                                <span>Dưới 1.000.000 ₫</span>
                            </label>
                            <label className={styles['filter-checkbox']}>
                                <input type="radio" name="price" checked={selectedPriceRange === '1m-3m'} onChange={() => setSelectedPriceRange('1m-3m')} />
                                <span>1.000.000 ₫ - 3.000.000 ₫</span>
                            </label>
                            <label className={styles['filter-checkbox']}>
                                <input type="radio" name="price" checked={selectedPriceRange === 'above3m'} onChange={() => setSelectedPriceRange('above3m')} />
                                <span>Trên 3.000.000 ₫</span>
                            </label>
                        </div>
                    </div>

                    <button className={styles['btn-clear-filter']} onClick={handleClearAllFilters}>Xóa tất cả bộ lọc</button>
                </aside>

                <div className={styles['product-list-container']}>
                    {loading && <div className={styles['loading-state']}>Đang kết xuất sản phẩm...</div>}
                    {error && <div className={styles['error-state']}>{error}</div>}

                    {!loading && !error && (
                        <div className={styles['product-grid']}>
                            {sortedProducts.length === 0 ? (
                                <div className={styles['empty-state']}>
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