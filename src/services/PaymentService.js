import API from './api';

const paymentService = {
    getVNPayUrl: async (amount, orderCode) => {
        const response = await API.get(`/v1/payment/vnpay-url`, {
            params: {
                amount: Math.round(amount),
                orderCode: orderCode
            }
        });
        return response.data;
    }
};

export default paymentService;