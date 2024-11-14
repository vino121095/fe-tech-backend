const Transport = require('../model/Transportmodel');

exports.addTransport = (req, res) => {
    const { travelsName, location, driverName, contactPersonName, phoneNo, email } = req.body;

    if (!travelsName) return res.status(400).json({ message: 'Travels name is required' });
    if (!location) return res.status(400).json({ message: 'Location is required' });
    if (!driverName) return res.status(400).json({ message: 'Driver name is required' });
    if (!contactPersonName) return res.status(400).json({ message: 'Contact person name is required' });
    if (!phoneNo) return res.status(400).json({ message: 'Phone number is required' });
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const newTransport = { travelsName, location, driverName, contactPersonName, phoneNo, email };

    Transport.addTransport(newTransport, (err, result) => {
        if (err) {
            console.error('Error adding transport details:', err);
            return res.status(500).json({ message: 'Server Error', error: err });
        }
        res.status(201).json({ message: 'Transport details added successfully', transportId: result.insertId });
    });
};

// Controller to retrieve all transport details
exports.getAllTransports = (req, res) => {
    Transport.getAllTransports((err, transports) => {
        if (err) {
            console.error('Error retrieving transport details:', err);
            return res.status(500).json({ message: 'Server Error', error: err });
        }
        res.status(200).json({transports});
    });
};

exports.getTransportById = (req, res) => {
    const {id} = req.params;
    Transport.getTransportById(id, (err, transport) => {
        if (err) {
            console.error("Error fetching transport:", err);
            return res.status(500).json({ message: "Server Error", error: err });
        }
        if (!transport) return res.status(404).json({ message: "Transport not found" });
        res.status(200).json({ transport });
    });
};

// Update a transport record by ID
exports.updateTransport = (req, res) => {
    const { id } = req.params; // Extract the ID from URL parameters
    const transportData = req.body; // Extract data to be updated from the request body

    Transport.updateTransport(id, transportData, (err, result) => {
        if (err) {
            console.error("Error updating transport:", err);
            return res.status(500).json({ message: "Server Error", error: err });
        }
        res.status(200).json({ message: "Transport updated successfully" });
    });
};

// Delete a travel record by ID

exports.deleteTransport = (req, res) => {
    const {id} = req.params;
    Transport.getTransportById(id, (err, transport) => {
        if (err) {
            console.error("Error fetching transport:", err);
            return res.status(500).json({ message: "Server Error", error: err });
        }
        if (!transport) return res.status(404).json({ message: "Transport not found" });
        Transport.deleteTransport(id, (err, result) => {
            if (err) {
                console.error("Error deleting transport:", err);
                return res.status(500).json({ message: "Server Error", error: err });
            }
            res.status(200).json({ message: "Travel deleted successfully" });
        });
        });
};
