// controllers/ShipmentController.js
const Shipment = require('../model/Shipmentmodel');

exports.createPendingShipment = (req, res) => {
    const { order_id } = req.body;

    if (!order_id) {
        return res.status(400).json({ message: 'Order ID is required' });
    }

    Shipment.createPendingShipment(order_id, (err, result) => {
        if (err) {
            console.error('Error creating pending shipment:', err);
            return res.status(500).json({ message: 'Server error', error: err.message });
        }
        res.status(201).json(result);
    });
};

exports.updateShipmentDetails = (req, res) => {
    const { shipment_id } = req.params;
    const shipmentData = {
        distributor_id: req.body.distributor_id,
        transport_id: req.body.transport_id,
        dispatch_date: req.body.dispatch_date,
        dispatch_address: req.body.dispatch_address,
        tracking_number: req.body.tracking_number
    };

    // Validate required fields
    const requiredFields = ['distributor_id', 'transport_id', 'dispatch_date', 'dispatch_address'];
    const missingFields = requiredFields.filter(field => !shipmentData[field]);

    if (missingFields.length > 0) {
        return res.status(400).json({ 
            message: 'Missing required fields', 
            fields: missingFields 
        });
    }

    Shipment.updateShipmentDetails(shipment_id, shipmentData, (err, result) => {
        if (err) {
            console.error('Error updating shipment:', err);
            return res.status(500).json({ message: 'Server error', error: err.message });
        }
        res.json(result);
    });
};

exports.getPendingShipments = (req, res) => {
    Shipment.getPendingShipments((err, shipments) => {
        if (err) {
            console.error('Error retrieving pending shipments:', err);
            return res.status(500).json({ message: 'Server error', error: err.message });
        }
        res.json(shipments);
    });
};

exports.getShipmentDetails = (req, res) => {
    const { shipment_id } = req.params;

    Shipment.getShipmentDetails(shipment_id, (err, shipment) => {
        if (err) {
            if (err.message === 'Shipment not found') {
                return res.status(404).json({ message: err.message });
            }
            console.error('Error retrieving shipment details:', err);
            return res.status(500).json({ message: 'Server error', error: err.message });
        }
        res.json(shipment);
    });
};