const User = require('../models/UserModel');
const bcrypt = require('bcryptjs'); // Thay đổi từ bcrypt sang bcryptjs
const jwt = require('jsonwebtoken');
const { genneralAccessToken, genneralRefreshToken } = require('./JwtService');
const Order = require('../models/OrderProduct'); // File OrderProduct
const Product = require('../models/ProductModel'); // File ProductModel

const createOrder = (newOrder) => {
    console.log('Dữ liệu nhận từ frontend:', newOrder);
    return new Promise(async (resolve, reject) => {
        const { orderItems, paymentMethod, itemsPrice, shippingPrice, fullName, totalPrice, address, city, phone, user } = newOrder;
        try {
            const promises = orderItems.map(async (order) => {
                const productData = await Product.findOneAndUpdate(
                    {
                        _id: order.product,
                        countInStock: { $gte: order.amount },
                    },
                    {
                        $inc: {
                            countInStock: -order.amount,
                            selled: +order.amount
                        }
                    },
                    { new: true }
                );
                
                if (productData) {
                    const createdOrder = await Order.create({
                        orderItems,
                        shippingAddress: {
                            fullName,
                            address,
                            city,
                            phone
                        },
                        paymentMethod,
                        itemsPrice,
                        shippingPrice,
                        totalPrice,
                        user: user,
                    });
                    
                    if (createdOrder) {
                        return {
                            status: "200",
                            message: "Tạo thành công Order mới",
                            data: createdOrder
                        }
                    }
                }
                return {
                    status: "ERR",
                    message: "Sản phẩm không đủ hàng"
                }
            });

            const results = await Promise.all(promises);
            const newData = results.filter(item => item.status === "ERR");
            
            if (newData.length) {
                resolve({
                    status: "ERR",
                    message: `San pham voi id ${newData.join(",")} da het hang`
                })
            } else {
                resolve({
                    status: "OK",
                    message: 'success',
                    data: results[0].data
                })
            }
        } catch (error) {
            reject(error);
        }
    })
}

const getOrderDetails = (userId) => {
    return new Promise(async (resolve, reject) => {
        try {
            const orders = await Order.find({ user: userId });
            if (!orders.length) {
                resolve({
                    status: 404,
                    message: "Không có đơn hàng nào trong cơ sở dữ liệu"
                });
                return;
            }
            resolve({
                status: 200,
                message: "Lấy thông tin thành công",
                data: orders
            });
        } catch (error) {
            reject({
                status: 500,
                message: "Lỗi khi lấy danh sách đơn hàng",
                error: error.message
            });
        }
    });
};


module.exports = {
    createOrder,
    getOrderDetails,
};