const express = require('express');
const orderRoute = express.Router();

//  Order routes 
const{placeOrder, getAllOrders, getOrdersById} = require('../controller/Ordercontroller');
orderRoute.post('/placeOrder', placeOrder); //Place order
orderRoute.get('/orders', getAllOrders); // Get all orders
orderRoute.get('/userOrdersById/:id',getOrdersById ) // Get orders based on user

module.exports = orderRoute;