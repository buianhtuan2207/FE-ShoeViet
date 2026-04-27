import React from 'react';
import ProductCard from '../../components/ProductCard';
import './Product.css';

const PRODUCTS = [
    {
        id: 1,
        name: "Velocity Pro",
        category: "Men's Road Running",
        price: "$185",
        img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCD5uSWAFkDIE-DvDfXLh1KeBjeRIJmFGyLIdnU8pb52D6JIYysJ2pRzCMYoTovvV-wTpZu_A1uvF5x28LGfK6Yb20MPHMXPC15GQsdT4mxgj3IVlt69FwxZLYLVAxfU1zvFtlkZSAsHNEIaGGKxphPs3wW2UnpRiKZvHK-05lKv9uaqkMPisiZ0FsV5qaAtCF3sKdVUYTFxaUGlK9ahNnlcMNu1tdB4LaOsQbIx0D7pG1dxg85ynkm6eHHE7OGxHirhOVn4i-teEs",
    },
    {
        id: 2,
        name: "Velocity Pro",
        category: "Men's Road Running",
        price: "$185",
        img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCD5uSWAFkDIE-DvDfXLh1KeBjeRIJmFGyLIdnU8pb52D6JIYysJ2pRzCMYoTovvV-wTpZu_A1uvF5x28LGfK6Yb20MPHMXPC15GQsdT4mxgj3IVlt69FwxZLYLVAxfU1zvFtlkZSAsHNEIaGGKxphPs3wW2UnpRiKZvHK-05lKv9uaqkMPisiZ0FsV5qaAtCF3sKdVUYTFxaUGlK9ahNnlcMNu1tdB4LaOsQbIx0D7pG1dxg85ynkm6eHHE7OGxHirhOVn4i-teEs",
    },
    {
        id: 3,
        name: "Velocity Pro",
        category: "Men's Road Running",
        price: "$185",
        img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCD5uSWAFkDIE-DvDfXLh1KeBjeRIJmFGyLIdnU8pb52D6JIYysJ2pRzCMYoTovvV-wTpZu_A1uvF5x28LGfK6Yb20MPHMXPC15GQsdT4mxgj3IVlt69FwxZLYLVAxfU1zvFtlkZSAsHNEIaGGKxphPs3wW2UnpRiKZvHK-05lKv9uaqkMPisiZ0FsV5qaAtCF3sKdVUYTFxaUGlK9ahNnlcMNu1tdB4LaOsQbIx0D7pG1dxg85ynkm6eHHE7OGxHirhOVn4i-teEs",
    },
    {
        id: 4,
        name: "Velocity Pro",
        category: "Men's Road Running",
        price: "$185",
        img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCD5uSWAFkDIE-DvDfXLh1KeBjeRIJmFGyLIdnU8pb52D6JIYysJ2pRzCMYoTovvV-wTpZu_A1uvF5x28LGfK6Yb20MPHMXPC15GQsdT4mxgj3IVlt69FwxZLYLVAxfU1zvFtlkZSAsHNEIaGGKxphPs3wW2UnpRiKZvHK-05lKv9uaqkMPisiZ0FsV5qaAtCF3sKdVUYTFxaUGlK9ahNnlcMNu1tdB4LaOsQbIx0D7pG1dxg85ynkm6eHHE7OGxHirhOVn4i-teEs",
    },
    {
        id: 5,
        name: "Stealth Phantom",
        category: "Unisex Lifestyle",
        price: "$140",
        img: "https://lh3.googleusercontent.com/aida-public/AB6AXuApg8t8INdUhHQUjkLLPKdOWBdNww3EOeP8an7t8w94zYvq1cPrHhqTXgW_iy3yzLrE_d90yyKpNlKiw_v_09We9Em9gDZmrGwheBMhsQ0bOuGz8t9wQaqGBp1BnYHnwhrrNiFBO7anj_sk2TJYBVzMZ--6Ox9eraW-wCQOmActNP3jtzNVBlI7R8eNfkbpyAEykGTes9JOGpxHFeBvn36Sv0F6Kkh5R2GAd5X_dgHvob3PZ4zcswSCd_pYjrCeg7V7dEl5NoCX1XI",
    },
    {
        id: 6,
        name: "Heritage 84",
        category: "Women's Classics",
        price: "$120",
        img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBrC0IYbwDwiYLlmYve_TZignP4FGOheFGrgoiR0ai4bRYbVPGzY99jF75FhZv0MpBGuwcQIGbtURsHWA5M8TuwocULk_at8lWM0H905hYQrT4J5jJuyhQ6wV-sb53XxDwklMBmUlv8IbmWkQmvAp1SksNzBeyEiAuZ555UhDl6gFTLv3XlNMlFnWHgzT11Sh2DHE7vq135TXv65JRbu2yQNfmdJQ0XUSt4aD1qOL5FzTuO2_LeZLQExKqoICQZqMuAHJDazUF0PVE",
    }
];

