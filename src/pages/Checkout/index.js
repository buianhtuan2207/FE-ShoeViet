import React, { useEffect, useMemo, useState } from 'react';
import './Checkout.css';
import CartService from '../../services/CartService';
import OrderService from '../../services/OrderService';
import { userService } from '../../services/UserService';

function Checkout() {
    // 1. State quản lý thông tin giao hàng
    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        province: '',
        district: '',
        ward: '',
        address: '',
        note: ''
    });

    // 2. State quản lý phương thức thanh toán
    const [paymentMethod, setPaymentMethod] = useState('cod');

    // 3. State quản lý sản phẩm trong giỏ
    const [items, setItems] = useState([]);

    // 4. State người dùng / order submit
    const [userId, setUserId] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem('userInfo');
        if (storedUser) {
            try {
                const parsed = JSON.parse(storedUser);
                if (parsed.id) {
                    setUserId(parsed.id);
                }
                setFormData(prev => ({
                    ...prev,
                    fullName: parsed.fullName || prev.fullName,
                    phone: parsed.phone || prev.phone,
                    address: parsed.address || prev.address
                }));
            } catch {
                // Ignore invalid cached profile
            }
        }

        if (!userId) {
            userService.getMyProfile()
                .then(profile => {
                    if (profile?.id) {
                        setUserId(profile.id);
                    }
                    setFormData(prev => ({
                        ...prev,
                        fullName: profile?.fullName || prev.fullName,
                        phone: profile?.phone || prev.phone,
                        address: profile?.address || prev.address
                    }));
                })
                .catch(() => {
                    // Không block checkout; chỉ gửi cảnh báo khi submit nếu cần
                });
        }
    }, [userId]);

    useEffect(() => {
        setItems(CartService.getCart());

        const onCartUpdated = () => {
            setItems(CartService.getCart());
        };

        window.addEventListener('cartUpdated', onCartUpdated);
        return () => window.removeEventListener('cartUpdated', onCartUpdated);
    }, []);

    const hasItems = items.length > 0;

    const subtotal = useMemo(
        () => items.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0),
        [items]
    );

    const discount = hasItems ? 25.0 : 0;
    const total = Math.max(0, subtotal - discount);


    // Hàm xử lý thay đổi input
    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    // Hàm xử lý khi nhấn Hoàn tất
    const handleCompletePurchase = async () => {
        if (!hasItems) {
            alert('Giỏ hàng đang trống. Vui lòng thêm sản phẩm trước khi thanh toán!');
            return;
        }

        if (!formData.fullName || !formData.phone || !formData.address) {
            alert('Vui lòng điền đầy đủ thông tin giao hàng!');
            return;
        }

        if (!userId) {
            alert('Không thể tạo đơn hàng. Vui lòng đăng nhập lại hoặc thử tải lại trang.');
            return;
        }

        const shippingAddress = [formData.address, formData.ward, formData.district, formData.province]
            .filter(Boolean)
            .join(', ');

        const orderItems = items.map((item) => ({
            productId: item.productId || item.id,
            productVariantId: item.productVariantId || item.variantId,
            quantity: item.quantity || 1
        }));

        const hasMissingVariant = orderItems.some(item => !item.productVariantId);
        if (hasMissingVariant) {
            alert('Một hoặc nhiều sản phẩm trong giỏ thiếu thông tin variant. Vui lòng cập nhật lại giỏ hàng.');
            return;
        }

        const orderData = {
            userId,
            shippingName: formData.fullName,
            shippingPhone: formData.phone,
            shippingAddress,
            notes: formData.note || '',
            discountAmount: discount,
            orderItems
        };

        setIsSubmitting(true);
        try {
            const createdOrder = await OrderService.createOrder(orderData);
            CartService.clearCart();
            setItems([]);
            alert(`Đặt hàng thành công! Mã đơn hàng: ${createdOrder.orderCode}`);
        } catch (error) {
            const message = error?.response?.data || error?.message || 'Đặt hàng thất bại. Vui lòng thử lại.';
            console.error('Order submit failed', error);
            alert(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="checkout-main">
            <h1 className="checkout-title">Thanh toán</h1>

            <div className="checkout-grid">
                {/* Cột trái: Thông tin Form */}
                <div className="left-column">
                    <section className="form-section">
                        <h2 className="section-title">Thông tin giao hàng</h2>
                        <form className="shipping-form">
                            <div className="input-group">
                                <label htmlFor="fullName">Họ và tên</label>
                                <input
                                    type="text" id="fullName"
                                    placeholder="Nguyễn Văn A"
                                    value={formData.fullName}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="input-group">
                                <label htmlFor="phone">Số điện thoại</label>
                                <input
                                    type="tel" id="phone"
                                    placeholder="+84 900 000 000"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="grid-3-col">
                                <div className="input-group">
                                    <label htmlFor="province">Tỉnh / Thành phố</label>
                                    <div className="select-wrapper">
                                        <select id="province" defaultValue="" onChange={handleInputChange}>
                                            <option value="" disabled>Chọn Tỉnh/Thành</option>
                                            <option value="hcm">Hồ Chí Minh</option>
                                            <option value="hn">Hà Nội</option>
                                            <option value="dn">Đà Nẵng</option>
                                        </select>
                                        <span className="material-symbols-outlined dropdown-icon">expand_more</span>
                                    </div>
                                </div>

                                <div className="input-group">
                                    <label htmlFor="district">Quận / Huyện</label>
                                    <div className="select-wrapper">
                                        <select id="district" defaultValue="" onChange={handleInputChange}>
                                            <option value="" disabled>Chọn Quận/Huyện</option>
                                            <option value="q1">Quận 1</option>
                                            <option value="q2">Quận 2</option>
                                            <option value="q3">Quận 3</option>
                                        </select>
                                        <span className="material-symbols-outlined dropdown-icon">expand_more</span>
                                    </div>
                                </div>

                                <div className="input-group">
                                    <label htmlFor="ward">Phường / Xã</label>
                                    <div className="select-wrapper">
                                        <select id="ward" defaultValue="" onChange={handleInputChange}>
                                            <option value="" disabled>Chọn Phường/Xã</option>
                                            <option value="pbn">Phường Bến Nghé</option>
                                            <option value="pda">Phường Đa Kao</option>
                                        </select>
                                        <span className="material-symbols-outlined dropdown-icon">expand_more</span>
                                    </div>
                                </div>
                            </div>

                            <div className="input-group">
                                <label htmlFor="address">Địa chỉ chi tiết</label>
                                <input type="text" id="address" placeholder="Số nhà, tên đường..." onChange={handleInputChange} />
                            </div>

                            <div className="input-group">
                                <label htmlFor="note">Ghi chú đơn hàng</label>
                                <textarea id="note" rows="3" placeholder="Lời nhắn cho shipper..." onChange={handleInputChange}></textarea>
                            </div>
                        </form>
                    </section>

                    <section className="form-section">
                        <h2 className="section-title">Phương thức thanh toán</h2>
                        <div className="payment-options">
                            <label className={`payment-label ${paymentMethod === 'cod' ? 'active' : ''}`}>
                                <input
                                    type="radio" name="payment"
                                    checked={paymentMethod === 'cod'}
                                    onChange={() => setPaymentMethod('cod')}
                                />
                                <div className="payment-info">
                                    <span>Thanh toán khi nhận hàng (COD)</span>
                                    <span className="material-symbols-outlined">local_shipping</span>
                                </div>
                            </label>

                            <label className={`payment-label ${paymentMethod === 'vnpay' ? 'active' : ''}`}>
                                <input
                                    type="radio" name="payment"
                                    checked={paymentMethod === 'vnpay'}
                                    onChange={() => setPaymentMethod('vnpay')}
                                />
                                <div className="payment-info">
                                    <span>Thanh toán qua VNPay</span>
                                    <span className="material-symbols-outlined">account_balance</span>
                                </div>
                            </label>
                        </div>
                    </section>
                </div>

                {/* Cột phải: Tóm tắt đơn hàng */}
                <aside className="right-column">
                    <div className="summary-sticky">
                        <h2 className="summary-title">Tóm tắt đơn hàng</h2>

                        <div className="items-preview">
                            {hasItems ? (
                                items.map((item) => (
                                    <div className="preview-item" key={CartService.buildKey(item)}>
                                        <div className="img-box">
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                onError={(e) => {
                                                    e.target.src = 'https://via.placeholder.com/150?text=Giay+The+Thao';
                                                }}
                                            />
                                        </div>
                                        <div className="item-text">
                                            <h4>{item.name}</h4>
                                            <p>
                                                Size: {item.size} | Màu: {item.color}
                                            </p>
                                            <div className="price-row">
                                                <span>SL: {item.quantity}</span>
                                                <span className="price">${(item.price * item.quantity).toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="empty-items-preview">
                                    <p>Chưa có sản phẩm nào trong giỏ hàng.</p>
                                </div>
                            )}
                        </div>

                        <div className="total-lines">
                            <div className="line"><span>Tạm tính</span><span>${subtotal.toFixed(2)}</span></div>
                            <div className="line"><span>Vận chuyển</span><span className="free">Miễn phí</span></div>
                            <div className="line total"><span>Tổng cộng</span><span>${total.toFixed(2)}</span></div>
                        </div>


                        <button className="btn-complete" onClick={handleCompletePurchase} disabled={isSubmitting}>
                            <span className="material-symbols-outlined">shopping_bag</span>
                            {isSubmitting ? 'Đang xử lý...' : 'Hoàn tất đặt hàng'}
                        </button>
                        <p className="terms-text">Bằng việc hoàn tất, bạn đồng ý với Điều khoản dịch vụ.</p>
                    </div>
                </aside>
            </div>
        </main>
    );
};

export default Checkout;