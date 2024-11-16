const AddToCart = require('../model/Addtocartmodel');

// Add a product to the cart
exports.addProductToCart = (req, res) => {
    const { productId, userId, quantity } = req.body;

    // Check for missing input
    if (!productId || !userId || !quantity) {
        return res.status(400).json({ error: "Invalid input: productId, userId, and quantity are required" });
    }

    AddToCart.addProductToCart(productId, userId, quantity, (err, result) => {
        if (err) {
            console.error("Error in addProductToCart:", err);
            // Send detailed error message to client for debugging
            return res.status(500).json({ error: "Failed to add product to cart", details: err.message });
        }
        res.status(201).json({ message: "Product added to cart successfully", result });
    });
};


exports.getUserCart = (req, res) => {
    const { id } = req.params;

    AddToCart.getUserCart(id, (err, cartItems) => {
        if (err) {
            return res.status(500).json({ error: "Failed to retrieve cart" });
        }
        if (cartItems.length === 0) {
            return res.status(404).json({ message: "No items found in the cart" });
        }
        res.status(200).json({ cartItems });
    });
};

// Update the quantity of a cart item
exports.updateCartQuantity = (req, res) => {
    const { id } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity <= 0) {
        return res.status(400).json({ error: "Invalid quantity" });
    }
    if(!id){
        return res.status(404).json({error:"Cart not found"});
    }
 
    AddToCart.updateCartQuantity(id, quantity, (err, result) => {
        if (err) {
            return res.status(500).json({ error: "Failed to update cart quantity" });
        }
        res.status(200).json({ message: "Cart quantity updated successfully", result });
    });
};

// Remove an item from the cart
exports.removeFromCart = (req, res) => {
    const { cartItemId } = req.params;

    AddToCart.removeFromCart(cartItemId, (err, result) => {
        if (err) {
            return res.status(500).json({ error: "Failed to remove item from cart" });
        }
        res.status(200).json({ message: "Item removed from cart successfully", result });
    });
};
