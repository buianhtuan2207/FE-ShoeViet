import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import CartService from '../../services/CartService';
import styles from './Cart.module.scss';

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
        <main className={styles['cart-container']}>
            <header className={styles['cart-header']}>
                <h1 className={styles['display-xl']}>Giỏ hàng</h1>
                <p className={styles['body-lg']}>Kiểm tra lại các sản phẩm bạn đã chọn trước khi thanh toán.</p>
            </header>

            <div className={styles['cart-grid']}>
                <section className={styles['cart-items']}>
                    {hasItems ? (
                        items.map(item => (
                            <article key={CartService.buildKey(item)} className={styles['cart-item-card']}>
                                <div className={styles['item-image']}>
                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=Giay+The+Thao'; }}
                                    />
                                </div>

                                <div className={styles['item-details']}>
                                    <div className={styles['item-header']}>
                                        <div>
                                            <h3 className={styles['item-title']}>{item.name}</h3>
                                            <p className={styles['item-meta']}>Màu sắc: {item.color}</p>
                                            <p className={styles['item-meta']}>Kích cỡ: {item.size}</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeItem(CartService.buildKey(item))}
                                            className={styles['remove-btn']}
                                            aria-label="Xóa sản phẩm"
                                        >
                                            <span className="material-symbols-outlined">close</span>
                                        </button>
                                    </div>

                                    <div className={styles['item-footer']}>
                                        <div className={styles['quantity-control']}>
                                            <button
                                                type="button"
                                                onClick={() => updateQty(CartService.buildKey(item), -1)}
                                                className={styles['qty-btn']}
                                                aria-label="Giảm số lượng"
                                                disabled={item.quantity <= 1}
                                            >
                                                <span className="material-symbols-outlined">remove</span>
                                            </button>
                                            <span className={styles['qty-number']}>{item.quantity}</span>
                                            <button
                                                type="button"
                                                onClick={() => updateQty(CartService.buildKey(item), 1)}
                                                className={styles['qty-btn']}
                                                aria-label="Tăng số lượng"
                                            >
                                                <span className="material-symbols-outlined">add</span>
                                            </button>
                                        </div>

                                        <span className={styles['item-price']}>${(item.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                </div>
                            </article>
                        ))
                    ) : (
                        <div className={styles['empty-cart-state']}>
                            <p className={styles['empty-title']}>Giỏ hàng của bạn đang trống.</p>
                            <p className={styles['empty-text']}>Thêm sản phẩm yêu thích vào giỏ để hoàn tất đơn hàng.</p>
                            <Link to="/product" className={styles['continue-btn']}>Tiếp tục mua sắm</Link>
                        </div>
                    )}
                </section>

                <aside className={styles['cart-summary']}>
                    <div className={styles['summary-card']}>
                        <h2 className={styles['summary-title']}>Tóm tắt đơn hàng</h2>

                        {hasItems ? (
                            <>
                                <div className={styles['summary-rows']}>
                                    <div className={styles['summary-row']}>
                                        <span>Tạm tính</span>
                                        <span>${subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className={styles['summary-row']}>
                                        <span>Vận chuyển</span>
                                        <span className={styles['text-free']}>Miễn phí</span>
                                    </div>
                                    <div className={`${styles['summary-row']} ${styles.discount}`}>
                                        <span>Giảm giá thành viên</span>
                                        <span>-${discount.toFixed(2)}</span>
                                    </div>
                                </div>

                                <div className={styles['summary-total']}>
                                    <span>Tổng cộng</span>
                                    <span className={styles['total-amount']}>${total.toFixed(2)}</span>
                                </div>

                                <Link to="/checkout" className={styles['checkout-btn']}>
                                     Thanh toán
                                    <span className="material-symbols-outlined">arrow_forward</span>
                                </Link>
                            </>
                        ) : (
                            <div className={styles['summary-empty']}>
                                <p>Chưa có sản phẩm nào trong giỏ hàng.</p>
                                <Link to="/product" className={styles['continue-btn']}>Mua ngay</Link>
                            </div>
                        )}
                    </div>
                </aside>
            </div>
        </main>
    );
}

export default Cart;