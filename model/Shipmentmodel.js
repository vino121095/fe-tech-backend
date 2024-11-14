// models/ShipmentModel.js
const db = require('../config/db');

const Shipment = {
    // Create initial pending shipment
    // createPendingShipment: (orderId, callback) => {
    //     // First, get order items
    //     const orderItemsSql = `
    //         SELECT oi.product_id, oi.quantity, oi.price
    //         FROM OrderItems oi
    //         WHERE oi.order_id = ?
    //     `;

    //     db.query(orderItemsSql, [orderId], (err, orderItems) => {
    //         if (err) return callback(err);
    //         if (orderItems.length === 0) return callback(new Error("No order items found"));

    //         // Generate shipment ID
    //         const shipmentId = `SHP${Date.now()}`;
    //         const status = 'pending';

    //         // Insert into Shipments table
    //         const shipmentSql = `
    //             INSERT INTO Shipments (
    //                 shipment_id, order_id, status, created_at
    //             ) VALUES (?, ?, ?, NOW())
    //         `;

    //         db.query(shipmentSql, [shipmentId, orderId, status], (err, result) => {
    //             if (err) return callback(err);

    //             // Insert shipment items
    //             const shipmentItemsSql = `
    //                 INSERT INTO ShipmentItems (
    //                     shipment_id, product_id, quantity, price
    //                 ) VALUES ?
    //             `;
    //             const shipmentItemsValues = orderItems.map(item => 
    //                 [shipmentId, item.product_id, item.quantity, item.price]
    //             );

    //             db.query(shipmentItemsSql, [shipmentItemsValues], (err) => {
    //                 if (err) return callback(err);
    //                 callback(null, { 
    //                     message: 'Pending shipment created successfully', 
    //                     shipment_id: shipmentId 
    //                 });
    //             });
    //         });
    //     });
    // },

    // Update shipment with details
    updateShipmentDetails: (shipmentId, shipmentData, callback) => {
        const updateSql = `
            UPDATE Shipments 
            SET 
                distributor_id = ?,
                transport_id = ?,
                dispatch_date = ?,
                dispatch_address = ?,
                tracking_number = ?,
                status = 'Shipment'
            WHERE shipment_id = ?
        `;

        db.query(updateSql, [
            shipmentData.distributor_id,
            shipmentData.transport_id,
            shipmentData.dispatch_date,
            shipmentData.dispatch_address,
            shipmentData.tracking_number,
            shipmentId
        ], (err, result) => {
            if (err) return callback(err);

            // Update order status to 'shipping'
            const updateOrderSql = `
                UPDATE Orders o
                JOIN Shipments s ON o.order_id = s.order_id
                SET o.status = 'shipping'
                WHERE s.shipment_id = ?
            `;

            db.query(updateOrderSql, [shipmentId], (err) => {
                if (err) return callback(err);
                callback(null, { 
                    message: 'Shipment updated successfully',
                    shipment_id: shipmentId
                });
            });
        });
    },

    // Get pending shipments
    getPendingShipments: (callback) => {
        const sql = `
           SELECT 
                s.shipment_id,
                s.order_id,
                s.status as shipment_status,
                o.status as order_status,
                o.order_date,
                o.total_amount,
                GROUP_CONCAT(
                    CONCAT(
                        '{"product_id":"', si.product_id,
                        '","quantity":', si.quantity,
                        ',"price":', si.price,
                        ',"product_name":"', REPLACE(p.name, '"', '\\"'), '"}'
                    )
                ) as items
            FROM Shipments s
            JOIN Orders o ON s.order_id = o.order_id
            JOIN ShipmentItems si ON s.shipment_id = si.shipment_id
            JOIN products p ON si.product_id = p.product_id
            WHERE s.status = 'pending'
            GROUP BY s.shipment_id
            ORDER BY s.created_at DESC;
        `;

        db.query(sql, (err, results) => {
            if (err) return callback(err);

            // Parse the items JSON string for each shipment
            const shipments = results.map(row => ({
                ...row,
                items: JSON.parse(`[${row.items}]`)
            }));

            callback(null, shipments);
        });
    },

    // Get shipment details
    getShipmentDetails: (shipmentId, callback) => {
        const sql = `
            SELECT 
                s.shipment_id,
                s.order_id,
                s.status as shipment_status,
                s.distributor_id,
                s.transport_id,
                s.dispatch_date,
                s.dispatch_address,
                s.tracking_number,
                o.status as order_status,
                o.order_date,
                o.total_amount,
                d.distributor_name,
                t.transport_name,
                GROUP_CONCAT(
                    JSON_OBJECT(
                        'product_id', si.product_id,
                        'quantity', si.quantity,
                        'price', si.price,
                        'product_name', p.name
                    )
                ) as items
            FROM Shipments s
            JOIN Orders o ON s.order_id = o.order_id
            JOIN ShipmentItems si ON s.shipment_id = si.shipment_id
            JOIN products p ON si.product_id = p.product_id
            LEFT JOIN distributors d ON s.distributor_id = d.distributor_id
            LEFT JOIN transport t ON s.transport_id = t.transport_id
            WHERE s.shipment_id = ?
            GROUP BY s.shipment_id
        `;

        db.query(sql, [shipmentId], (err, results) => {
            if (err) return callback(err);
            if (results.length === 0) return callback(new Error('Shipment not found'));

            // Parse the items JSON string
            const shipment = {
                ...results[0],
                items: JSON.parse(`[${results[0].items}]`)
            };

            callback(null, shipment);
        });
    }
};

module.exports = Shipment;

