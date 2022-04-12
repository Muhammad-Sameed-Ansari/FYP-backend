const mongoose = require('mongoose');

const orderSchema = mongoose.Schema({
    orderItems: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'OrderItem',
        required: true
    }],
    status: {
        type: String,
        required: true,
        default: 'Pending'
    },
    totalPrice: {
        type: Number
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    dateOrdered: {
        type: Date,
        default: Date.now
    }
    
})

orderSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

orderSchema.set('toJSON', {
    virtuals: true
});

/*
{
    "orderItems": [
        {
            "quantity": 3,
            "product": "6244a7d17ed9f4845fc6ea73"
        },
        {
            "quantity": 3,
            "product": "6244a8de7ed9f4845fc6ea75"
        }
    ],
    "user": "624993bee62fc154244de32c"

}
*/

exports.Order = mongoose.model('Order', orderSchema);