const vnpayService = require('../payment/vnpay');
const Payment = require('../models/PaymentModel');
const Order = require('../models/OrderProduct');
const OrderService = require('../services/OrderService');
const moment = require('moment');
const querystring = require('qs');
const crypto = require('crypto');


const createPayment = async (req, res) => {
    try {
        const { amount, orderDescription, orderType, language, orderInfo } = req.body;

        // Tạo mã giao dịch duy nhất
        const orderId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Lưu thông tin thanh toán vào database
        const payment = new Payment({
            orderId,
            amount,
            orderInfo,
            status: 'pending'
        });
        await payment.save();

        // Tạo URL thanh toán VNPAY
        const paymentUrl = await vnpayService.createPaymentUrl({
            amount,
            orderId,
            orderDescription,
            orderType: orderType || 'billpayment',
            language: language || 'vn'
        });

        res.json({ paymentUrl });
    } catch (error) {
        console.log('Payment creation error:', error.message, error.stack);
        res.status(500).json({
            status: 'error',
            message: 'Không thể tạo thanh toán',
            error: error.message  // Trả về thông báo lỗi chi tiết
        });
    }
};


const vnpayReturn = async (req, res) => {
    try {
        const vnpayResponse = await vnpayService.verifyReturnUrl(req.query);

        console.log('VNPAY Response:', vnpayResponse); // In ra phản hồi để kiểm tra

        if (vnpayResponse.responseCode === '00') {
            const orderId = vnpayResponse.orderId; // orderId từ VNPAY
            const amount = vnpayResponse.amount;

            // Tìm kiếm đơn hàng trong cơ sở dữ liệu để lấy orderItems
            const order = await Order.findById(orderId); // Sử dụng findById để lấy đơn hàng

            if (!order) {
                console.error('Không tìm thấy đơn hàng để cập nhật');
                return res.redirect(`${process.env.FRONTEND_URL}/payment-failed?error=order_not_found`);
            }

            // Cập nhật trạng thái đơn hàng
            const updatedOrder = await Order.findOneAndUpdate(
                { _id: orderId },
                { isPaid: true },
                { new: true }
            );

            // Lưu thông tin thanh toán vào cơ sở dữ liệu
            const payment = new Payment({
                orderId,
                amount,
                orderInfo: 'Thanh toán qua VNPAY',
                status: 'completed'
            });
            await payment.save();

            // Sử dụng orderItems từ đơn hàng đã tìm thấy
            res.redirect(`${process.env.FRONTEND_URL}/ordersuccess?${new URLSearchParams({
                orderId: orderId,
                amount: amount,
                paymentMethod: 'vnpay',
                status: 'success',
                orderItems: JSON.stringify(order.orderItems), // Lấy orderItems từ đơn hàng
                totalPrice: order.totalPrice // Lấy totalPrice từ đơn hàng
            }).toString()}`);
        } else {
            res.redirect(`${process.env.FRONTEND_URL}/payment-failed?error=transaction_failed`);
        }
    } catch (error) {
        console.error('VNPAY return error:', error.message, error.stack);
        res.redirect(`${process.env.FRONTEND_URL}/payment-failed`);
    }
};


const vnpayIpn = async (req, res) => {
    try {
        const vnpayResponse = await vnpayService.verifyIpn(req.query);

        if (vnpayResponse.isSuccess) {
            // Cập nhật trạng thái đơn hàng
            await Payment.findOneAndUpdate(
                { orderId: vnpayResponse.orderId },
                { status: 'completed' }
            );

            res.status(200).json({ RspCode: '00', Message: 'Success' });
        } else {
            res.status(200).json({ RspCode: '99', Message: 'Failed' });
        }
    } catch (error) {
        console.error('VNPAY IPN error:', error.message, error.stack); // In chi tiết lỗi
        res.status(200).json({ RspCode: '99', Message: 'Failed' });
    }
};

const createPaymentUrl = async (req, res) => {
    try {
        const { orderItems, paymentMethod, user, shippingAddress, ...otherData } = req.body;

        // Tạo đơn hàng với trạng thái "chưa thanh toán"
        const orderData = {
            orderItems,
            paymentMethod,
            user,
            shippingAddress,
            ...otherData,
            isPaid: false, // Đánh dấu là chưa thanh toán
        };

        // Lưu đơn hàng vào cơ sở dữ liệu
        const newOrder = await OrderService.createOrder(orderData);

        // Sử dụng ID thực tế của đơn hàng mới tạo
        const orderId = newOrder.data._id; // Lấy ID của đơn hàng mới tạo

        // Tạo URL thanh toán VNPAY
        process.env.TZ = 'Asia/Ho_Chi_Minh';

        let date = new Date();
        let ipAddr = req.headers['x-forwarded-for'] ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            '127.0.0.1';

        const tmnCode = process.env.VNP_TMN_CODE;
        const secretKey = process.env.VNP_HASH_SECRET;
        const vnpUrl = process.env.VNP_URL;

        let vnp_Params = {};
        vnp_Params['vnp_Version'] = '2.1.0';
        vnp_Params['vnp_Command'] = 'pay';
        vnp_Params['vnp_TmnCode'] = tmnCode;
        vnp_Params['vnp_Locale'] = orderData.language || 'vn';
        vnp_Params['vnp_CurrCode'] = 'VND';
        vnp_Params['vnp_TxnRef'] = orderId; // Sử dụng ID thực tế của đơn hàng
        vnp_Params['vnp_OrderInfo'] = orderData.orderInfo || 'Thanh toán đơn hàng';
        vnp_Params['vnp_OrderType'] = orderData.orderType || 'billpayment';
        vnp_Params['vnp_Amount'] = orderData.totalPrice * 100; // Đảm bảo giá trị là VND
        vnp_Params['vnp_ReturnUrl'] = process.env.VNP_RETURN_URL;
        vnp_Params['vnp_IpAddr'] = ipAddr;
        vnp_Params['vnp_CreateDate'] = moment(date).format('YYYYMMDDHHmmss');

        // Tạo URL và chữ ký như cũ
        const redirectUrl = new URL(vnpUrl);
        const searchParams = redirectUrl.searchParams;

        Object.entries(vnp_Params)
            .sort(([key1], [key2]) => key1.localeCompare(key2))
            .forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    searchParams.append(key, value.toString());
                }
            });

        const hmac = crypto.createHmac('sha512', secretKey);
        const signed = hmac.update(Buffer.from(searchParams.toString(), 'utf-8')).digest('hex');
        searchParams.append('vnp_SecureHash', signed);

        return res.status(200).json({
            status: 'success',
            url: redirectUrl.toString(),
        });

    } catch (error) {
        console.error('Payment error:', error);
        return res.status(500).json({
            status: 'error',
            message: error.message || 'Internal Server Error'
        });
    }
};

// Hàm sắp xếp object theo key
function sortObject(obj) {
    const sorted = {};
    const keys = Object.keys(obj).sort();

    for (const key of keys) {
        if (obj[key]) {
            sorted[key] = obj[key];
        }
    }

    return sorted;
}

module.exports = {
    createPayment,
    vnpayReturn,
    vnpayIpn,
    createPaymentUrl
};
