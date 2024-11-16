const express = require('express');
const router = express.Router();
const {addToCartValidationRules, validateAddtocart, updateCartValidator} = require('../valitadors/AddtocartValidator');

// cart routes
const Addtocartcontroller = require('../controller/Addtocartcontroller');

router.post('/addtocart', addToCartValidationRules(), validateAddtocart, Addtocartcontroller.addToCart); // Add to cart products

router.get('/user/:id', Addtocartcontroller.getCartItems); // Get user's cart

router.put('/update/:id', updateCartValidator(), validateAddtocart, Addtocartcontroller.updateCartQuantity); // Update cart item quantity

router.delete('/remove/:id', Addtocartcontroller.removeFromCart); // Remove item from cart

module.exports = router;