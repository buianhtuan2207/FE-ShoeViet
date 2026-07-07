import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import brandService from '../../services/BrandService';
import categoryService from '../../services/CategoryService';
import searchService from '../../services/SearchService';
import CartService from '../../services/CartService';
import { useFavorites } from '../../context/FavoriteContext';

import styles from './Header.module.scss';

function Header() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const { likedProductIds, clearAllFavorites } = useFavorites();

    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);

    const [searchInput, setSearchInput] = useState('');
    const [searchSuggestions, setSearchSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [searchHistory, setSearchHistory] = useState([]);
    const searchInputRef = useRef(null);
    const suggestionsRef = useRef(null);

    const [cartCount, setCartCount] = useState(0);

    useEffect(() => {
        const updateCartCount = () => {
            const items = CartService.getCart ? CartService.getCart() : (JSON.parse(localStorage.getItem('cart')) || []);
            const total = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
            setCartCount(total);
        };

        updateCartCount();

        window.addEventListener('cartChange', updateCartCount);
        window.addEventListener('storage', updateCartCount);

        return () => {
            window.removeEventListener('cartChange', updateCartCount);
            window.removeEventListener('storage', updateCartCount);
        };
    }, []);

    useEffect(() => {
        const fetchMenuData = async () => {
            try {
                const [categoriesData, brandsData] = await Promise.all([
                    categoryService.getAllCategories(),
                    brandService.getAllBrands()
                ]);
                setCategories(categoriesData || []);
                setBrands(brandsData || []);
            } catch (error) {
                console.error("Lỗi khi lấy dữ liệu cấu trúc menu công khai:", error);
            }
        };
        fetchMenuData();
    }, []);

    useEffect(() => {
        const checkUserData = () => {
            const token = localStorage.getItem('accessToken');
            const userInfo = localStorage.getItem('userInfo');

            if (token && userInfo) {
                try {
                    const decoded = jwtDecode(token);
                    const currentTime = Date.now() / 1000;

                    if (decoded.exp < currentTime) {
                        console.warn("Token ở Header đã hết hạn! Tự động xóa trạng thái đăng nhập...");
                        localStorage.removeItem('accessToken');
                        localStorage.removeItem('userInfo');
                        setUser(null);
                    } else {
                        setUser(JSON.parse(userInfo));
                    }
                } catch (error) {
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('userInfo');
                    setUser(null);
                }
            } else {
                setUser(null);
            }
        };

        checkUserData();
        window.addEventListener('authChange', checkUserData);
        return () => {
            window.removeEventListener('authChange', checkUserData);
        };
    }, []);

    useEffect(() => {
        const history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
        setSearchHistory(history.slice(0, 5));
    }, []);

    useEffect(() => {
        const debounceTimer = setTimeout(async () => {
            if (searchInput.trim().length >= 2) {
                try {
                    const suggestions = await searchService.getSearchSuggestions(searchInput);
                    setSearchSuggestions(suggestions);
                    setShowSuggestions(true);
                } catch (error) {
                    console.error('Lỗi khi lấy gợi ý tìm kiếm:', error);
                }
            } else {
                setSearchSuggestions([]);
                if (searchInput.trim().length === 0 && searchHistory.length > 0) {
                    setShowSuggestions(true);
                } else {
                    setShowSuggestions(false);
                }
            }
        }, 300);

        return () => clearTimeout(debounceTimer);
    }, [searchInput, searchHistory]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                suggestionsRef.current &&
                !suggestionsRef.current.contains(event.target) &&
                searchInputRef.current &&
                !searchInputRef.current.contains(event.target)
            ) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearchChange = (e) => {
        setSearchInput(e.target.value);
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchInput.trim()) {
            const history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
            const newHistory = [searchInput, ...history.filter(item => item !== searchInput)].slice(0, 10);
            localStorage.setItem('searchHistory', JSON.stringify(newHistory));

            navigate(`/search?q=${encodeURIComponent(searchInput)}`);
            setSearchInput('');
            setShowSuggestions(false);
        }
    };

    const handleSuggestionClick = (suggestion) => {
        if (suggestion.type === 'product') {
            navigate(`/detail/${suggestion.id}`);
        } else {
            setSearchInput(suggestion.name);
            setShowSuggestions(false);
        }
    };

    const handleHistoryClick = (historyItem) => {
        navigate(`/search?q=${encodeURIComponent(historyItem)}`);
        setSearchInput('');
        setShowSuggestions(false);
    };

    const getInitials = (name) => {
        if (!name) return '';
        const words = name.trim().split(/\s+/);
        if (words.length === 1) return words[0].charAt(0).toUpperCase();
        return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
    };

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('userInfo');
        localStorage.clear();
        clearAllFavorites();
        setUser(null);
        window.dispatchEvent(new Event('authChange'));
        window.location.href = '/login';
    };

    return (
        <nav className={styles['header-nav']}>
            <div className={styles['header-container']}>

                <Link className={styles['header-logo']} to="/">
                    SHOEVIET
                </Link>

                <div className={styles['header-links']}>
                    <Link className={styles['nav-link']} to="/about">Giới thiệu</Link>

                    <div className={styles['nav-item-dropdown']}>
                        <Link to="/product" className={`${styles['nav-link']} ${styles['dynamic-toggle']}`}>
                            Sản phẩm
                            <span className={`material-symbols-outlined ${styles['dropdown-arrow']}`}>expand_more</span>
                        </Link>

                        <div className={styles['mega-menu']}>
                            <div className={styles['mega-column']}>
                                <h4 className={styles['mega-title']}>Danh mục</h4>
                                {categories.slice(0, 6).map((cat) => (
                                    <Link key={cat.id} to={`/product?categoryId=${cat.id}`} className={styles['mega-item']}>
                                        {cat.name}
                                    </Link>
                                ))}
                            </div>

                            <div className={styles['mega-column']}>
                                <h4 className={styles['mega-title']}>Thương hiệu</h4>
                                {brands.slice(0, 6).map((brand) => (
                                    <Link key={brand.id} to={`/product?brandId=${brand.id}`} className={styles['mega-item']}>
                                        {brand.name}
                                    </Link>
                                ))}
                            </div>

                            <div className={styles['mega-column']}>
                                <h4 className={styles['mega-title']}>Xu hướng</h4>
                                <Link to="/product?sortBy=Newest" className={`${styles['mega-item']} ${styles['highlight-new']}`}>
                                    <span className={`${styles['badge-dot']} ${styles.new}`}></span> Hàng mới về
                                </Link>
                                <Link to="/product?category=promotion" className={`${styles['mega-item']} ${styles['highlight-promo']}`}>
                                    <span className={`${styles['badge-dot']} ${styles.promo}`}></span> Khuyến mãi hot
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles['search-container']}>
                    <form onSubmit={handleSearchSubmit} className={styles['search-form']}>
                        <span className={`material-symbols-outlined ${styles['search-icon']}`}>search</span>
                        <input
                            ref={searchInputRef}
                            type="text"
                            className={styles['search-input']}
                            placeholder="Tìm kiếm giày..."
                            value={searchInput}
                            onChange={handleSearchChange}
                            onFocus={() => {
                                if (searchInput.trim().length === 0 && searchHistory.length > 0) {
                                    setShowSuggestions(true);
                                } else if (searchInput.trim().length >= 2) {
                                    setShowSuggestions(true);
                                }
                            }}
                        />
                    </form>

                    {showSuggestions && (
                        <div ref={suggestionsRef} className={styles['search-suggestions']}>
                            {searchInput.trim().length > 0 && searchSuggestions.length > 0 && (
                                <>
                                    <div className={styles['suggestion-section']}>
                                        <span className={styles['suggestion-label']}>Sản phẩm</span>
                                        {searchSuggestions.map((suggestion) => (
                                            <div
                                                key={suggestion.id}
                                                className={styles['suggestion-item']}
                                                onClick={() => handleSuggestionClick(suggestion)}
                                            >
                                                <span className="material-symbols-outlined">search</span>
                                                <span className={styles['suggestion-text']}>{suggestion.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}

                            {searchInput.trim().length === 0 && searchHistory.length > 0 && (
                                <div className={styles['suggestion-section']}>
                                    <span className={styles['suggestion-label']}>Lịch sử tìm kiếm</span>
                                    {searchHistory.map((item, index) => (
                                        <div
                                            key={index}
                                            className={styles['suggestion-item']}
                                            onClick={() => handleHistoryClick(item)}
                                        >
                                            <span className="material-symbols-outlined">history</span>
                                            <span className={styles['suggestion-text']}>{item}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {searchInput.trim().length > 0 && searchSuggestions.length === 0 && (
                                <div className={styles['suggestion-section']}>
                                    <div className={styles['no-suggestions']}>
                                        <span className="material-symbols-outlined">search_off</span>
                                        <span>Không tìm thấy sản phẩm phù hợp</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className={styles['header-icons']}>
                    <Link to="/cart" className={`${styles['action-button']} ${styles['cart-header-btn']}`}>
                        <span className="material-symbols-outlined">shopping_cart</span>
                        {cartCount > 0 && (
                            <span className={styles['cart-badge']}>{cartCount}</span>
                        )}
                    </Link>
                    <Link to="/favorite" className={`${styles['action-button']} ${styles['favorite-header-btn']}`}>
                        <span className="material-symbols-outlined">
                            {likedProductIds.length > 0 ? 'favorite' : 'favorite_border'}
                        </span>
                        {likedProductIds.length > 0 && (
                            <span className={styles['favorite-badge']}>{likedProductIds.length}</span>
                        )}
                    </Link>

                    {user ? (
                        <div className={styles['profile-menu-container']}>
                            <div className={styles['user-avatar-wrapper']}>
                                <div className={styles['user-avatar']}>
                                    {getInitials(user.fullName)}
                                </div>
                                <span className={styles['user-fullname']}>{user.fullName}</span>
                            </div>

                            <div className={styles['dropdown-menu']}>
                                {user.role === 'admin' && (
                                    <Link to="/admin" className={styles['dropdown-item']} style={{ color: '#2563eb' }}>
                                        <span className="material-symbols-outlined" style={{ color: '#2563eb' }}>dashboard</span>
                                        Trang quản trị Admin
                                    </Link>
                                )}
                                <Link to="/my-profile" className={styles['dropdown-item']}>
                                    <span className="material-symbols-outlined">account_circle</span>
                                    Thông tin tài khoản
                                </Link>
                                <Link to="/history" className={styles['dropdown-item']}>
                                    <span className="material-symbols-outlined">history</span>
                                    Lịch sử mua hàng
                                </Link>
                                <button onClick={handleLogout} className={`${styles['dropdown-item']} ${styles['logout-btn']}`}>
                                    <span className="material-symbols-outlined">logout</span>
                                    Đăng xuất
                                </button>
                            </div>
                        </div>
                    ) : (
                        <Link to="/login" className={styles['action-button']}>
                            <span className="material-symbols-outlined">person</span>
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
}

export default Header;