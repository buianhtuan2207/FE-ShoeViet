import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../../components/ProductCard';
import brandService from '../../services/BrandService';
import categoryService from '../../services/CategoryService';
import productService from '../../services/ProductService';
import './Home.css';

const TECH_FEATURES = [
    { icon: 'speed', title: 'Thân Giày Aero-Mesh', desc: 'Thoáng khí tối đa mà vẫn giữ được sự hỗ trợ ôm sát chân hoàn hảo.' },
    { icon: 'water_drop', title: 'Lõi Hydro-Shield', desc: 'Lớp chống chịu thời tiết giúp bạn thoải mái di chuyển trong mọi điều kiện.' },
];

// Component con hiển thị Danh mục
const CategoryCard = ({ data }) => {
    // Đọc các trường dữ liệu thực tế từ DB (name, description thay vì title, subtitle)
    const { id, name, description, isLarge } = data;

    // Gán ảnh mặc định nếu trong DB chưa có cột lưu link ảnh
    const fallbackImg = isLarge
        ? 'https://images.unsplash.com/photo-1595950653106-6c9ebd614c3a?q=80&w=800&auto=format&fit=crop'
        : 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?q=80&w=800&auto=format&fit=crop';

    // Giả sử sau này DB bạn có trường imageUrl, ta có thể dùng: const img = data.imageUrl || fallbackImg;
    const img = fallbackImg;

    return (
        <Link to={`/products?category=${id}`} className={`category-card ${isLarge ? 'category-card-large' : ''}`}>
            <img src={img} alt={name} className="category-img" />
            <div className="category-overlay">
                {isLarge ? (
                    <>
                        <h3 className="category-title-large">{name}</h3>
                        <p className="category-subtitle">{description}</p>
                    </>
                ) : (
                    <h3 className="category-title-small">{name}</h3>
                )}
            </div>
        </Link>
    );
};

