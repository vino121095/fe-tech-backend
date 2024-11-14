const db = require('../config/db');
const path = require('path');
const fs = require('fs');
const Product = {
    //add new product model
    addProduct: (product, callback) => {
        const productSql = `
            INSERT INTO products 
            (name, mrp_rate, technicians_rate, distributors_rate, brand_name, product_description, stocks, how_to_use, composision, item_details, organization_name) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const productValues = [
            product.name, product.mrp_rate, product.technicians_rate,
            product.distributors_rate, product.brand_name, product.product_description,
            product.stocks, product.how_to_use, product.composision, product.item_details, product.organization_name
        ];

        // Insert product details
        db.query(productSql, productValues, (err, result) => {
            if (err) return callback(err);

            const lastInsertedId = result.insertId;
            const customId = 'FE' + lastInsertedId.toString().padStart(2, '0');

            // Update to set custom product_id like FE01
            const updateSql = `
                UPDATE products
                SET product_id = ?
                WHERE id = ?
            `;
            db.query(updateSql, [customId, lastInsertedId], (err) => {
                if (err) return callback(err);

                // Insert images
                if (product.images && product.images.length > 0) {
                    const imageSql = 'INSERT INTO product_images (product_id, image_path) VALUES ?';
                    const imageValues = product.images.map(image => [customId, image]);

                    db.query(imageSql, [imageValues], callback);
                } else {
                    callback(null, { product_id: customId });
                }
            });
        });
    },

    //get all products with the first image and details for product add to cart list page
    getAllProducts: (callback) => {
        const sql = `
        SELECT 
        products.id,
        products.product_id, 
        products.name, 
        products.mrp_rate, 
        products.brand_name, 
        MIN(product_images.image_path) AS first_image
        FROM products
        LEFT JOIN product_images ON products.product_id = product_images.product_id
        GROUP BY products.id, products.product_id, products.name, products.mrp_rate, products.brand_name
`;


        db.query(sql, (err, results) => {
            if (err) return callback(err);
            callback(null, results);
        });
    },

    getProducts : (callback)=>{
        const sql =`
            SELECT products.product_id, products.name, products.organization_name, products.mrp_rate, products.technicians_rate, products.distributors_rate , MIN(product_images.image_path) AS first_image
            FROM products
            LEFT JOIN product_images ON products.product_id = product_images.product_id
            GROUP BY products.product_id
        `;
        db.query(sql, (err, results)=>{
            if(err) return callback(err);
            callback(null, results)
        });
    },
    // p means products table and pi means product_images table
    //  get a particular product by id

    getProductById: (productId, callback) => {
        const sql = `
            SELECT 
                p.product_id,
                p.name,
                p.mrp_rate,
                p.product_description,
                p.stocks,
                p.how_to_use,
                p.composision,
                p.item_details,
                GROUP_CONCAT(pi.image_path ORDER BY pi.id ASC SEPARATOR ',') AS images
            FROM 
                products p
            LEFT JOIN 
                product_images pi ON p.product_id = pi.product_id
            WHERE 
                p.product_id = ?
            GROUP BY 
                p.product_id;
        `;
        db.query(sql, [productId], (err, results) => {
            if (err) return callback(err);
            callback(null, results[0]);
        });
    },

    deleteProduct: (productId, callback) => {
        const formattedProductId = 'FE' + productId; 
        // First, find all images associated with the product
        const findImageSql = 'SELECT image_path FROM product_images WHERE product_id =?';
        db.query(findImageSql, [formattedProductId], (err, result) => {
            if (err) {
                console.error("Error finding product images:", err);
                return callback({ error: "Failed to find product images." });
            }
    
            // If product images exist, delete them from the server
            if (result.length > 0) {
                result.forEach(imageRecord => {
                    const oldImagePath = path.join(__dirname, '..', imageRecord.image_path);
                    fs.unlink(oldImagePath, (unlinkErr) => {
                        if (unlinkErr) {
                            console.warn(`Failed to delete image ${imageRecord.image_path}:`, unlinkErr);
                        } else {
                            console.log(`Deleted image: ${imageRecord.image_path}`);
                        }
                    });
                });
            } else {
                console.log("No images found for the product to delete.");
            }
    
            // Now, delete the image records from the database
            const deleteImagesSql = 'DELETE FROM product_images WHERE product_id = ?';
            db.query(deleteImagesSql, [productId], (err) => {
                if (err) {
                    console.error("Error deleting product images from database:", err);
                    return callback({ error: "Failed to delete product images from database." });
                }
    
                // Now, delete the product record from the database
                const deleteProductSql = 'DELETE FROM products WHERE id = ?';
                db.query(deleteProductSql, [productId], (err, result) => {
                    if (err) {
                        console.error("Error deleting product from database:", err);
                        return callback({ error: "Failed to delete product from database." });
                    }
                    callback(null, { message: 'Product and images deleted successfully' });
                });
            });
        });
    }
    

};

module.exports = Product;
