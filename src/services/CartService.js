const CART_KEY = 'cartItems';

// Lấy giỏ hàng từ localStorage
const getLocalCart = () => {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || '[]');
  } catch (err) {
    console.error('Lỗi đọc giỏ hàng từ localStorage:', err);
    return [];
  }
};

// Lưu giỏ hàng vào localStorage
const saveLocalCart = (items) => {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  } catch (err) {
    console.error('Lỗi lưu giỏ hàng vào localStorage:', err);
  }
};

// Tạo key duy nhất cho item
const buildKey = (item) => `${item.id}__${item.color || ''}__${item.size || ''}`;

// Chuẩn hóa dữ liệu item
const normalizeCartItem = (item) => {
  return {
    id: item.productId || item.id,
    productId: item.productId || item.id,
    productVariantId: item.productVariantId || item.variantId || null,
    variantId: item.productVariantId || item.variantId || null,
    name: item.name || item.productName || item.title || '',
    image: item.imageUrl || item.image || item.thumbnail || '',
    price: item.price || item.unitPrice || item.pricePerUnit || 0,
    quantity: item.quantity || 1,
    color: item.color || '',
    size: item.size || '',
    sku: item.sku || item.variantSku || '',
    stockQuantity: item.stockQuantity || item.stock || Infinity,
    ...item
  };
};

// Lấy giỏ hàng
const getCart = () => {
  return getLocalCart().map(normalizeCartItem);
};

// Thêm item vào giỏ hàng
const addItem = (newItem) => {
  const cart = getLocalCart();
  const existing = cart.find((item) => buildKey(item) === buildKey(newItem));

  if (existing) {
    existing.quantity = Math.min(
      existing.quantity + (newItem.quantity || 1),
      newItem.stockQuantity || Infinity
    );
  } else {
    cart.push(normalizeCartItem(newItem));
  }

  saveLocalCart(cart);
  window.dispatchEvent(new Event('cartUpdated'));
  return cart;
};

// Cập nhật số lượng
const updateQuantity = (itemKey, quantity) => {
  const cart = getLocalCart();
  const nextCart = cart.map((item) => {
    const key = buildKey(item);
    if (key !== itemKey) return item;
    return {
      ...item,
      quantity: Math.max(1, quantity)
    };
  });

  saveLocalCart(nextCart);
  window.dispatchEvent(new Event('cartUpdated'));
  return nextCart;
};

// Xóa item
const removeItem = (itemKey) => {
  const cart = getLocalCart();
  const nextCart = cart.filter((item) => buildKey(item) !== itemKey);
  saveLocalCart(nextCart);
  window.dispatchEvent(new Event('cartUpdated'));
  return nextCart;
};

// Xóa toàn bộ giỏ hàng
const clearCart = () => {
  saveLocalCart([]);
  window.dispatchEvent(new Event('cartUpdated'));
  return [];
};

const CartService = {
  getCart,
  saveCart: saveLocalCart,
  addItem,
  updateQuantity,
  removeItem,
  clearCart,
  buildKey
};

export default CartService;

