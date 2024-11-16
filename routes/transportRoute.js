const express = require('express');
const transportRoute = express.Router();


// Transport routes 
const {addTransport, getAllTransports, getTransportById,updateTransport, deleteTransport} = require('../controller/Transportcontroller');
transportRoute.post('/addtransport', addTransport); // Add new transport
transportRoute.get('/transport', getAllTransports); // Get all transports
transportRoute.get('/transport/:id', getTransportById); // Get transport by for transport details
transportRoute.put('/updatetransport/:id', updateTransport); // Update transport
transportRoute.delete('/deletetransport/:id', deleteTransport); // Delete transport


module.exports = transportRoute;