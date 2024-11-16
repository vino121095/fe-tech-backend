const Distributor = require('../model/Distributorsmodel');
const DistributorImage = require('../model/DistributorImagesmodel');
const { uploadDistributorImage } = require('../middlewares/multer');
const { Op } = require('sequelize');


// Add a new distributor with an image
exports.addDistributor = async (req, res) => {
        try {
            // Create the distributor
            const distributor = await Distributor.create(req.body);

            if (req.file) {
                await DistributorImage.create({
                    distributor_id: distributor.did,
                    image_path: req.file.path
                });
            }

            res.status(201).json({ message: 'Distributor added successfully', distributor });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
};

// Get all distributors
exports.getAllDistributors = async (req, res) => {
    try {
        const distributors = await Distributor.findAll({
            include: [
                { model: DistributorImage,
                    as: 'image',        
                    attributes: ['image_path'],  
                 }
            ]
        });
        res.status(200).json(distributors);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get a distributor by ID
exports.getDistributorById = async (req, res) => {
    try {
        const distributor = await Distributor.findByPk(req.params.id, {
            include: [
                { model: DistributorImage,
                    as: 'image',        
                    attributes: ['image_path'],  
                 }
            ]
        });
        if (distributor) {
            res.status(200).json(distributor);
        } else {
            res.status(404).json({ message: 'Distributor not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update a distributor
exports.updateDistributor = async (req, res) => {
    try {
        const distributorId = req.params.id;
        const distributor = await Distributor.findOne({ where: { did: distributorId } });
        if (!distributor) {
            return res.status(404).json({ message: 'Distributor not found' });
        }
        await distributor.update(req.body);
        if (req.file) {
            const existingImage = await DistributorImage.findOne({ where: { distributor_id: distributorId } });
            if (existingImage && existingImage.image_path) {
                const oldImagePath = path.join(__dirname, '..', existingImage.image_path);
                fs.unlink(oldImagePath, (err) => {
                    if (err) {
                        console.error('Error deleting old distributor image:', err);
                    } else {
                        console.log('Deleted old distributor image:', existingImage.image_path);
                    }
                });
            }
            if (existingImage) {
                await existingImage.update({ image_path: req.file.path });
            } else {
                await DistributorImage.create({
                    distributor_id: distributorId,
                    image_path: req.file.path,
                });
            }
        }

        res.status(200).json({ message: 'Distributor updated successfully', distributor });
    } catch (error) {
        console.error('Error in updateDistributor:', error);
        res.status(500).json({ error: error.message });
    }
};

// Delete a distributor
exports.deleteDistributor = async (req, res) => {
    try {
        const distributor = await Distributor.findByPk(req.params.id);
        if (distributor) {
            await distributor.destroy();
            res.status(204).json({ message: 'Distributor deleted successfully' });
        } else {
            res.status(404).json({ message: 'Distributor not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Search for distributors by query
exports.searchDistributors = async (req, res) => {
    try {
        const { query } = req.query;
        const distributors = await Distributor.findAll({
            where: {
                [Op.or]: [
                    { companyname: { [Op.like]: `%${query}%` } },
                    { contact_person_name: { [Op.like]: `%${query}%` } },
                    { location: { [Op.like]: `%${query}%` } },
                ]
            },
            include: [
                {
                    model: DistributorImage,
                    as: 'image',
                    attributes: ['image_path']
                }
            ]
        });
        
        if(distributors.length === 0){
            return res.status(404).json({message:"Distributor Not found"});
        }

        res.status(200).json(distributors);
    } catch (error) {
        console.error('Error in searchDistributors:', error);
        res.status(500).json({ error: error.message });
    }
};
