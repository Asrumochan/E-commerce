const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'product',
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    image: {
        type: String,
        required: true,
        trim: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    lineTotal: {
        type: Number,
        required: true,
        min: 0
    }
}, { _id: false });

const OrderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true,
        index: true
    },
    items: {
        type: [OrderItemSchema],
        default: []
    },
    totals: {
        subtotal: { type: Number, required: true, min: 0 },
        discount: { type: Number, required: true, min: 0 },
        tax: { type: Number, required: true, min: 0 },
        shipping: { type: Number, required: true, min: 0 },
        grandTotal: { type: Number, required: true, min: 0 }
    },
    couponCode: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['placed', 'processing', 'shipped', 'delivered'],
        default: 'placed'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('order', OrderSchema);
