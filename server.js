const express = require('express');
const cors = require('cors');
const session = require('express-session');
const db = require('./config/db.js');
require('dotenv').config(); 
const path = require('path');

const app = express();

app.use(express.urlencoded({extended : true}));
app.use(express.json());
app.use(cors());

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(
  session({
    secret: process.env.ACCESS_SECRET_TOKEN, 
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } 
  })
);

(async () => {
    await db.sync();
    console.log('Table created successfully');
})();

// Root route
app.get('/', (req, res) => {
    res.send('Welcome');
});

// Post route
app.post('/', (req, res) => {
    res.send('Post request submitted');
});

// Transport Route
// const TransportRoutes = require('./routes/TransportRoutes');
// app.use('/api', TransportRoutes);

// Product Route
const ProductRoutes = require('./routes/productRoutes.js');
app.use('/api', ProductRoutes);

// User routes
const UserRoutes = require('./routes/userRoutes.js');
app.use('/api', UserRoutes);

// Distributors routes
const DistributorRoutes = require('./routes/distributorRoutes.js');
app.use('/api', DistributorRoutes);

// Cart routes
const AddToCartRoutes = require('./routes/AddToCartRoutes.js');
app.use('/api', AddToCartRoutes);

// Listen on the port from the .env file
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});