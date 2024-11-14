const db = require('../config/db');

// Insert new transport details
const Transport = {
    addTransport: (newTransport, callback) => {
        const transportsql = `INSERT INTO Transport (travelsName, location, driverName, contactPersonName, phoneNo, email) 
                    VALUES (?, ?, ?, ?, ?, ?)`;
        const values = [
            newTransport.travelsName,
            newTransport.location,
            newTransport.driverName,
            newTransport.contactPersonName,
            newTransport.phoneNo,
            newTransport.email
        ];

        db.query(transportsql, values, (err, result) => {
            if (err) return callback(err);
            callback(null, result);
        });
    },

    // Retrieve all transport details
    getAllTransports: (callback) => {
        const sql = `SELECT * FROM Transport`;
        db.query(sql, (err, results) => {
            if (err) return callback(err);
            callback(null, results);
        });
    },

    getTransportById: (id, callback) => {
        const sql = `SELECT * FROM Transport WHERE id = ?`;
        db.query(sql, [id], (err, result) => {
            if (err) return callback(err);
            callback(null, result[0]);
        });
    },

    // Update a transport record by ID
    updateTransport: (id, transportData, callback) => {
        // Remove the fields you don't want to update dynamically, if any
        const { ...fieldsToUpdate } = transportData;
    
        // Check if there are any fields to update
        if (Object.keys(fieldsToUpdate).length > 0) {
            // Build the SQL for updating fields
            const fields = Object.keys(fieldsToUpdate).map(field => `${field} = ?`).join(', ');
            const values = Object.values(fieldsToUpdate);
            values.push(id);
    
            // Update only the provided fields in the Transport table
            const sql = `UPDATE Transport SET ${fields} WHERE id = ?`;
            db.query(sql, values, (err, result) => {
                if (err) {
                    console.error("Error updating transport:", err);
                    return callback({ error: "Failed to update transport." });
                }
                callback(null, result);
            });
        } else {
            callback({ error: "No fields to update." });
        }
    },
    

    // Delete a travel record by ID

    deleteTransport: (id, callback) => {
        const sql = `DELETE FROM Transport WHERE id = ?`;
        db.query(sql, [id], (err, result) => {
            if (err) return callback(err);
            callback(null, result);
        });
    }

};

module.exports = Transport;