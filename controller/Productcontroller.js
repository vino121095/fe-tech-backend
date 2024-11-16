const Product = require('../model/Productmodel');
const ProductImage = require('../model/productImagesmodel');


// Add a new product with images
exports.addProduct = async (req, res) => {
    try {
        const product = await Product.create(req.body);
        // Check and add images if available
        if (req.files && req.files.length > 0) {
            const productImages = req.files.map(file => ({
                product_id: product.pid,
                image_path: file.path
            }));
            await ProductImage.bulkCreate(productImages);
        }
        res.status(201).json({ message: 'Product added successfully', product });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.findAll({
            include: [
                {
                    model: ProductImage, 
                    as: 'images',        
                    attributes: ['image_path']
                }
            ]
        });
        res.status(200).json(products);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id, {
            include: [
                {
                    model: ProductImage,  
                    as: 'images',        
                    attributes: ['image_path'],  
                }
            ]
        });

        if (product) {
            res.status(200).json(product);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const product = await Product.findOne({ where: { pid: req.params.id } });
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        await product.update(req.body);
        if (req.files && req.files.length > 0) {
            const productImages = req.files.map(file => ({
                product_id: product.pid,
                image_path: file.path
            }));
            await ProductImage.bulkCreate(productImages);
        }
        res.status(200).json({ message: 'Product updated successfully', product });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (product) {
            await product.destroy();
            res.status(204).json({ message: 'Product deleted successfully' });
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};