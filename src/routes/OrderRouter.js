const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/OrderController');
const { authUserMiddleWare } = require('../middleware/authMiddleware');
// const authMiddleware = require('../middleware/authMiddleware')

//Bộ định tuyến gọi test api
router.post('/create',authUserMiddleWare, OrderController.createOrder);

router.get('/get-order-details/:id',authUserMiddleWare, OrderController.getDetailsOrder);


module.exports = router;