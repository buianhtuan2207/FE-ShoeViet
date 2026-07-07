import API from './api';

const OrderService = {
  createOrder: async (orderData) => {
    const response = await API.post('/orders', orderData);
    return response.data;
  },

  getAllOrders: async () => {
    const response = await API.get('/orders');
    return response.data;
  },

  getOrdersByUser: async (userId) => {
    const response = await API.get(`/orders/user/${userId}`);
    return response.data;
  },

  getOrderById: async (orderId) => {
    const response = await API.get(`/orders/${orderId}`);
    return response.data;
  },

  getOrderByCode: async (orderCode) => {
    const response = await API.get(`/orders/code/${orderCode}`);
    return response.data;
  },

  updateOrderStatus: async (orderId, payload) => {
    const response = await API.patch(`/orders/${orderId}/status`, payload);
    return response.data;
  },

  cancelOrder: async (orderId) => {
    const response = await API.post(`/orders/${orderId}/cancel`);
    return response.data;
  }
};

export default OrderService;