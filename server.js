require('dotenv').config();
const express = require('express');
const app = express();
const cors =require('cors');
const path = require('path');
const router = require('./routes/route');
const db = require('./config/db');
const port = process.env.PORT || 5001;

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(express.urlencoded({extended:true}));
app.use(express.json());

app.use(cors());
//routes
app.use('/rim',router);
//db conncetion
app.set('db', db);

// server port
app.listen(port, () => {
   console.log(`Server running on ${port}`);
});
