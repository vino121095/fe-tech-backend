const User = require('../model/Usermodel');
const bcrypt = require('bcrypt');

exports.registerUser = (req, res) => {
    const { username, email, password } = req.body;

    // Basic validations
    if (!username) return res.status(400).json({ message: 'Username is required' });
    if (!email) return res.status(400).json({ message: 'Email is required' });
    if (!password) return res.status(400).json({ message: 'Password is required' });

    // Hash password
    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) return res.status(500).json({ message: 'Error hashing password', error: err });

        const newUser = {
            username,
            email,
            password: hashedPassword
        };

        User.registerUser(newUser, (err, result) => {
            if (err) {
                console.error('Error registering user:', err);
                return res.status(500).json({ message: 'Server Error', error: err });
            }
            res.status(201).json({ message: 'User registered successfully', userId: result.insertId });
        });
    });
};

exports.loginUser = (req, res) => {
    const { username, password } = req.body;

    if (!username) return res.status(400).json({ message: 'Email is required' });
    if (!password) return res.status(400).json({ message: 'Password is required' });

    User.findByUsername(username, (err, user) => {
        if (err) return res.status(500).json({ message: 'Server Error', error: err });
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Compare entered password with hashed password
        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) return res.status(500).json({ message: 'Error comparing passwords', error: err });
            if (!isMatch) return res.status(400).json({ message: 'Incorrect password' });
            const userData = {
                user_id:user.id,
                username:user.username,
                useremail:user.email,
                isAdmin:user.isAdmin,
                isLogin : true
            }
            res.status(200).json({ message: 'Login successful', userData});
        });
    });
};