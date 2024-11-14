const Distributor = require('../model/Distributorsmodel');

// Add a new distributor
exports.addDistributor = (req, res) => {
    const { companyname, location, gstnumber, creditlimit, contact_person_name, phoneno, emailid } = req.body;
    const imageFile = req.file;

    // Validate required fields
    if (!companyname) return res.status(400).json({ error: 'Company name are required.' });
    if(!phoneno) return res.status(400).json({ error: 'Phoneno are required.' });
    if(!emailid) return res.status(400).json({ error: 'Email id are required.' })
    if (!imageFile) {
        return res.status(400).json({ error: 'Image is required.' });
    }

    const distributor = {
        companyname,
        location,
        gstnumber,
        creditlimit,
        contact_person_name,
        phoneno,
        emailid,
        image: imageFile.path // Save the image path to the database
    };

    Distributor.addDistributor(distributor, (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Error adding distributor.', details: err });
        }
        res.status(201).json({ message: 'Distributor added successfully', distributor_id: result.distributor_id });
    });
};

// Get all distributors with their first image
exports.getAllDistributors = (req, res) => {
    Distributor.getAllDistributors((err, distributors) => {
        if (err) {
            return res.status(500).json({ error: 'Error retrieving distributors.', details: err });
        }
        res.status(200).json(distributors);
    });
};

// update specific distributor's details
exports.updateDistributor = (req, res) => {
    const { id } = req.params;
    
    const updateData = {};
    if (req.body.companyname) updateData.companyname = req.body.companyname;
    if (req.body.location) updateData.location = req.body.location;
    if (req.body.gstnumber) updateData.gstnumber = req.body.gstnumber;
    if (req.body.creditlimit) updateData.creditlimit = req.body.creditlimit;
    if (req.body.contact_person_name) updateData.contact_person_name = req.body.contact_person_name;
    if (req.body.phoneno) updateData.phoneno = req.body.phoneno;
    if (req.body.emailid) updateData.emailid = req.body.emailid;
    if (req.file) updateData.image = req.file.path;

    if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ error: 'No data provided for update.' });
    }

    Distributor.updateDistributor(id, updateData, (err, result) => {
        if (err) return res.status(500).json({ error: 'Failed to update distributor.' });
        res.status(200).json({ message: 'Distributor updated successfully' });
    });
};


// Get a specific distributor by ID
exports.getDistributorById = (req, res) => {
    const { id } = req.params;

    Distributor.getDistributorById(id, (err, distributor) => {
        if (err) {
            return res.status(500).json({ error: 'Error retrieving distributor.', details: err });
        }
        if (!distributor) {
            return res.status(404).json({ error: 'Distributor not found.' });
        }
        res.status(200).json(distributor);
    });
};

// delete a specific distributor by ID
exports.deleteDistributor = (req, res) => {
    const {id} = req.params;
    Distributor.getDistributorById(id, (err, distributor) => {
        if (err) {
            return res.status(500).json({ error: 'Error retrieving distributor.', details: err });
        }
        if (!distributor) {
            return res.status(404).json({ error: 'Distributor not found.' });
        }
        Distributor.deleteDistributor(id, (err, result) => {
            if (err) return res.status(500).json({ error: 'Failed to delete distributor.' });
            res.status(200).json({ message: 'Distributor deleted successfully' });
        });
    });
    
};
