const express = require('express');
const router = express.Router();
const { userRegistrationValidationRules, userLoginValidationRules, validateUser } = require('../valitadors/UserValidator');
const userController = require('../controller/Usercontroller');

// Register route
router.post('/registerUser', userRegistrationValidationRules(), validateUser, userController.registerUser);

// Login route
router.post('/loginUser', userLoginValidationRules(), validateUser, userController.loginUser);

module.exports = router;
