const OrderService = require('../services/OrderService');

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
        return res.status(200).json(response);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            status: "error",
            message: error.message || "Đã xảy ra lỗi"
        });
    }
}

const getDetailsOrder = async (req,res) => {
    try {
        const userId = req.params.id;
        if(!userId) {
            return res.status(404).json({
                status: "error",
                message: "Không tìm User"
            });
        }
        
        //Truyền req.body sang UserService gán vào newUser
        const response = await OrderService.getOrderDetails(userId);
        return res.status(200).json(response);
    } catch (error) {
        return res.status(404).json({
            mesage: error
        });
    }
}

module.exports = {
    createOrder,
    getDetailsOrder,
};
