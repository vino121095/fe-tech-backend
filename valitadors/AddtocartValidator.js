const { param, body, validationResult } = require('express-validator');

const addToCartValidationRules =()=>{return[
  body('user_id')
    .notEmpty()
    .withMessage('User ID is required.')
    .isNumeric()
    .withMessage('User ID must be an number.'),
  
  body('product_id')
    .notEmpty()
    .withMessage('Product ID is required.')
    .isString()
    .withMessage('Product ID must be a string.'),
  
  body('quantity')
    .notEmpty()
    .withMessage('Quantity is required.')
    .isNumeric({ min: 1 })
    .withMessage('Quantity must be an number greater than 0.'),
]};

const updateCartValidator = ()=>{ return[
    param('id')
      .isNumeric()
      .withMessage('Cart ID must be an Numbers.'),
    body('quantity')
      .isNumeric({ min: 1 })
      .withMessage('Quantity must be an integer greater than 0.')
  ]};
  

const validateAddtocart = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  };

module.exports = {addToCartValidationRules, updateCartValidator, validateAddtocart};
