const CART_KEY = 'cartItems';

const getCart = () => {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || '[]');
  } catch (err) {
    console.error('Lỗi đọc giỏ hàng từ localStorage:', err);
    return [];
  }
};

const saveCart = (items) => {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  } catch (err) {
    console.error('Lỗi lưu giỏ hàng vào localStorage:', err);
  }
};

const buildKey = (item) => `${item.id}__${item.color || ''}__${item.size || ''}`;

const addItem = (newItem) => {
  const cart = getCart();
  const existing = cart.find(item => buildKey(item) === buildKey(newItem));

  if (existing) {
    existing.quantity = Math.min(
      existing.quantity + (newItem.quantity || 1),
      newItem.stockQuantity || Infinity
    );
  } else {
    cart.push({
      ...newItem,
      quantity: newItem.quantity || 1
    });
  }

  saveCart(cart);
  return cart;
};

const updateQuantity = (itemKey, quantity) => {
  const cart = getCart();
  const nextCart = cart.map(item => {
    const key = buildKey(item);
    if (key !== itemKey) return item;
    return {
      ...item,
      quantity: Math.max(1, quantity)
    };
  });
  saveCart(nextCart);
  return nextCart;
};

const removeItem = (itemKey) => {
  const cart = getCart();
  const nextCart = cart.filter(item => buildKey(item) !== itemKey);
  saveCart(nextCart);
  return nextCart;
};

const clearCart = () => {
  saveCart([]);
};

export default {
  getCart,
  saveCart,
  addItem,
  updateQuantity,
  removeItem,
  clearCart,
  buildKey
};
