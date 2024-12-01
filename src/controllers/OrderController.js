const OrderService = require('../services/OrderService');
const Order = require('../models/OrderProduct');

const createOrder = async (req, res) => {
    try {
        const {
            paymentMethod,
            itemsPrice,
            shippingPrice,
            fullName,
            totalPrice,
            address,
            city,
            phone,
            orderItems,
            user
        } = req.body;

        console.log('req.body', req.body);

        // Kiểm tra các trường dữ liệu là bắt buộc
        if (
            !paymentMethod || 
            !itemsPrice || 
            !fullName || 
            !totalPrice || 
            !address || 
            !city || 
            !phone || 
            !orderItems || 
            !user
        ) {
            return res.status(400).json({
                status: "error",
                message: "Các trường dữ liệu là bắt buộc"
            });
        }

        // Gọi OrderService để tạo đơn hàng
        const response = await OrderService.createOrder(req.body);
        
        // Nếu thanh toán bằng tiền mặt, chuyển hướng với orderId
        if (paymentMethod === 'later_money' && response.data) {
            return res.status(200).json({
                ...response,
                redirect: `/order-success?orderId=${response.data._id}`
            });
        }

        // Lưu thông tin đơn hàng khi thanh toán thành công
        if (paymentMethod === 'vnpay') {
            // Lưu đơn hàng vào database
            const orderData = {
                orderItems,
                shippingAddress: {
                    fullName,
                    address,
                    city,
                    phone,
                },
                paymentMethod,
                itemsPrice,
                shippingPrice,
                totalPrice,
                user,
                isPaid: true, // Đánh dấu là đã thanh toán
                paidAt: new Date(), // Thời gian thanh toán
            };
            const newOrder = await OrderService.createOrder(orderData);
            return res.status(200).json({
                status: "success",
                orderId: newOrder.data._id // Trả về orderId
            });
        }

        return res.status(200).json(response);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            status: "error",
            message: error.message || "Đã xảy ra lỗi"
        });
    }
}

const getDetailsOrder = async (req, res) => {
    try {
        const orderId = req.params.id;
        if (!orderId) {
            return res.status(404).json({
                status: "error",
                message: "Không tìm thấy đơn hàng"
            });
        }
        
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({
                status: "error",
                message: "Không tìm thấy đơn hàng"
            });
        }

        return res.status(200).json({
            status: "success",
            data: order
        });
    } catch (error) {
        console.error('Get order details error:', error);
        return res.status(500).json({
            status: "error",
            message: "Lỗi server"
        });
    }
}

const getMyOrders = async (req, res) => {
    try {
        const userId = req.params.id; // Lấy userId từ params
        const orders = await OrderService.getOrderDetails(userId); // Gọi service để lấy đơn hàng
        return res.status(200).json(orders);
    } catch (error) {
        console.error('Get my orders error:', error);
        return res.status(500).json({
            status: "error",
            message: "Lỗi khi lấy danh sách đơn hàng"
        });
    }
};

module.exports = {
    createOrder,
    getDetailsOrder,
    getMyOrders,
};
