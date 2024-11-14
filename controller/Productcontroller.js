const Product = require('../model/Productmodel');

//add new product
exports.addProduct = (req, res) => {
    const product = req.body;
    const imageFiles = req.files;

    if (!product.name) return res.status(400).json({ message: 'Product name is required' });
    if (!product.mrp_rate) return res.status(400).json({ message: 'MRP rate is required' });
    if (!product.technicians_rate) return res.status(400).json({ message: 'Technician rate is required' });
    if (!product.distributors_rate) return res.status(400).json({ message: 'Distributor rate is required' });
    if (!product.brand_name) return res.status(400).json({ message: 'Brand name is required' });
    if (!product.product_description) return res.status(400).json({ message: 'Product description is required' });
    if (!product.stocks) return res.status(400).json({ message: 'Stocks quantity is required' });
    if (!product.how_to_use) return res.status(400).json({ message: 'How-to-use information is required' });
    if (!product.composision) return res.status(400).json({ message: 'Composition information is required' });
    if (!product.item_details) return res.status(400).json({ message: 'Item details are required' });
    if (!product.organization_name) return res.status(400).json({ message: 'Organization name are required' });    
    
    if (!imageFiles || imageFiles.length === 0) {
        return res.status(400).json({ message: 'At least one image is required' });
    }
    const newProduct = {
        name: product.name,
        mrp_rate: product.mrp_rate,
        technicians_rate: product.technicians_rate,
        distributors_rate: product.distributors_rate,
        brand_name: product.brand_name,
        product_description: product.product_description,
        stocks: product.stocks,
        how_to_use: product.how_to_use,
        composision: product.composision,
        item_details: product.item_details,
        organization_name: product.organization_name,
        images: imageFiles ? imageFiles.map(file => file.path) : []
    };

    Product.addProduct(newProduct, (err, result) => {
        if (err) {
            console.error('Error adding product:', err);
            res.status(500).json({ message: 'Server Error', error: err });
            return;
        }
        res.status(201).json({ message: 'Product added successfully', product_id: result.product_id });
    });
};

// fetching all products
exports.getAllProducts = (req, res) => {
    Product.getAllProducts((err, products) => {
        if (err) {
            return res.status(500).json({ message: 'Error fetching products', error: err });
        }
        res.status(200).json({ products });
    });
};

// fetch products for admin product list table
exports.getProducts = (req, res)=>{
    Product.getProducts((err, products)=>{
        if(err){
            return res.status(500).json({message: "Error fetching products", error: err});
        }
        res.status(200).json({products});
    })
}

// Fetch product for product detail page
exports.getProductById = (req, res) => {
    const productId = req.params.id;

    Product.getProductById(productId, (err, product) => {
        if (err) {
            return res.status(500).json({ message: "Error fetching product detail", error: err });
        }
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.status(200).json({ product });
    });
};

exports.deleteProduct = (req, res) => {
    const {id} = req.params;

    Product.deleteProduct(id, (err, result) => {
        if (err) return res.status(500).json({ error: 'Failed to delete product.' });
        res.status(200).json({ message: 'Product deleted successfully' });
    });
};