function ProductPage() {
    return (
        <main className="product-page">
            {/* Header / Breadcrumbs */}
            <div className="page-header">
                <div className="header-info">
                    <h1 className="page-title">Performance Collections</h1>
                    <p className="page-desc">
                        Engineered for speed, designed for the streets. Explore our latest drop of high-performance footwear.
                    </p>
                </div>

                {/* Sort Bar */}
                <div className="header-actions">
                    <span className="result-count">Showing {PRODUCTS.length} results</span>
                    <div className="select-wrapper">
                        <select className="sort-select" defaultValue="Featured">
                            <option value="Featured">Sort by: Featured</option>
                            <option value="Newest">Sort by: Newest</option>
                            <option value="PriceHighLow">Price: High to Low</option>
                            <option value="PriceLowHigh">Price: Low to High</option>
                        </select>
                        <span className="material-symbols-outlined select-icon">expand_more</span>
                    </div>
                </div>
            </div>

            <div className="page-content">
                {/* Sidebar Filters */}
                <aside className="sidebar">
                    {/* ... (Giữ nguyên các filter group của bạn) ... */}
                    <div className="filter-group">
                        <h3 className="filter-title">Brand</h3>
                        <div className="filter-list">
                            <label className="filter-checkbox">
                                <input type="checkbox" defaultChecked />
                                <span>SNEAKERLAB Pro</span>
                            </label>
                            <label className="filter-checkbox">
                                <input type="checkbox" />
                                <span>Aero Dynamics</span>
                            </label>
                            <label className="filter-checkbox">
                                <input type="checkbox" />
                                <span>Urban Terrain</span>
                            </label>
                        </div>
                    </div>

                    <div className="filter-group">
                        <h3 className="filter-title">Size (US)</h3>
                        <div className="size-chips">
                            <button className="chip">7</button>
                            <button className="chip active">8</button>
                            <button className="chip">9</button>
                            <button className="chip">10</button>
                            <button className="chip">11</button>
                            <button className="chip disabled" disabled>12</button>
                        </div>
                    </div>

                    <div className="filter-group">
                        <h3 className="filter-title">Color</h3>
                        <div className="color-chips">
                            <button className="color-btn active" style={{ backgroundColor: '#000' }}></button>
                            <button className="color-btn" style={{ backgroundColor: '#fff', border: '1px solid #e5e5e5' }}></button>
                            <button className="color-btn" style={{ backgroundColor: '#e2e2e2' }}></button>
                            <button className="color-btn" style={{ backgroundColor: '#93000a' }}></button>
                        </div>
                    </div>

                    <div className="filter-group">
                        <h3 className="filter-title">Price</h3>
                        <div className="price-grid">
                            <button className="price-btn">Dưới 300k</button>
                            <button className="price-btn">Dưới 500k</button>
                            <button className="price-btn active">Dưới 1M</button>
                            <button className="price-btn">Dưới 2M</button>
                        </div>
                    </div>
                </aside>

                {/* --- BỌC GRID VÀ PAGINATION VÀO CHUNG MỘT CỘT --- */}
                <div className="product-list-container" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    {/* Product Grid */}
                    <div className="product-grid">
                        {PRODUCTS.map((product) => (
                            <ProductCard key={product.id} data={product} />
                        ))}
                    </div>

                    {/* Pagination */}
                    <div className="pagination">
                        <button className="page-btn disabled" disabled aria-label="Previous page">
                            <span className="material-symbols-outlined">chevron_left</span>
                        </button>

                        <button className="page-btn active">1</button>
                        <button className="page-btn">2</button>
                        <button className="page-btn">3</button>

                        <span className="page-dots">...</span>

                        <button className="page-btn">12</button>

                        <button className="page-btn" aria-label="Next page">
                            <span className="material-symbols-outlined">chevron_right</span>
                        </button>
                    </div>
                </div>
                {/* --- KẾT THÚC CỘT --- */}

            </div>
        </main>
    );
}

export default ProductPage;