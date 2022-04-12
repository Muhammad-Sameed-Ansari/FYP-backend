const express = require('express');
const { Order } = require('../models/order');
const { OrderItem } = require('../models/order-item');
const router = express.Router();

router.get(`/`, async (req, res) => {
    const orderList = await Order.find().populate('user').populate({ path: 'orderItems', populate: 'product'});

    if (!orderList) {
        res.status(500).json({success: false})
    }
    res.send(orderList)
})

router.get(`/:id`, async (req, res) => {
    const order = await Order.findById(req.params.id).populate('user').populate({ path: 'orderItems', populate: 'product'});

    if (!order) {
        res.status(500).json({success: false})
    }
    res.send(order)
})

router.put('/:id', async (req, res) => {
    const order = await Order.findByIdAndUpdate(
        req.params.id,
        {
            status: req.body.status
        },
        {new: true}
    )

    if (!order) {
        return res.status(400).send('the order cannot be created');
    }

    res.send(order);
})

// delete order by its id
router.delete('/:id', (req, res) => {
    Order.findByIdAndRemove(req.params.id).then(async order => {
        if (order) {
            await order.orderItems.map(async orderItem => {
                await OrderItem.findByIdAndRemove(orderItem)
            })
            return res.status(200).json({success: true, message: 'the order is deleted'});
        } else {
            return res.status(404).json({success: true, message: 'order not found'});
        }
    }).catch(err => {
        return res.status(500).json({success: false, message: err});
    })
})

router.post(`/`, async (req, res) => {
    const orderItemsIds = Promise.all(req.body.orderItems.map(async orderItem => {
        let newOrderItem = new OrderItem({
            quantity: orderItem.quantity,
            product: orderItem.product
        })

        newOrderItem = await newOrderItem.save();

        return newOrderItem._id;
    }))
    const orderItemsIdsResolved = await orderItemsIds;

    const totalPrices = await Promise.all(orderItemsIdsResolved.map(async (orderItemsId) => {
        const orderItem = await OrderItem.findById(orderItemsId).populate('product', 'price');
        const totalPrice = orderItem.product.price * orderItem.quantity;
        return totalPrice;
    }))
    const totalPrice = totalPrices.reduce((a,b) => a + b, 0);
    console.log(totalPrices);

    let order = new Order({
        orderItems: orderItemsIdsResolved,
        status: req.body.status,
        totalPrice: totalPrice,
        user: req.body.user,
    })

    order = await order.save();

    if (!order) {
        return res.status(500).send('The order cannot be created');
    }
    
    res.send(order);
})

router.get('/get/totalsales', async (req, res) => {
    const totalSales = await Order.aggregate([
        { $group: { _id: null, totalSales: { $sum: '$totalPrice'}}}
    ])

    if (!totalSales) {
        return res.status(400).send('The order sales cannot be generated');
    }

    res.send({ totalSales: totalSales.pop().totalSales})
})

router.get(`/get/userorders/:userid`, async (req, res) =>{
    const userOrderList = await Order.find({user: req.params.userid}).populate({ path: 'orderItems', populate: 'product'});

    if(!userOrderList) {
        res.status(500).json({success: false})
    } 
    res.send(userOrderList);
})

/*
// get total count of orders in the table
router.get(`/get/count`, async (req, res) => {
    const orderCount = await Order.countDocuments((count) => count);

    if (!orderCount) {
        res.status(500).json({success: false})
    }
    res.send(orderCount)
})*/

module.exports = router;