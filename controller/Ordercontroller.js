const Order = require('../model/Ordermodel');

// Controller function to place an order
exports.placeOrder = (req, res) => {
    const userId = req.body.userId;

    if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
    }

    Order.placeOrder(userId, (err, result) => {
        if (err) {
            console.error('Error placing order:', err);
            return res.status(500).json({ message: 'Server error', error: err });
        }
        res.status(201).json(result);
    });
};

// Controller function to get all orders
exports.getAllOrders = (req, res) => {
    Order.getAllOrders((err, orders) => {
        if (err) {
            console.error('Error retrieving orders:', err);
            return res.status(500).json({ message: 'Server Error', error: err });
        }
        res.status(200).json(orders);
    });
};

// Controller function to get orders by user ID
exports.getOrdersById = (req, res) => {
    const { id } = req.params; // Assuming userId is passed as a route parameter

    // Call the model function to get orders for the given userId
    Order.getOrdersById(id, (err, orders) => {
        if (err) {
            console.error("Error fetching orders:", err);
            return res.status(500).json({ message: "Server Error", error: err });
        }

        res.status(200).json({ orders });
    });
};