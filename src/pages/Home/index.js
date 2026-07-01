import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import ProductCard from '../../components/ProductCard';
import brandService from '../../services/BrandService';
import categoryService from '../../services/CategoryService';
import productService from '../../services/ProductService';
import styles from './Home.module.scss';

const TECH_FEATURES = [
    { icon: 'speed', title: 'Thân Giày Aero-Mesh', desc: 'Thoáng khí tối đa mà vẫn giữ được sự hỗ trợ ôm sát chân hoàn hảo.' },
    { icon: 'water_drop', title: 'Lõi Hydro-Shield', desc: 'Lớp chống chịu thời tiết giúp bạn thoải mái di chuyển trong mọi điều kiện.' },
];

const CategoryCard = ({ data }) => {
    const { id, name, description, isLarge, imageUrl } = data;

    const fallbackImg = isLarge
        ? 'https://images.unsplash.com/photo-1595950653106-6c9ebd614c3a?q=80&w=800&auto=format&fit=crop'
        : 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?q=80&w=800&auto=format&fit=crop';

    const img = imageUrl || fallbackImg;

    return (
        <Link to={`/products?category=${id}`} className={`${styles['category-card']} ${isLarge ? styles['category-card-large'] : ''}`}>
            <img src={img} alt={name} className={styles['category-img']} />
            <div className={styles['category-overlay']}>
                {isLarge ? (
                    <>
                        <h3 className={styles['category-title-large']}>{name}</h3>
                        <p className={styles['category-subtitle']}>{description}</p>
                    </>
                ) : (
                    <h3 className={styles['category-title-small']}>{name}</h3>
                )}
            </div>
        </Link>
    );
};

