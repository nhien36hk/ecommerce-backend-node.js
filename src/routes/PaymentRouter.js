const express = require('express');
const PaymentRouter = express.Router();
const vnpayController = require('../payment/vnpay'); // Import các hàm xử lý thanh toán

// Route xử lý tạo URL thanh toán
PaymentRouter.post('/create_payment_url', vnpayController.createPaymentUrl);

// Route xử lý kết quả trả về sau thanh toán
PaymentRouter.get('/vnpay_return', vnpayController.vnpayReturn);

module.exports = PaymentRouter;
