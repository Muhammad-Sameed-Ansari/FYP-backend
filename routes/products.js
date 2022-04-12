const { count } = require('console');
const express = require('express');
const { Product } = require('../models/product');
const router = express.Router();

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
router.post(`/`, async (req, res) => {
    let newProduct = new Product({
        name: req.body.name,
        image: req.body.image,
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