import API from './api';

const OrderService = {
  createOrder: async (orderData) => {
    const response = await API.post('/orders', orderData);
    return response.data;
  },

  getOrdersByUser: async (userId) => {
    const response = await API.get(`/orders/user/${userId}`);
    return response.data;
  },
  
  getOrderById: async (orderId) => {
  const response = await API.get(`/orders/${orderId}`);
  return response.data;
}
};

export default OrderService;