function Home() {
    // 1. Khởi tạo State để lưu trữ dữ liệu từ API
    const [brands, setBrands] = useState([]);
    const [categories, setCategories] = useState([]);
    const [latestProducts, setLatestProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    // 2. Gọi API ngay khi Component vừa được mount lên giao diện
    useEffect(() => {
        const fetchHomeData = async () => {
            try {
                setLoading(true);

                // Gọi song song cả 3 API cùng lúc để tối ưu tốc độ load
                const [brandsData, categoriesData, productsData] = await Promise.all([
                    brandService.getAllBrands(),
                    categoryService.getAllCategories(),
                    productService.getAllProducts()
                ]);

                setBrands(brandsData);

                // Xử lý Categories: Chỉ lấy 3 danh mục đầu tiên và đánh dấu cái đầu tiên là "isLarge"
                if (categoriesData && categoriesData.length > 0) {
                    const formattedCategories = categoriesData.slice(0, 3).map((cat, index) => ({
                        ...cat,
                        isLarge: index === 0
                    }));
                    setCategories(formattedCategories);
                }

                // Xử lý Products: Lấy 4 sản phẩm mới nhất
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
    }, []);

    // Hiển thị màn hình chờ trong lúc đợi API trả kết quả
    if (loading) {
        return <div style={{ textAlign: 'center', padding: '100px', fontSize: '20px' }}>Đang tải dữ liệu trang chủ...</div>;
    }

    return (
        <div className="home-wrapper">
            {/* HERO SECTION */}
            <section className="hero-section">
                <div className="hero-bg-layer">
                    <img alt="Hero background" src="https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=2000&auto=format&fit=crop" className="hero-bg-img" />
                    <div className="hero-bg-gradient"></div>
                </div>

                <div className="hero-content">
                    <h1 className="hero-title">
                        Thiết Kế Dành Cho<br />Hiệu Suất.
                    </h1>
                    <p className="hero-desc">
                        Khám phá đỉnh cao của thẩm mỹ thành thị. Bộ sưu tập Apex V2 mới đã ra mắt, định nghĩa lại mọi giới hạn trên đường phố.
                    </p>
                    <div className="hero-actions">
                        <Link to="/products" className="btn-primary" style={{ display: 'inline-flex', textDecoration: 'none' }}>
                            <span className="btn-text">Mua ngay</span>
                            <div className="btn-primary-hover"></div>
                        </Link>
                        <Link to="/categories" className="btn-secondary" style={{ display: 'inline-flex', textDecoration: 'none' }}>
                            <span className="btn-text">Khám phá</span>
                        </Link>
                    </div>
                </div>
            </section>

            {/* BRANDS SECTION - Dữ liệu thực từ API */}
            {brands.length > 0 && (
                <section className="brands-section">
                    <div className="container center-text">
                        <h2 className="section-subtitle">Được Tin Dùng Bởi Các Biểu Tượng Toàn Cầu</h2>
                        <div className="brands-list">
                            {brands.map((brand) => (
                                <span key={brand.id} className="brand-item">{brand.name.toUpperCase()}</span>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* CATEGORIES SECTION - Dữ liệu thực từ API */}
            {categories.length > 0 && (
                <section className="categories-section">
                    <div className="container">
                        <div className="section-header">
                            <div>
                                <h2 className="section-title">Danh Mục Giày</h2>
                                <p className="section-desc">Khám phá các bộ sưu tập giày chuyên dụng của chúng tôi.</p>
                            </div>
                            <Link to="/products" className="view-all-link">Xem Tất Cả</Link>
                        </div>
                        <div className="categories-grid">
                            {categories.map(category => (
                                <CategoryCard key={category.id} data={category} />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* LATEST PRODUCTS SECTION */}
            <section className="products-section">
                <div className="container">
                    <div className="section-header">
                        <div>
                            <h2 className="section-title">Sản phẩm mới nhất</h2>
                            <p className="section-desc">Tuyển chọn kỹ lưỡng những mẫu giày mới nhất từ chúng tôi.</p>
                        </div>
                        <Link to="/product" className="view-all-link">Xem Tất Cả</Link>
                    </div>

                    {latestProducts.length > 0 ? (
                        <div className="products-grid">
                            {/* CODE MỚI RẤT GỌN Ở ĐÂY */}
                            {latestProducts.map(product => (
                                <ProductCard key={product.id} data={product} />
                            ))}
                        </div>
                    ) : (
                        <p style={{ textAlign: 'center', marginTop: '20px' }}>Chưa có sản phẩm nào được hiển thị.</p>
                    )}
                </div>
            </section>

            {/* TECHNOLOGY SECTION */}
            <section className="tech-section">
                <div className="container">
                    <div className="tech-grid">
                        <div className="tech-content">
                            <span className="section-subtitle block-subtitle">Đổi Mới</span>
                            <h2 className="section-title tech-title">Công Nghệ Không Trọng Lực.</h2>
                            <p className="section-desc tech-desc">
                                Lớp đệm đế giữa độc quyền của chúng tôi mang lại khả năng hoàn trả năng lượng chưa từng có mà vẫn duy trì tính ổn định của cấu trúc. Được thiết kế trong phòng thí nghiệm, kiểm chứng trên đường phố.
                            </p>

                            <div className="tech-features-list">
                                {TECH_FEATURES.map((feature, index) => (
                                    <div key={index} className="feature-item">
                                        <div className="feature-icon-wrapper">
                                            <span className="material-symbols-outlined feature-icon">{feature.icon}</span>
                                        </div>
                                        <div>
                                            <h4 className="feature-title">{feature.title}</h4>
                                            <p className="feature-desc">{feature.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="tech-visual">
                            <div className="tech-visual-bg"></div>
                            <img alt="Công nghệ giày" src="https://images.unsplash.com/photo-1618354691438-25bc04584c23?q=80&w=1000&auto=format&fit=crop" className="tech-img" />
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default Home;