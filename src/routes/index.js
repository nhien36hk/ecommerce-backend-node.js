const express = require('express');
const cors = require('cors');
const UserRouter = require('./UserRouter');
const ProductRouter = require('./ProductRouter');
const PaymentRouter = require('./PaymentRouter'); // Import PaymentRouter
const OrderRouter = require('./OrderRouter');

const routes = (app) => {
    app.use(cors({
        origin: 'https://ecommerce-frontend-react-omega.vercel.app/',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'token'],
        credentials: true,
        exposedHeaders: ['Content-Length', 'X-Foo', 'X-Bar']
    }));
    app.use('/api/user', UserRouter);
    app.use('/api/product', ProductRouter);
    app.use('/api/payment', PaymentRouter);
    app.use('/api/order', OrderRouter);
    app.options('*', cors());
}

module.exports = routes;