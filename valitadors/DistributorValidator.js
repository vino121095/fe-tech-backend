const { body, validationResult } = require('express-validator');

const distributorValidationRules = () => {
  return [
    body('companyname')
      .notEmpty().withMessage('Company name is required.'),
    body('location')
      .notEmpty().withMessage('Location is required'),
    body('gstnumber')
      .notEmpty().withMessage('GST Number is required'),
    body('creditlimit')
      .notEmpty().withMessage('Credit limit is required')
      .isFloat({ min: 0 }).withMessage('Credit limit must be a valid positive number.'),
    body('contact_person_name')
      .notEmpty().withMessage('Contact person name is required'),
    body('phoneno')
      .notEmpty().withMessage('Phone number is required')
      .isLength({ min: 10, max: 15 }).withMessage('Phone number should be between 10 and 15 digits.')
      .isNumeric().withMessage('Phone number must contain only digits.'),
    body('email')
      .notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Email must be a valid email address.'),
    body('image')
      .custom((value, { req }) => !!req.file)
      .withMessage('Please upload an image file.')
  ];
};


const validateDistributor = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

module.exports = {
  distributorValidationRules,
  validateDistributor
};
