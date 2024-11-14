const db = require('../config/db');
const crypto = require('crypto');

function generateOREDERUUID() {
  return 'ORD-' + crypto.randomUUID().slice(0, 8);
}
function generateSHIPMENTUUID() {
    return 'SHP-' + crypto.randomUUID().slice(0, 8);
  }
const Order = {
    // Place a new order
    placeOrder: (userId, callback) => {
        // First, retrieve all items from the user's cart
        const cartSql = `
          SELECT c.product_id, c.quantity, p.mrp_rate
          FROM AddToCart c
          JOIN products p ON c.product_id = p.product_id
          WHERE c.user_id = ?
        `;
      
        db.query(cartSql, [userId], (err, cartItems) => {
          if (err) return callback(err);
          if (cartItems.length === 0) {
            return callback(new Error("Cart is empty"));
          }
      
          // Calculate total amount
          let totalAmount = 0;
          cartItems.forEach(item => {
            totalAmount += item.quantity * item.mrp_rate;
          });
      
          // Generate unique order ID
          const orderId = generateOREDERUUID();
          const orderDate = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
          const status = 'Received';
      
          // Insert into Orders table
          const orderSql = `
            INSERT INTO Orders (order_id, user_id, order_date, total_amount, status)
            VALUES (?, ?, ?, ?, ?)
          `;
      
          db.query(orderSql, [orderId, userId, orderDate, totalAmount, status], (err, orderResult) => {
            if (err) {
              return callback(new Error(`Error creating order: ${err.message}`));
            }
      
            // Insert each product from cart to OrderItems table
            const orderItemsSql = `
              INSERT INTO OrderItems (order_id, product_id, quantity, price)
              VALUES ?
            `;
            const orderItemsValues = cartItems.map(item => [orderId, item.product_id, item.quantity, item.mrp_rate]);
      
            db.query(orderItemsSql, [orderItemsValues], (err) => {
              if (err) {
                return callback(new Error(`Error creating order items: ${err.message}`));
              }
      
              // Clear the cart after placing order
              const clearCartSql = `DELETE FROM AddToCart WHERE user_id = ?`;
              db.query(clearCartSql, [userId], (err) => {
                if (err) {
                  return callback(new Error(`Error clearing cart: ${err.message}`));
                }
      
                // Generate shipment ID
                const shipmentId = generateSHIPMENTUUID();
                const status = 'pending';
      
                // Insert into Shipments table
                const shipmentSql = `
                  INSERT INTO Shipments (
                    shipment_id, order_id, status, created_at
                  ) VALUES (?, ?, ?, NOW())
                `;
      
                db.query(shipmentSql, [shipmentId, orderId, status], (err, result) => {
                  if (err) {
                    return callback(new Error(`Error creating shipment: ${err.message}`));
                  }
      
                  // Insert shipment items
                  const shipmentItemsSql = `
                    INSERT INTO ShipmentItems (
                      shipment_id, product_id, quantity, price
                    ) VALUES ?
                  `;
                  const shipmentItemsValues = cartItems.map(item => [
                    shipmentId, item.product_id, item.quantity, item.mrp_rate
                  ]);
      
                  db.query(shipmentItemsSql, [shipmentItemsValues], (err) => {
                    if (err) {
                      return callback(new Error(`Error creating shipment items: ${err.message}`));
                    }
                    callback(null, {
                      message: 'Order placed successfully',
                      order_id: orderId,
                      shipment_id: shipmentId
                    });
                  });
                });
              });
            });
          });
        });
      },

    // Get all orders
    getAllOrders: (callback) => {
        const ordersSql = `
            SELECT 
                o.order_id, o.user_id, u.username, o.order_date, o.total_amount, o.status, 
                oi.product_id, oi.quantity, oi.price,
                p.name AS product_name,
                GROUP_CONCAT(pi.image_path ORDER BY pi.id ASC SEPARATOR ',') AS images
            FROM 
                Orders o
            LEFT JOIN
                user u ON o.user_id = u.id
            LEFT JOIN 
                OrderItems oi ON o.order_id = oi.order_id
            LEFT JOIN 
                products p ON oi.product_id = p.product_id
            LEFT JOIN 
                product_images pi ON p.product_id = pi.product_id
            
             GROUP BY 
                o.order_id, oi.product_id
            ORDER BY 
                o.order_date DESC;
        `;
    
        db.query(ordersSql, (err, results) => {
            if (err) return callback(err);
    
            // Group items by order
            const orders = results.reduce((acc, row) => {
                const { 
                    order_id, user_id, username, order_date, total_amount, status, 
                    product_id, quantity, price, product_name, images 
                } = row;
    
                if (!acc[order_id]) {
                    acc[order_id] = {
                        order_id,
                        user_id,
                        username,
                        order_date,
                        total_amount,
                        status,
                        items: []
                    };
                }
    
                // Push items with first image into the order
                const firstImage = images ? images.split(',')[0] : null;
                acc[order_id].items.push({ 
                    product_id, 
                    quantity, 
                    price, 
                    product_name, 
                    firstImage 
                });
    
                return acc;
            }, {});
    
            // Convert object to array of orders
            callback(null, Object.values(orders));
        });
    },

    // Get orders by user ID
    getOrdersById: (userId, callback) => {
        const ordersSql = `
            SELECT 
                o.order_id, o.user_id, o.order_date, o.total_amount, o.status, 
                oi.product_id, oi.quantity, oi.price,
                p.name AS product_name,
                GROUP_CONCAT(pi.image_path ORDER BY pi.id ASC SEPARATOR ',') AS images
            FROM 
                Orders o
            LEFT JOIN 
                OrderItems oi ON o.order_id = oi.order_id
            LEFT JOIN 
                products p ON oi.product_id = p.product_id
            LEFT JOIN 
                product_images pi ON p.product_id = pi.product_id
            WHERE 
                o.user_id = ?
            GROUP BY 
                o.order_id, oi.product_id
            ORDER BY 
                o.order_date DESC;
        `;
    
        db.query(ordersSql, [userId], (err, results) => {
            if (err) return callback(err);
    
            // Group items by order
            const orders = results.reduce((acc, row) => {
                const { 
                    order_id, user_id, order_date, total_amount, status, 
                    product_id, quantity, price, product_name, images 
                } = row;
    
                if (!acc[order_id]) {
                    acc[order_id] = {
                        order_id,
                        user_id,
                        order_date,
                        total_amount,
                        status,
                        items: []
                    };
                }
    
                // Push items with first image into the order
                const firstImage = images ? images.split(',')[0] : null;
                acc[order_id].items.push({ 
                    product_id, 
                    quantity, 
                    price, 
                    product_name, 
                    firstImage 
                });
    
                return acc;
            }, {});
    
            // Convert object to array of orders
            callback(null, Object.values(orders));
        });
    }
};

module.exports = Order;