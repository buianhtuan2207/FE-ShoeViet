import React, { useEffect, useMemo, useState } from 'react';
import './Cart.css';
import { Link } from 'react-router-dom';
import CartService from '../../services/CartService';

function Cart() {
    const [items, setItems] = useState([]);

    useEffect(() => {
        setItems(CartService.getCart());
    }, []);

    const hasItems = items.length > 0;

    const updateQty = (itemKey, change) => {
        const item = items.find((item) => CartService.buildKey(item) === itemKey);
        if (!item) return;
        const nextQty = Math.max(1, item.quantity + change);
        setItems(CartService.updateQuantity(itemKey, nextQty));
    };

    const removeItem = (itemKey) => {
        const confirmed = window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng không?');
        if (confirmed) {
            setItems(CartService.removeItem(itemKey));
        }
    };

    const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.price * item.quantity, 0), [items]);
    const discount = hasItems ? 25.0 : 0;
    const total = Math.max(0, subtotal - discount);

    return (
        <main className="cart-container">
            <header className="cart-header">
                <h1 className="display-xl">Giỏ hàng</h1>
                <p className="body-lg">Kiểm tra lại các sản phẩm bạn đã chọn trước khi thanh toán.</p>
            </header>

            <div className="cart-grid">
                <section className="cart-items">
                    {hasItems ? (
                        items.map(item => (
                            <article key={CartService.buildKey(item)} className="cart-item-card">
                                <div className="item-image">
                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=Giay+The+Thao'; }}
                                    />
                                </div>

                                <div className="item-details">
                                    <div className="item-header">
                                        <div>
                                            <h3 className="item-title">{item.name}</h3>
                                            <p className="item-meta">Màu sắc: {item.color}</p>
                                            <p className="item-meta">Kích cỡ: {item.size}</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeItem(CartService.buildKey(item))}
                                            className="remove-btn"
                                            aria-label="Xóa sản phẩm"
                                        >
                                            <span className="material-symbols-outlined">close</span>
                                        </button>
                                    </div>

                                    <div className="item-footer">
                                        <div className="quantity-control">
                                            <button
                                                type="button"
                                                onClick={() => updateQty(CartService.buildKey(item), -1)}
                                                className="qty-btn"
                                                aria-label="Giảm số lượng"
                                                disabled={item.quantity <= 1}
                                            >
                                                <span className="material-symbols-outlined">remove</span>
                                            </button>
                                            <span className="qty-number">{item.quantity}</span>
                                            <button
                                                type="button"
                                                onClick={() => updateQty(CartService.buildKey(item), 1)}
                                                className="qty-btn"
                                                aria-label="Tăng số lượng"
                                            >
                                                <span className="material-symbols-outlined">add</span>
                                            </button>
                                        </div>

                                        <span className="item-price">${(item.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                </div>
                            </article>
                        ))
                    ) : (
                        <div className="empty-cart-state">
                            <p className="empty-title">Giỏ hàng của bạn đang trống.</p>
                            <p className="empty-text">Thêm sản phẩm yêu thích vào giỏ để hoàn tất đơn hàng.</p>
                            <Link to="/product" className="continue-btn">Tiếp tục mua sắm</Link>
                        </div>
                    )}
                </section>

                <aside className="cart-summary">
                    <div className="summary-card">
                        <h2 className="summary-title">Tóm tắt đơn hàng</h2>

                        {hasItems ? (
                            <>
                                <div className="summary-rows">
                                    <div className="summary-row">
                                        <span>Tạm tính</span>
                                        <span>${subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="summary-row">
                                        <span>Vận chuyển</span>
                                        <span className="text-free">Miễn phí</span>
                                    </div>
                                    <div className="summary-row discount">
                                        <span>Giảm giá thành viên</span>
                                        <span>-${discount.toFixed(2)}</span>
                                    </div>
                                </div>

                                <div className="summary-total">
                                    <span>Tổng cộng</span>
                                    <span className="total-amount">${total.toFixed(2)}</span>
                                </div>

                                <Link to="/checkout" className="checkout-btn">
                                    Tiến hành thanh toán
                                    <span className="material-symbols-outlined">arrow_forward</span>
                                </Link>
                                <p className="tax-note">Thuế sẽ được tính toán tại bước thanh toán.</p>
                            </>
                        ) : (
                            <div className="summary-empty">
                                <p>Chưa có sản phẩm nào trong giỏ hàng.</p>
                                <Link to="/product" className="continue-btn">Mua ngay</Link>
                            </div>
                        )}
                    </div>
                </aside>
            </div>
        </main>
    );
}

export default Cart;