const db = require('../config/db');
const path = require('path');
const fs = require('fs');
const Distributor = {
    // Add new distributor model
    addDistributor: (distributor, callback) => {
        const distributorSql = `
            INSERT INTO distributors 
            (companyname, location, gstnumber, creditlimit, contact_person_name, phoneno, emailid) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        const distributorValues = [
            distributor.companyname, distributor.location, distributor.gstnumber,
            distributor.creditlimit, distributor.contact_person_name, 
            distributor.phoneno, distributor.emailid
        ];

        // Insert distributor details
        db.query(distributorSql, distributorValues, (err, result) => {
            if (err) return callback(err);

            const distributorId = result.insertId; // Use the default MySQL-generated ID

            // Insert image if provided
            if (distributor.image) {
                const imageSql = 'INSERT INTO distributor_images (distributor_id, image_path) VALUES (?, ?)';
                db.query(imageSql, [distributorId, distributor.image], callback);
            } else {
                callback(null, { distributor_id: distributorId });
            }
        });
    },

    // Get all distributors with the image for listing
    getAllDistributors: (callback) => {
        const sql = `
            SELECT distributors.id AS distributor_id, distributors.gstnumber, distributors.emailid, distributors.creditlimit, distributors.contact_person_name, distributors.phoneno, distributors.companyname, distributors.location, MIN(distributor_images.image_path) AS company_image
            FROM distributors
            LEFT JOIN distributor_images ON distributors.id = distributor_images.distributor_id
            GROUP BY distributors.id
        `;

        db.query(sql, (err, results) => {
            if (err) return callback(err);
            callback(null, results);
        });
    },

    // Get a particular distributor by ID
    getDistributorById: (distributorId, callback) => {
        const sql = `
            SELECT 
                d.id AS distributor_id,
                d.companyname,
                d.location,
                d.gstnumber,
                d.creditlimit,
                d.contact_person_name,
                d.phoneno,
                d.emailid,
                GROUP_CONCAT(di.image_path ORDER BY di.id ASC SEPARATOR ',') AS images
            FROM 
                distributors d
            LEFT JOIN 
                distributor_images di ON d.id = di.distributor_id
            WHERE 
                d.id = ?
            GROUP BY 
                d.id;
        `;
        db.query(sql, [distributorId], (err, results) => {
            if (err) return callback(err);
            callback(null, results[0]);
        });
    },
    updateDistributor: (distributorId, updateData, callback) => {
        const { image, ...fieldsToUpdate } = updateData;
    
        // Only proceed if there are fields to update
        if (Object.keys(fieldsToUpdate).length > 0) {
            // Build the SQL for updating fields
            const fields = Object.keys(fieldsToUpdate).map(field => `${field} = ?`).join(', ');
            const values = Object.values(fieldsToUpdate);
            values.push(distributorId);
    
            // Update the main fields in the distributors table
            const sql = `UPDATE distributors SET ${fields} WHERE id = ?`;
            db.query(sql, values, (err, result) => {
                if (err) {
                    console.error("Error updating distributor:", err);
                    return callback({ error: "Failed to update distributor." });
                }
    
                // Handle image update if provided
                if (image) {
                    updateDistributorImage(distributorId, image, callback);
                } else {
                    callback(null, { message: "Distributor updated successfully" });
                }
            });
        } else if (image) {
            // If only the image is to be updated
            updateDistributorImage(distributorId, image, callback);
        } else {
            // No fields provided to update
            callback(null, { message: "No updates provided for distributor." });
        }
    
        function updateDistributorImage(distributorId, image, callback) {
            // First, find the existing image
            const findImageSql = 'SELECT image_path FROM distributor_images WHERE distributor_id = ?';
            db.query(findImageSql, [distributorId], (err, result) => {
                if (err) {
                    console.error("Error finding existing image:", err);
                    return callback({ error: "Failed to find distributor image." });
                }
        
                // If an old image exists, delete it from the server
                if (result[0] && result[0].image_path) {
                    const oldImagePath = path.join(__dirname, '..', result[0].image_path);
                    fs.unlink(oldImagePath, (unlinkErr) => {
                        if (unlinkErr) {
                            console.warn("Failed to delete old image:", unlinkErr);
                        }
                    });
                }
        
                // Now update the image
                const updateImageSql = `
                    UPDATE distributor_images
                    SET image_path = ?
                    WHERE distributor_id = ?
                `;
        
                db.query(updateImageSql, [image, distributorId], (err, result) => {
                    if (err) {
                        console.error("Error updating distributor image:", err);
                        return callback({ error: "Failed to update distributor image." });
                    }
        
                    // If no rows were updated, it means the distributor doesn't have an image record
                    if (result.affectedRows === 0) {
                        return callback({ error: "No image record found for the distributor." });
                    }
        
                    callback(null, { message: "Distributor image updated successfully" });
                });
            });
        }
        
    },
     
    deleteDistributor : (distributorId, callback)=>{
        // First, find the image associated with the distributor
        const findImageSql = 'SELECT image_path FROM distributor_images WHERE distributor_id = ?';
        db.query(findImageSql, [distributorId], (err, result) => {
            if (err) {
                console.error("Error finding distributor image:", err);
                return callback({ error: "Failed to find distributor image." });
            }
    
            // If an old image exists, delete it from the server
            if (result[0] && result[0].image_path) {
                const oldImagePath = path.join(__dirname, '..', result[0].image_path);
                fs.unlink(oldImagePath, (unlinkErr) => {
                    if (unlinkErr) {
                        console.warn("Failed to delete old image:", unlinkErr);
                    }
                });
            }
    
            // Now, delete the image record from the database
            const deleteImageSql = 'DELETE FROM distributor_images WHERE distributor_id = ?';
            db.query(deleteImageSql, [distributorId], (err) => {
                if (err) return callback(err);
    
                // Now, delete the distributor record from the database
                const deleteDistributorSql = 'DELETE FROM distributors WHERE id = ?';
                db.query(deleteDistributorSql, [distributorId], (err, result) => {
                    if (err) return callback(err);
                    callback(null, { message: 'Distributor and image deleted successfully' });
                });
            });
        });
    }
    
    
};

module.exports = Distributor;
