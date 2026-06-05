import React, { useState, useEffect, useRef } from 'react';
import './Header.css';
import { Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import brandService from '../../services/BrandService';
import categoryService from '../../services/CategoryService';
import searchService from '../../services/SearchService';

function Header() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    // Khai báo thêm State để lưu dữ liệu Menu từ API
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);

    // State cho tìm kiếm
    const [searchInput, setSearchInput] = useState('');
    const [searchSuggestions, setSearchSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [searchHistory, setSearchHistory] = useState([]);
    const searchInputRef = useRef(null);
    const suggestionsRef = useRef(null);

    //EFFECT 1: Lấy danh sách Categories và Brands từ API (Chỉ chạy 1 lần khi load trang)
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

    // 2. EFFECT 2: Kiểm tra trạng thái đăng nhập và hạn Token (Giữ nguyên logic chuẩn của bạn)
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

    //Load lịch tìm kiếm từ localStorage
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

    // Xử lý click outside
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
            // Lưu vào lịch tìm kiếm
            const history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
            const newHistory = [searchInput, ...history.filter(item => item !== searchInput)].slice(0, 10);
            localStorage.setItem('searchHistory', JSON.stringify(newHistory));

            // Điều hướng đến trang tìm kiếm
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
        setUser(null);
        window.dispatchEvent(new Event('authChange'));
        navigate('/login');
    };

    return (
        <nav className="header-nav">
            <div className="header-container">

                {/* 1. Logo */}
                <Link className="header-logo" to="/">
                    SHOEVIET
                </Link>

                {/* 2. Menu Links (Đã sửa đổi thành cấu trúc Dropdown đa cột) */}
                <div className="header-links">
                    <Link className="nav-link" to="/">Trang chủ</Link>

                    {/* KHỐI DROPDOWN SẢN PHẨM MỚI */}
                    <div className="nav-item-dropdown">
                        <Link to="/product" className="nav-link dynamic-toggle">
                            Sản phẩm
                            <span className="material-symbols-outlined dropdown-arrow">expand_more</span>
                        </Link>

                        {/* Khung chứa các cột phân loại */}
                        <div className="mega-menu">
                            {/* Cột 1: Danh mục lấy từ API */}
                            <div className="mega-column">
                                <h4 className="mega-title">Danh mục</h4>
                                {categories.slice(0, 6).map((cat) => (
                                    <Link key={cat.id} to={`/products?category=${cat.id}`} className="mega-item">
                                        {cat.name}
                                    </Link>
                                ))}
                            </div>

                            {/* Cột 2: Thương hiệu lấy từ API */}
                            <div className="mega-column">
                                <h4 className="mega-title">Thương hiệu</h4>
                                {brands.slice(0, 6).map((brand) => (
                                    <Link key={brand.id} to={`/products?brand=${brand.id}`} className="mega-item">
                                        {brand.name}
                                    </Link>
                                ))}
                            </div>

                            {/* Cột 3: Bộ sưu tập & Ưu đãi */}
                            <div className="mega-column">
                                <h4 className="mega-title">Xu hướng</h4>
                                <Link to="/products?sort=Newest" className="mega-item highlight-new">
                                    <span className="badge-dot new"></span> Hàng mới về
                                </Link>
                                <Link to="/products?category=promotion" className="mega-item highlight-promo">
                                    <span className="badge-dot promo"></span> Khuyến mãi hot
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Thanh tìm kiếm */}
                <div className="search-container">
                    <form onSubmit={handleSearchSubmit} className="search-form">
                        <span className="material-symbols-outlined search-icon">search</span>
                        <input
                            ref={searchInputRef}
                            type="text"
                            className="search-input"
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

                    {/* Dropdown gợi ý tìm kiếm */}
                    {showSuggestions && (
                        <div ref={suggestionsRef} className="search-suggestions">
                            {searchInput.trim().length > 0 && searchSuggestions.length > 0 && (
                                <>
                                    <div className="suggestion-section">
                                        <span className="suggestion-label">Sản phẩm</span>
                                        {searchSuggestions.map((suggestion) => (
                                            <div
                                                key={suggestion.id}
                                                className="suggestion-item"
                                                onClick={() => handleSuggestionClick(suggestion)}
                                            >
                                                <span className="material-symbols-outlined">search</span>
                                                <span className="suggestion-text">{suggestion.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}

                            {searchInput.trim().length === 0 && searchHistory.length > 0 && (
                                <div className="suggestion-section">
                                    <span className="suggestion-label">Lịch sử tìm kiếm</span>
                                    {searchHistory.map((item, index) => (
                                        <div
                                            key={index}
                                            className="suggestion-item"
                                            onClick={() => handleHistoryClick(item)}
                                        >
                                            <span className="material-symbols-outlined">history</span>
                                            <span className="suggestion-text">{item}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {searchInput.trim().length > 0 && searchSuggestions.length === 0 && (
                                <div className="suggestion-section">
                                    <div className="no-suggestions">
                                        <span className="material-symbols-outlined">search_off</span>
                                        <span>Không tìm thấy sản phẩm phù hợp</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* 4. Các nút Icon */}
                <div className="header-icons">
                    <Link to="/cart" className="action-button">
                        <span className="material-symbols-outlined">shopping_cart</span>
                    </Link>
                    <button className="action-button">
                        <span className="material-symbols-outlined">favorite_border</span>
                    </button>

                    {user ? (
                        <div className="profile-menu-container">
                            <div className="user-avatar-wrapper">
                                <div className="user-avatar">
                                    {getInitials(user.fullName)}
                                </div>
                                <span className="user-fullname">{user.fullName}</span>
                            </div>

                            <div className="dropdown-menu">
                                {user.role === 'admin' && (
                                    <Link to="/admin" className="dropdown-item" style={{ color: '#2563eb' }}>
                                        <span className="material-symbols-outlined" style={{ color: '#2563eb' }}>dashboard</span>
                                        Trang quản trị Admin
                                    </Link>
                                )}
                                <Link to="/person" className="dropdown-item">
                                    <span className="material-symbols-outlined">account_circle</span>
                                    Thông tin tài khoản
                                </Link>
                                <button onClick={handleLogout} className="dropdown-item logout-btn">
                                    <span className="material-symbols-outlined">logout</span>
                                    Đăng xuất
                                </button>
                            </div>
                        </div>
                    ) : (
                        <Link to="/login" className="action-button">
                            <span className="material-symbols-outlined">person</span>
                        </Link>
                    )}
                </div>

            </div>
        </nav>
    );
}

export default Header;