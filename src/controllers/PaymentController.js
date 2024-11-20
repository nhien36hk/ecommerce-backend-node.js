const vnpayService = require('../payment/vnpay'); // Import service xử lý VNPAY
const Payment = require('../models/PaymentModel'); // Import model để lưu giao dịch

// Tạo URL thanh toán
const createPayment = async (req, res) => {
    try {
        const { amount, bankCode } = req.body;
        const orderId = Date.now().toString(); // Tạo ID giao dịch duy nhất

        // Lưu thông tin giao dịch vào cơ sở dữ liệu
        const payment = new Payment({ orderId, amount, bankCode });
        await payment.save();

        // Tạo URL thanh toán
        req.body.orderId = orderId; // Thêm orderId vào request để tạo URL
        vnpayService.createPaymentUrl(req, res);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi tạo thanh toán', error });
    }
};

// Xử lý kết quả trả về từ VNPAY
const vnpayReturn = async (req, res) => {
    try {
        const { vnp_TxnRef, vnp_ResponseCode } = req.query;

        // Tìm giao dịch trong cơ sở dữ liệu và cập nhật trạng thái
        const payment = await Payment.findOne({ orderId: vnp_TxnRef });
        if (payment) {
            payment.transactionStatus = vnp_ResponseCode === '00' ? 'success' : 'failure';
            await payment.save();
        }

        // Gọi hàm xử lý kết quả thanh toán từ vnpay.js
        vnpayService.vnpayReturn(req, res);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi xử lý kết quả thanh toán', error });
    }
};

module.exports = {
    createPayment,
    vnpayReturn,
};
