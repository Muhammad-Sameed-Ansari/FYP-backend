const { count } = require('console');
const express = require('express');
const { Product } = require('../models/product');
const router = express.Router();
const multer = require('multer');

const FILE_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg',
};

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const isValid = FILE_TYPE_MAP[file.mimetype];
        let uploadError = new Error('invalid image type');

        if (isValid) {
            uploadError = null;
        }
        cb(uploadError, 'public/uploads');
    },
    filename: function (req, file, cb) {
        let fileName = file.originalname.split(' ').join('-');
        fileName = fileName.split('.')[0];
        const extension = FILE_TYPE_MAP[file.mimetype];
        cb(null, `${fileName}-${Date.now()}.${extension}`);
    },
});

const uploadOptions = multer({ storage: storage });

// get all the products list
router.get(`/`, async (req, res) => {
    const productList = await Product.find();

    if (!productList) {
        res.status(500).json({success: false})
    }
    res.send(productList)
})

// get single product by its id
router.get(`/:id`, async (req, res) => {
    const newProduct = await Product.findById(req.params.id);

    if (!newProduct) {
        res.status(500).json({success: false});
    }
    res.send(newProduct);
})

router.put('/:id', async (req, res) => {
    let userQuantity = req.body.stockCount;
    const newProduct = await Product.findById(req.params.id);
    let newQuantity = newProduct.stockCount - userQuantity;

    const product = await Product.findByIdAndUpdate(
        req.params.id,
        {
            stockCount: newQuantity
        },
        {new: true}
    )

    if (!product) {
        return res.status(400).send('the product cannot be created');
    }

    res.send(product);
})

// add product to the product table
router.post(`/`, uploadOptions.single('image'), async (req, res) => {
    const file = req.file;
    if (!file) return res.status(400).send('No image in the request');

    const fileName = file.filename;
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
    let newProduct = new Product({
        name: req.body.name,
        image: `${basePath}${fileName}`,
        price: req.body.price,
        category: req.body.category,
        stockCount: req.body.stockCount
    })

    newProduct = await newProduct.save();

    if (!newProduct) {
        return res.status(500).send('The product cannot be created');
    }
    
    res.send(newProduct);
})

/*
{
    "name": "Haseeb",
    "image": "images/Haseeb",
    "price": 100,
    "category": "HhH",
    "stockCount": 30,
    "bgColor": "#414045"
}
*/

// delete product by its id
router.delete('/:id', (req, res) => {
    Product.findByIdAndRemove(req.params.id).then(product => {
        if (product) {
            return res.status(200).json({success: true, message: 'the product is deleted'});
        } else {
            return res.status(404).json({success: true, message: 'product not found'});
        }
    }).catch(err => {
        return res.status(500).json({success: false, message: err});
    })
})

/*
// get total count of products in the table
router.get(`/get/count`, async (req, res) => {
    const productCount = await Product.countDocuments((count) => count);

    if (!productCount) {
        res.status(500).json({success: false})
    }
    res.send(productCount)
})*/

module.exports = router;