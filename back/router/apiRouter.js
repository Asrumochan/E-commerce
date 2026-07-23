const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Product = require('../models/Product');

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 8;
const MAX_LIMIT = 50;

const getPagination = (query) => {
    const page = Math.max(parseInt(query.page, 10) || DEFAULT_PAGE, 1);
    const requestedLimit = Math.max(parseInt(query.limit, 10) || DEFAULT_LIMIT, 1);
    const limit = Math.min(requestedLimit, MAX_LIMIT);
    const skip = (page - 1) * limit;
    return { page, limit, skip };
};

const getSort = (query) => {
    const allowedSortBy = ['name', 'price', 'qty', 'createdAt', 'updatedAt'];
    const sortBy = allowedSortBy.includes(query.sortBy) ? query.sortBy : 'createdAt';
    const order = query.order === 'asc' ? 1 : -1;
    return { [sortBy]: order };
};

const getFilters = (query) => {
    const filters = {};

    if (query.search) {
        filters.name = { $regex: query.search, $options: 'i' };
    }

    const minPrice = Number(query.minPrice);
    const maxPrice = Number(query.maxPrice);
    if (!Number.isNaN(minPrice) || !Number.isNaN(maxPrice)) {
        filters.price = {};
        if (!Number.isNaN(minPrice)) {
            filters.price.$gte = minPrice;
        }
        if (!Number.isNaN(maxPrice)) {
            filters.price.$lte = maxPrice;
        }
    }

    if (query.inStock === 'true') {
        filters.qty = { ...(filters.qty || {}), $gt: 0 };
    }

    return filters;
};

const sanitizeProductPayload = (body) => ({
    name: typeof body.name === 'string' ? body.name.trim() : body.name,
    image: typeof body.image === 'string' ? body.image.trim() : body.image,
    price: Number(body.price),
    qty: Number(body.qty),
    info: typeof body.info === 'string' ? body.info.trim() : body.info
});

const validateObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

/*
    USAGE : Get all the products
    URL : http://127.0.0.1:5000/api/products
    Method : GET
    Fields : no-fields
 */
router.get('/products', async (request , response) => {
    try {
        const filters = getFilters(request.query);
        const sort = getSort(request.query);
        const { page, limit, skip } = getPagination(request.query);

        const [products, total] = await Promise.all([
            Product.find(filters).sort(sort).skip(skip).limit(limit),
            Product.countDocuments(filters)
        ]);

        response.status(200).json({
            data: products,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    }
    catch (err) {
        console.error(err);
        response.status(500).json({
            msg : err.message
        });
    }
});

/*
    USAGE : Get a Single Product
    URL : http://127.0.0.1:5000/api/products/:id
    Method : GET
    Fields : no-fields
 */
router.get('/products/analytics/summary', async (request, response) => {
    try {
        const [summary] = await Product.aggregate([
            {
                $group: {
                    _id: null,
                    totalProducts: { $sum: 1 },
                    totalInventoryUnits: { $sum: '$qty' },
                    totalInventoryValue: { $sum: { $multiply: ['$price', '$qty'] } },
                    lowStockCount: {
                        $sum: {
                            $cond: [{ $lte: ['$qty', 5] }, 1, 0]
                        }
                    }
                }
            }
        ]);

        response.status(200).json(summary || {
            totalProducts: 0,
            totalInventoryUnits: 0,
            totalInventoryValue: 0,
            lowStockCount: 0
        });
    }
    catch (err) {
        console.error(err);
        response.status(500).json({
            msg : err.message
        });
    }
});

 router.get('/products/:id', async (request , response) => {
    try {
        let productId = request.params.id;
        if (!validateObjectId(productId)) {
            return response.status(400).json({
                msg: 'Invalid product id'
            });
        }
        let product = await Product.findById(productId);
        if (!product) {
            return response.status(404).json({
                msg: 'No Product Found'
            });
        }
        response.status(200).json(product);
    }
    catch (err) {
        console.error(err);
        response.status(500).json({
            msg : err.message
        });
    }
});

/*
    USAGE : Create a Product
    URL :   
    Method : POST
    Fields : name , image , price , qty , info
 */
router.post('/products', async (request , response) => {
    try {
        let newProduct = sanitizeProductPayload(request.body);

        if (!newProduct.name || !newProduct.image || !newProduct.info || Number.isNaN(newProduct.price) || Number.isNaN(newProduct.qty)) {
            return response.status(400).json({
                msg: 'Please provide valid name, image, price, qty and info'
            });
        }

        // product is Exists or not
        let product = await Product.findOne({name : { $regex: `^${newProduct.name}$`, $options: 'i' }});
        if(product){
            return response.status(409).json({
                msg : 'Product is Already Exists'
            })
        }
        product = new Product(newProduct);
        product = await product.save(); // insert the product to database
        response.status(201).json({
            result : 'Product is Created',
            product : product
        });
    }
    catch (err) {
        console.error(err);
        response.status(500).json({
            msg : err.message
        });
    }
});

/*
    USAGE : Update a Product
    URL : http://127.0.0.1:5000/api/products/:id
    Method : PUT
    Fields : name , image , price , qty , info
 */
router.put('/products/:id', async (request , response) => {
    let productId = request.params.id;
    try {
        if (!validateObjectId(productId)) {
            return response.status(400).json({
                msg: 'Invalid product id'
            });
        }

        let updatedProduct = sanitizeProductPayload(request.body);

        if (!updatedProduct.name || !updatedProduct.image || !updatedProduct.info || Number.isNaN(updatedProduct.price) || Number.isNaN(updatedProduct.qty)) {
            return response.status(400).json({
                msg: 'Please provide valid name, image, price, qty and info'
            });
        }

        // product is exists or not
        let product = await Product.findById(productId);
        if(!product){
            return response.status(404).json({
                msg : 'No Product Found'
            });
        }

        const duplicate = await Product.findOne({
            _id: { $ne: productId },
            name: { $regex: `^${updatedProduct.name}$`, $options: 'i' }
        });

        if (duplicate) {
            return response.status(409).json({
                msg: 'Product with this name already exists'
            });
        }

        // update
        product = await Product.findByIdAndUpdate(productId , {
            $set : updatedProduct
        }, { new : true, runValidators: true});
        response.status(200).json({
            result : 'Product is Updated',
            product : product
        });
    }
    catch (err) {
        console.error(err);
        response.status(500).json({
            msg : err.message
        });
    }
});

/*
    USAGE : Delete a Product
    URL : http://127.0.0.1:5000/api/products/:id
    Method : DELETE
    Fields : no-fields
 */
router.delete('/products/:id', async (request, response) => {
    try{
        let productId = request.params.id;
        if (!validateObjectId(productId)) {
            return response.status(400).json({
                msg: 'Invalid product id'
            });
        }
        // product is exists or not
        let product = await Product.findById(productId);
        if(!product){
            return response.status(404).json({
                msg : 'No Product Found'
            });
        }
        //delete
        product = await Product.findByIdAndDelete(productId);
        response.status(200).json({
            result : 'Product is Deleted',
            product : product
        });
    }
    catch (err) {
        console.error(err);
        response.status(500).json({
            msg : err.message
        });
    }
});

module.exports = router;
