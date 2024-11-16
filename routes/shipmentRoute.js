const express = require('express');
const shipmentRoute = express.Router();


// Shipment routes
const {getPendingShipments} = require('../controller/Shipmemtcontroller');
shipmentRoute.get('/getShipments', getPendingShipments);

module.exports = shipmentRoute;