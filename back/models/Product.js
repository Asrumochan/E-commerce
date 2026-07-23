const mongoose = require('mongoose');

let ProductSchema = new mongoose.Schema({
    name : {
        type : String,
        required : [true, 'Product name is required'],
        trim: true,
        minlength: [2, 'Product name must be at least 2 characters'],
        maxlength: [120, 'Product name must be at most 120 characters'],
        unique: true
    },
    image : {
        type : String,
        required : [true, 'Product image is required'],
        trim: true
    },
    price : {
        type : Number,
        required : [true, 'Product price is required'],
        min: [0, 'Product price cannot be negative']
    },
    qty : {
        type : Number,
        required : [true, 'Product quantity is required'],
        min: [0, 'Product quantity cannot be negative']
    },
    info : {
        type : String,
        required : [true, 'Product description is required'],
        trim: true,
        minlength: [5, 'Product description must be at least 5 characters'],
        maxlength: [1000, 'Product description must be at most 1000 characters']
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        default: null
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        default: null
    }
}, {
    timestamps: true
});

ProductSchema.index({ name: 1 }, { unique: true });

let Product = mongoose.model('product' , ProductSchema);
module.exports = Product ;

