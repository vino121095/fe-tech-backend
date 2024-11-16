const User = require('../model/Usermodel');
const Products = require('../model/Productmodel');
const AddToCart = require('../model/AddToCartModel');

// Add a product to the cart
exports.addToCart = async (req, res) => {
  const { user_id, product_id, quantity } = req.body;
  try {
    const user = await User.findByPk(user_id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    const product = await Products.findOne({ where: { product_id: product_id }});
    if (!product) {
    return res.status(404).json({ message: 'Product not found.' });
    }
    const cartItem = await AddToCart.create({ user_id, product_id, quantity });
    return res.status(201).json(cartItem);
  } catch (error) {
    return res.status(500).json({ message: 'Error adding to cart.', error });
  }
};

// Get all cart items for a user
exports.getCartItems = async (req, res) => {
    const user_id = req.params.id;
  
    try {
      // Fetch cart items with related User and Product data
      const cartItems = await AddToCart.findAll({
        where: { user_id: user_id },
        include: [
          { 
              model: User, 
              as: 'user', // Ensure the alias matches the one in associations
              attributes: ['uid', 'username'] 
          },
          { 
              model: Products, 
              as: 'product', // Ensure the alias matches the one in associations
              attributes: ['product_id', 'product_name', 'mrp_rate'] 
          },
        ],
        raw: true, // Get plain data (without Sequelize model instances)
      });
  
      if (cartItems.length === 0) {
        return res.status(404).json({ message: 'No cart items found for this user.' });
      }
  
      return res.status(200).json(cartItems); // Return the cart items
    } catch (error) {
      console.error(error); // Log the error for debugging
      return res.status(500).json({ message: 'Error fetching cart items.', error: error.message });
    }
  };
  

// Update cart item quantity
exports.updateCartQuantity = async (req, res) => {
  const cart_id = req.params.id;
  const { quantity } = req.body;

  try {
    const cartItem = await AddToCart.findByPk(cart_id);
    if (!cartItem) {
      return res.status(404).json({ message: 'Cart item not found.' });
    }

    cartItem.quantity = quantity;
    await cartItem.save();

    return res.status(200).json(cartItem);
  } catch (error) {
    return res.status(500).json({ message: 'Error updating cart item.', error });
  }
};

// Remove a product from the cart
exports.removeFromCart = async (req, res) => {
  const cart_id = req.params.id;

  try {
    const cartItem = await AddToCart.findByPk(cart_id);
    if (!cartItem) {
      return res.status(404).json({ message: 'Cart item not found.' });
    }

    await cartItem.destroy();
    return res.status(200).json({ message: 'Cart item removed.' });
  } catch (error) {
    return res.status(500).json({ message: 'Error removing cart item.', error });
  }
};

