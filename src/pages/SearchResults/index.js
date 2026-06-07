import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../../components/ProductCard';
import searchService from '../../services/SearchService';
import './SearchResults.scss';

function SearchResults() {
    const [searchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const keyword = searchParams.get('q') || '';

    useEffect(() => {
        const performSearch = async () => {
            try {
                setLoading(true);
                setError(null);

                if (!keyword.trim()) {
                    setProducts([]);
                    setLoading(false);
                    return;
                }

                const result = await searchService.searchProducts({ keyword });

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
    }, [keyword]);

    const saveSearchHistory = (searchWord) => {
        if (!searchWord.trim()) return;

        const history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
        const newHistory = [searchWord, ...history.filter(item => item !== searchWord)].slice(0, 10);
        localStorage.setItem('searchHistory', JSON.stringify(newHistory));
    };

    useEffect(() => {
        if (keyword.trim()) {
            saveSearchHistory(keyword);
        }
    }, [keyword]);

    return (
        <main className="search-results-page">
            <div className="page-header">
                <div className="header-info">
                    <h1 className="page-title">
                        Kết quả tìm kiếm
                        {keyword && <span className="search-keyword">"{keyword}"</span>}
                    </h1>
                    <p className="result-count">
                        Tìm thấy <strong>{products.length}</strong> sản phẩm
                    </p>
                </div>
            </div>

            <div className="page-content">
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
                                {keyword
                                    ? `Không có sản phẩm nào khớp với "${keyword}"`
                                    : 'Vui lòng thử lại với từ khóa tìm kiếm'
                                }
                            </p>
                        </div>
                    )}

                    {!loading && products.length > 0 && (
                        <div className="products-grid">
                            {products.map(product => (
                                <ProductCard key={product.id} data={product} />
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}

export default SearchResults;
