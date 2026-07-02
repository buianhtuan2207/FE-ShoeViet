import React, { useEffect, useMemo, useState } from 'react';
import CartService from '../../services/CartService';
import OrderService from '../../services/OrderService';
import { userService } from '../../services/UserService';
import shippingService from '../../services/ShippingService';
import styles from './Checkout.module.scss';

function Checkout() {
    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        province: '',
        district: '',
        ward: '',
        address: '',
        note: ''
    });

    const [locationIds, setLocationIds] = useState({
        province: '',
        district: '',
        ward: ''
    });
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);
    const [shippingFee, setShippingFee] = useState(0);
    const [isCalculatingFee, setIsCalculatingFee] = useState(false);

    const [paymentMethod, setPaymentMethod] = useState('cod');
    const [items, setItems] = useState([]);
    const [userId, setUserId] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem('userInfo');
        if (storedUser) {
            try {
                const parsed = JSON.parse(storedUser);
                if (parsed.id) setUserId(parsed.id);
                setFormData(prev => ({
                    ...prev,
                    fullName: parsed.fullName || prev.fullName,
                    phone: parsed.phone || prev.phone,
                    address: parsed.address || prev.address
                }));
            } catch {}
        }

        if (!userId) {
            userService.getMyProfile()
                .then(profile => {
                    if (profile?.id) setUserId(profile.id);
                    setFormData(prev => ({
                        ...prev,
                        fullName: profile?.fullName || prev.fullName,
                        phone: profile?.phone || prev.phone,
                        address: profile?.address || prev.address
                    }));
                })
                .catch(() => {});
        }
    }, [userId]);

    useEffect(() => {
        setItems(CartService.getCart());
        const onCartUpdated = () => setItems(CartService.getCart());
        window.addEventListener('cartUpdated', onCartUpdated);
        return () => window.removeEventListener('cartUpdated', onCartUpdated);
    }, []);

    useEffect(() => {
        const fetchProvinces = async () => {
            try {
                const res = await shippingService.getProvinces();
                if (res?.code === 200) {
                    setProvinces(res.data);
                }
            } catch (error) {
                console.error(error);
            }
        };
        fetchProvinces();
    }, []);

    const hasItems = items.length > 0;

    // Tạm tính tổng tiền hàng (VNĐ)
    const subtotal = useMemo(
        () => items.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0),
        [items]
    );

    const discount = hasItems ? 25000 : 0;
    const total = Math.max(0, subtotal - discount + shippingFee);

    const formatCurrency = (value) => {
        return Number(value).toLocaleString('vi-VN');
    };

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleProvinceChange = async (e) => {
        const provinceId = e.target.value;
        const provinceName = e.target.options[e.target.selectedIndex].text;

        setLocationIds(prev => ({ ...prev, province: provinceId, district: '', ward: '' }));
        setFormData(prev => ({ ...prev, province: provinceName, district: '', ward: '' }));
        setShippingFee(0);
        setDistricts([]);
        setWards([]);

        try {
            const res = await shippingService.getDistricts(provinceId);
            if (res?.code === 200) setDistricts(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleDistrictChange = async (e) => {
        const districtId = e.target.value;
        const districtName = e.target.options[e.target.selectedIndex].text;

        setLocationIds(prev => ({ ...prev, district: districtId, ward: '' }));
        setFormData(prev => ({ ...prev, district: districtName, ward: '' }));
        setShippingFee(0);
        setWards([]);

        try {
            const res = await shippingService.getWards(districtId);
            if (res?.code === 200) setWards(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleWardChange = async (e) => {
        const wardCode = e.target.value;
        const wardName = e.target.options[e.target.selectedIndex].text;

        setLocationIds(prev => ({ ...prev, ward: wardCode }));
        setFormData(prev => ({ ...prev, ward: wardName }));

        if (locationIds.district && hasItems) {
            setIsCalculatingFee(true);
            try {
                const estimatedWeight = items.reduce((totalWeight, item) => totalWeight + ((item.quantity || 1) * 800), 0);

                const reqData = {
                    toDistrictId: Number(locationIds.district),
                    toWardCode: String(wardCode),
                    weightInGrams: estimatedWeight,
                    orderTotalValue: subtotal
                };

                const res = await shippingService.calculateFee(reqData);
                console.log("Dữ liệu API phí ship trả về:", res);

                const fee = res?.shippingFee ?? res?.data?.total ?? res?.data ?? 0;
                setShippingFee(Number(fee));

            } catch (error) {
                console.error("Lỗi tính phí vận chuyển:", error);
                setShippingFee(35000);
            } finally {
                setIsCalculatingFee(false);
            }
        }
    };

    const handleCompletePurchase = async () => {
        if (!hasItems) {
            alert('Giỏ hàng đang trống. Vui lòng thêm sản phẩm trước khi thanh toán!');
            return;
        }

        if (!formData.fullName || !formData.phone || !formData.address || !formData.province || !formData.district || !formData.ward) {
            alert('Vui lòng điền đầy đủ thông tin giao hàng!');
            return;
        }

        if (!userId) {
            alert('Không thể tạo đơn hàng. Vui lòng đăng nhập lại.');
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
            alert('Một hoặc nhiều sản phẩm trong giỏ thiếu thông tin variant.');
            return;
        }

        const orderData = {
            userId,
            shippingName: formData.fullName,
            shippingPhone: formData.phone,
            shippingAddress,
            notes: formData.note || '',
            discountAmount: discount,
            shippingFee: shippingFee,
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
            alert(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className={styles['checkout-main']}>
            <h1 className={styles['checkout-title']}>Thanh toán</h1>

            <div className={styles['checkout-grid']}>
                <div className={styles['left-column']}>
                    <section className={styles['form-section']}>
                        <h2 className={styles['section-title']}>Thông tin giao hàng</h2>
                        <form className={styles['shipping-form']}>
                            <div className={styles['input-group']}>
                                <label htmlFor="fullName">Họ và tên</label>
                                <input type="text" id="fullName" placeholder="Nguyễn Văn A" value={formData.fullName} onChange={handleInputChange} />
                            </div>

                            <div className={styles['input-group']}>
                                <label htmlFor="phone">Số điện thoại</label>
                                <input type="tel" id="phone" placeholder="+84 900 000 000" value={formData.phone} onChange={handleInputChange} />
                            </div>

                            <div className={styles['grid-3-col']}>
                                <div className={styles['input-group']}>
                                    <label htmlFor="province">Tỉnh / Thành phố</label>
                                    <div className={styles['select-wrapper']}>
                                        <select id="province" value={locationIds.province} onChange={handleProvinceChange}>
                                            <option value="" disabled>Chọn Tỉnh/Thành</option>
                                            {provinces.map(p => (
                                                <option key={p.ProvinceID} value={p.ProvinceID}>{p.ProvinceName}</option>
                                            ))}
                                        </select>
                                        <span className={`material-symbols-outlined ${styles['dropdown-icon']}`}>expand_more</span>
                                    </div>
                                </div>

                                <div className={styles['input-group']}>
                                    <label htmlFor="district">Quận / Huyện</label>
                                    <div className={styles['select-wrapper']}>
                                        <select id="district" value={locationIds.district} onChange={handleDistrictChange} disabled={!locationIds.province}>
                                            <option value="" disabled>Chọn Quận/Huyện</option>
                                            {districts.map(d => (
                                                <option key={d.DistrictID} value={d.DistrictID}>{d.DistrictName}</option>
                                            ))}
                                        </select>
                                        <span className={`material-symbols-outlined ${styles['dropdown-icon']}`}>expand_more</span>
                                    </div>
                                </div>

                                <div className={styles['input-group']}>
                                    <label htmlFor="ward">Phường / Xã</label>
                                    <div className={styles['select-wrapper']}>
                                        <select id="ward" value={locationIds.ward} onChange={handleWardChange} disabled={!locationIds.district}>
                                            <option value="" disabled>Chọn Phường/Xã</option>
                                            {wards.map(w => (
                                                <option key={w.WardCode} value={w.WardCode}>{w.WardName}</option>
                                            ))}
                                        </select>
                                        <span className={`material-symbols-outlined ${styles['dropdown-icon']}`}>expand_more</span>
                                    </div>
                                </div>
                            </div>

                            <div className={styles['input-group']}>
                                <label htmlFor="address">Địa chỉ chi tiết</label>
                                <input type="text" id="address" placeholder="Số nhà, tên đường..." value={formData.address} onChange={handleInputChange} />
                            </div>

                            <div className={styles['input-group']}>
                                <label htmlFor="note">Ghi chú đơn hàng</label>
                                <textarea id="note" rows="3" placeholder="Lời nhắn cho shipper..." value={formData.note} onChange={handleInputChange}></textarea>
                            </div>
                        </form>
                    </section>

                    <section className={styles['form-section']}>
                        <h2 className={styles['section-title']}>Phương thức thanh toán</h2>
                        <div className={styles['payment-options']}>
                            <label className={`${styles['payment-label']} ${paymentMethod === 'cod' ? styles.active : ''}`}>
                                <input type="radio" name="payment" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} />
                                <div className={styles['payment-info']}>
                                    <span>Thanh toán khi nhận hàng (COD)</span>
                                    <span className="material-symbols-outlined">local_shipping</span>
                                </div>
                            </label>

                            <label className={`${styles['payment-label']} ${paymentMethod === 'vnpay' ? styles.active : ''}`}>
                                <input type="radio" name="payment" checked={paymentMethod === 'vnpay'} onChange={() => setPaymentMethod('vnpay')} />
                                <div className={styles['payment-info']}>
                                    <span>Thanh toán qua VNPay</span>
                                    <span className="material-symbols-outlined">account_balance</span>
                                </div>
                            </label>
                        </div>
                    </section>
                </div>

                <aside className={styles['right-column']}>
                    <div className={styles['summary-sticky']}>
                        <h2 className={styles['summary-title']}>Tóm tắt đơn hàng</h2>

                        <div className={styles['items-preview']}>
                            {hasItems ? (
                                items.map((item) => (
                                    <div className={styles['preview-item']} key={CartService.buildKey(item)}>
                                        <div className={styles['img-box']}>
                                            <img src={item.image} alt={item.name} onError={(e) => { e.target.src = 'https://via.placeholder.com/150'; }} />
                                        </div>
                                        <div className={styles['item-text']}>
                                            <h4>{item.name}</h4>
                                            <p>Size: {item.size} | Màu: {item.color}</p>
                                            <div className={styles['price-row']}>
                                                <span>SL: {item.quantity}</span>
                                                <span className={styles.price}>{formatCurrency(item.price * item.quantity)} đ</span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className={styles['empty-items-preview']}>
                                    <p>Chưa có sản phẩm nào trong giỏ hàng.</p>
                                </div>
                            )}
                        </div>

                        <div className={styles['total-lines']}>
                            <div className={styles.line}><span>Tạm tính</span><span>{formatCurrency(subtotal)} đ</span></div>
                            {discount > 0 && (
                                <div className={styles.line}><span>Giảm giá</span><span>-{formatCurrency(discount)} đ</span></div>
                            )}
                            <div className={styles.line}>
                                <span>Vận chuyển</span>
                                <span>
                                    {isCalculatingFee
                                        ? 'Đang tính...'
                                        : (shippingFee === 0 && !locationIds.ward
                                            ? 'Chưa chọn địa chỉ'
                                            : (shippingFee === 0 ? <span className={styles.free}>Miễn phí</span> : `${formatCurrency(shippingFee)} đ`))}
                                </span>
                            </div>

                            <div className={`${styles.line} ${styles.total}`}><span>Tổng cộng</span><span>{formatCurrency(total)} đ</span></div>
                        </div>

                        <button className={styles['btn-complete']} onClick={handleCompletePurchase} disabled={isSubmitting || isCalculatingFee}>
                            <span className="material-symbols-outlined">shopping_bag</span>
                            {isSubmitting ? 'Đang xử lý...' : 'Hoàn tất đặt hàng'}
                        </button>
                        <p className={styles['terms-text']}>Bằng việc hoàn tất, bạn đồng ý với Điều khoản dịch vụ.</p>
                    </div>
                </aside>
            </div>
        </main>
    );
}

export default Checkout;