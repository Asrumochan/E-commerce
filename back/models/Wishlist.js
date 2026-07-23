const mongoose = require('mongoose');

const WishlistItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'product',
        required: true
    }
}, { _id: false });

const WishlistSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true,
        unique: true
    },
    items: {
        type: [WishlistItemSchema],
        default: []
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('wishlist', WishlistSchema);