function Home() {
    const [brands, setBrands] = useState([]);
    const [categories, setCategories] = useState([]);
    const [latestProducts, setLatestProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const location = useLocation();

    useEffect(() => {
        const fetchHomeData = async () => {
            try {
                setLoading(true);

                const [brandsData, categoriesData, productsData] = await Promise.all([
                    brandService.getAllBrands().catch(() => []),
                    categoryService.getHomeCategories().catch(() => []),
                    productService.getAllProducts().catch(() => [])
                ]);

                if (brandsData && brandsData.length > 0) {
                    const activeBrands = brandsData.filter(brand => brand.is_action);
                    setBrands(activeBrands);
                }

                if (categoriesData && categoriesData.length > 0) {
                    const formattedCategories = categoriesData.map((cat, index) => ({
                        ...cat,
                        isLarge: index === 0
                    }));
                    setCategories(formattedCategories);
                }

                if (productsData && productsData.length > 0) {
                    setLatestProducts(productsData.slice(0, 4));
                }

            } catch (error) {
                console.error("Lỗi khi tải dữ liệu trang chủ:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchHomeData();
    }, [location.key]);

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '100px', fontSize: '20px' }}>Đang tải dữ liệu trang chủ...</div>;
    }

    return (
        <div className={styles['home-wrapper']}>
            <section className={styles['hero-section']}>
                <div className={styles['hero-bg-layer']}>
                    <img alt="Hero background" src="https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=2000&auto=format&fit=crop" className={styles['hero-bg-img']} />
                    <div className={styles['hero-bg-gradient']}></div>
                </div>

                <div className={styles['hero-content']}>
                    <h1 className={styles['hero-title']}>
                        Thiết Kế Dành Cho<br />Hiệu Suất.
                    </h1>
                    <p className={styles['hero-desc']}>
                        Khám phá đỉnh cao của thẩm mỹ thành thị. Bộ sưu tập Apex V2 mới đã ra mắt, định nghĩa lại mọi giới hạn trên đường phố.
                    </p>
                    <div className={styles['hero-actions']}>
                        <Link to="/product" className={styles['btn-primary']} style={{ display: 'inline-flex', textDecoration: 'none' }}>
                            <span className={styles['btn-text']}>Mua ngay</span>
                            <div className={styles['btn-primary-hover']}></div>
                        </Link>
                        <Link to="/about" className={styles['btn-secondary']} style={{ display: 'inline-flex', textDecoration: 'none' }}>
                            <span className={styles['btn-text']}>Khám phá</span>
                        </Link>
                    </div>
                </div>
            </section>

            {brands.length > 0 && (
                <section className={styles['brands-section']}>
                    <div className={`${styles.container} ${styles['center-text']}`}>
                        <h2 className={styles['section-subtitle']}>Được Tin Dùng Bởi Các Biểu Tượng Toàn Cầu</h2>
                        <div className={styles['brands-list']}>
                            {brands.map((brand) => (
                                <span key={brand.id} className={styles['brand-item']}>{brand.name.toUpperCase()}</span>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {categories.length > 0 && (
                <section className={styles['categories-section']}>
                    <div className={styles.container}>
                        <div className={styles['section-header']}>
                            <div>
                                <h2 className={styles['section-title']}>Danh Mục Giày</h2>
                                <p className={styles['section-desc']}>Khám phá các bộ sưu tập giày chuyên dụng của chúng tôi.</p>
                            </div>
                            <Link to="/products" className={styles['view-all-link']}>Xem Tất Cả</Link>
                        </div>
                        <div className={styles['categories-grid']}>
                            {categories.map(category => (
                                <CategoryCard key={category.id} data={category} />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            <section className={styles['products-section']}>
                <div className={styles.container}>
                    <div className={styles['section-header']}>
                        <div>
                            <h2 className={styles['section-title']}>Sản phẩm mới nhất</h2>
                            <p className={styles['section-desc']}>Tuyển chọn kỹ lưỡng những mẫu giày mới nhất từ chúng tôi.</p>
                        </div>
                        <Link to="/product" className={styles['view-all-link']}>Xem Tất Cả</Link>
                    </div>

                    {latestProducts.length > 0 ? (
                        <div className={styles['products-grid']}>
                            {latestProducts.map(product => (
                                <ProductCard key={product.id} data={product} />
                            ))}
                        </div>
                    ) : (
                        <p style={{ textAlign: 'center', marginTop: '20px' }}>Chưa có sản phẩm nào được hiển thị.</p>
                    )}
                </div>
            </section>

            <section className={styles['tech-section']}>
                <div className={styles.container}>
                    <div className={styles['tech-grid']}>
                        <div className={styles['tech-content']}>
                            <span className={`${styles['section-subtitle']} ${styles['block-subtitle']}`}>Đổi Mới</span>
                            <h2 className={`${styles['section-title']} ${styles['tech-title']}`}>Công Nghệ Không Trọng Lực.</h2>
                            <p className={`${styles['section-desc']} ${styles['tech-desc']}`}>
                                Lớp đệm đế giữa độc quyền của chúng tôi mang lại khả năng hoàn trả năng lượng chưa từng có mà vẫn duy trì tính ổn định của cấu trúc. Được thiết kế trong phòng thí nghiệm, kiểm chứng trên đường phố.
                            </p>

                            <div className={styles['tech-features-list']}>
                                {TECH_FEATURES.map((feature, index) => (
                                    <div key={index} className={styles['feature-item']}>
                                        <div className={styles['feature-icon-wrapper']}>
                                            <span className={`material-symbols-outlined ${styles['feature-icon']}`}>{feature.icon}</span>
                                        </div>
                                        <div>
                                            <h4 className={styles['feature-title']}>{feature.title}</h4>
                                            <p className={styles['feature-desc']}>{feature.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className={styles['tech-visual']}>
                            <div className={styles['tech-visual-bg']}></div>
                            <img alt="Công nghệ giày" src="https://images.unsplash.com/photo-1618354691438-25bc04584c23?q=80&w=1000&auto=format&fit=crop" className={styles['tech-img']} />
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default Home;