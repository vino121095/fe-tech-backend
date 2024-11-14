const express = require('express');
const route = express.Router();
const {uploadDistributorImage, uploadProductImages} = require('../middlewares/multer');

//User routes
const {registerUser, loginUser} = require('../controller/Usercontroller');
route.post('/registerUser', registerUser);
route.post('/loginUser', loginUser);

//Product routes
const { addProduct, getAllProducts, getProducts, getProductById, deleteProduct } = require('../controller/Productcontroller');
route.post('/addProduct', (req, res) => {
    uploadProductImages(req, res, (err) => {
        if (err) {
            return res.status(400).json({ message: err.message });
        }
        addProduct(req, res);
    });
});// Add new product
route.get('/getAllProducts', getAllProducts); //Get all products
route.get('/products', getProducts); // Get products for admin dashboard
route.get('/productDetail/:id', getProductById); //Get product by id for product detail
route.delete('/deleteProductById/:id', deleteProduct); // Delete product by ID

// Distributors routes
const {addDistributor, getAllDistributors, getDistributorById, deleteDistributor, updateDistributor } = require('../controller/Distributorscontroller');
route.post('/addDistributor', (req, res)=>{
    uploadDistributorImage(req, res, (err)=>{
        if(err){
            return res.status(400).json({message:err.message});
        }
        addDistributor(req, res);
    })
});// Add new distributor
route.get('/getAllDistributors', getAllDistributors); //Get all distributors
route.get('/getDistributorById/:id', getDistributorById); // Get distriboutor by id for distributor's details
route.put('/updateDistributorById/:id', (req, res) => {
    uploadDistributorImage(req, res, (err) => {
        if (err) {
            return res.status(400).json({ message: err.message });
        }
        updateDistributor(req, res);
    });
}); // update distributors details by id
route.delete('/deleteDistributorById/:id', deleteDistributor); // detele distributor by id

// cart routes
const {addProductToCart, getUserCart, updateCartQuantity, removeFromCart} = require('../controller/Addtocartcontroller');
route.post('/addtocart', addProductToCart); // Add to cart products
route.get('/user/:id', getUserCart); // Get user's cart
route.put('/update/:id', updateCartQuantity); // Update cart item quantity
route.delete('/remove/:id', removeFromCart); // Remove item from cart

//  Order routes 
const{placeOrder, getAllOrders, getOrdersById} = require('../controller/Ordercontroller');
route.post('/placeOrder', placeOrder); //Place order
route.get('/orders', getAllOrders); // Get all orders
route.get('/userOrdersById/:id',getOrdersById ) // Get orders based on user

// Shipment routes
const {getPendingShipments} = require('../controller/Shipmemtcontroller');
route.get('/getShipments', getPendingShipments);

// Transport routes 
const {addTransport, getAllTransports, getTransportById,updateTransport, deleteTransport} = require('../controller/Transportcontroller');
route.post('/addtransport', addTransport); // Add new transport
route.get('/transport', getAllTransports); // Get all transports
route.get('/transport/:id', getTransportById); // Get transport by for transport details
route.put('/updatetransport/:id', updateTransport); // Update transport
route.delete('/deletetransport/:id', deleteTransport); // Delete transport

module.exports = route;
