const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Product = require('../models/Product');
const User = require('../models/User');
const Cart = require('../models/Cart');
const Order = require('../models/Order');
const Wishlist = require('../models/Wishlist');

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

const sanitizeUserPayload = (body) => ({
    name: typeof body.name === 'string' ? body.name.trim() : '',
    email: typeof body.email === 'string' ? body.email.trim().toLowerCase() : '',
    password: typeof body.password === 'string' ? body.password : '',
    adminAccessCode: typeof body.adminAccessCode === 'string' ? body.adminAccessCode.trim() : ''
});

const validateObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const getAuthenticatedUser = async (request) => {
    const userId = request.header('x-user-id');
    if (!userId || !validateObjectId(userId)) {
        return null;
    }

    return User.findById(userId);
};

const requireAuth = async (request, response, next) => {
    try {
        const user = await getAuthenticatedUser(request);

        if (!user) {
            return response.status(401).json({
                msg: 'Authentication required'
            });
        }

        request.authUser = user;
        return next();
    }
    catch (err) {
        console.error(err);
        return response.status(500).json({
            msg: err.message
        });
    }
};

const requireAdmin = async (request, response, next) => {
    try {
        const user = await getAuthenticatedUser(request);

        if (!user) {
            return response.status(401).json({
                msg: 'Authentication required'
            });
        }

        if (user.role !== 'admin') {
            return response.status(403).json({
                msg: 'Admin access required'
            });
        }

        request.authUser = user;
        return next();
    }
    catch (err) {
        console.error(err);
        return response.status(500).json({
            msg: err.message
        });
    }
};

const getOrCreateCart = async (userId) => {
    let cart = await Cart.findOne({ user: userId }).populate('items.product');
    if (!cart) {
        cart = await Cart.create({ user: userId, items: [] });
        cart = await Cart.findById(cart._id).populate('items.product');
    }
    return cart;
};

const getOrCreateWishlist = async (userId) => {
    let wishlist = await Wishlist.findOne({ user: userId }).populate('items.product');
    if (!wishlist) {
        wishlist = await Wishlist.create({ user: userId, items: [] });
        wishlist = await Wishlist.findById(wishlist._id).populate('items.product');
    }
    return wishlist;
};

const formatCartResponse = (cartDoc) => {
    const items = (cartDoc.items || [])
        .filter((item) => item.product)
        .map((item) => ({
            _id: item.product._id,
            productId: item.product._id,
            name: item.product.name,
            image: item.product.image,
            price: item.product.price,
            stockQty: item.product.qty,
            quantity: item.quantity,
            lineTotal: Number(item.product.price) * Number(item.quantity)
        }));

    return {
        items,
        totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
        subtotal: items.reduce((sum, item) => sum + item.lineTotal, 0)
    };
};

const formatWishlistResponse = (wishlistDoc) => {
    const items = (wishlistDoc.items || [])
        .filter((item) => item.product)
        .map((item) => ({
            _id: item.product._id,
            name: item.product.name,
            image: item.product.image,
            price: item.product.price,
            qty: item.product.qty,
            info: item.product.info
        }));

    return {
        items,
        totalItems: items.length
    };
};

const calculateTotals = (subtotal, couponCode) => {
    const normalizedCoupon = String(couponCode || '').trim().toUpperCase();
    const discount = normalizedCoupon === 'TERRAZZO10' ? subtotal * 0.1 : 0;
    const taxableAmount = Math.max(0, subtotal - discount);
    const tax = taxableAmount * 0.05;
    const shipping = taxableAmount > 1000 || taxableAmount === 0 ? 0 : 75;
    const grandTotal = taxableAmount + tax + shipping;

    return {
        subtotal,
        discount,
        tax,
        shipping,
        grandTotal,
        couponCode: normalizedCoupon
    };
};

router.post('/auth/signup', async (request, response) => {
    try {
        const { name, email, password, adminAccessCode } = sanitizeUserPayload(request.body);

        if (!name || !email || !password) {
            return response.status(400).json({
                msg: 'Name, email and password are required'
            });
        }

        if (password.length < 6) {
            return response.status(400).json({
                msg: 'Password must be at least 6 characters'
            });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return response.status(409).json({
                msg: 'An account with this email already exists'
            });
        }

        const adminCode = process.env.ADMIN_ACCESS_CODE;
        let role = 'customer';

        if (adminAccessCode) {
            if (!adminCode) {
                return response.status(403).json({
                    msg: 'Admin signup is not enabled on this server'
                });
            }

            if (adminAccessCode !== adminCode) {
                return response.status(403).json({
                    msg: 'Invalid admin access code'
                });
            }

            role = 'admin';
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role
        });

        return response.status(201).json({
            msg: 'Signup successful',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                loggedInAt: new Date().toISOString()
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

router.post('/auth/login', async (request, response) => {
    try {
        const { email, password } = sanitizeUserPayload(request.body);

        if (!email || !password) {
            return response.status(400).json({
                msg: 'Email and password are required'
            });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return response.status(401).json({
                msg: 'Invalid email or password'
            });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return response.status(401).json({
                msg: 'Invalid email or password'
            });
        }

        return response.status(200).json({
            msg: 'Login successful',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                loggedInAt: new Date().toISOString()
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

router.get('/wishlist', requireAuth, async (request, response) => {
    try {
        const wishlist = await getOrCreateWishlist(request.authUser._id);
        return response.status(200).json(formatWishlistResponse(wishlist));
    }
    catch (err) {
        console.error(err);
        return response.status(500).json({
            msg: err.message
        });
    }
});

router.post('/wishlist/items', requireAuth, async (request, response) => {
    try {
        const productId = request.body.productId;

        if (!validateObjectId(productId)) {
            return response.status(400).json({
                msg: 'Invalid product id'
            });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return response.status(404).json({
                msg: 'No Product Found'
            });
        }

        const wishlist = await getOrCreateWishlist(request.authUser._id);
        const exists = wishlist.items.some((entry) => String(entry.product._id || entry.product) === String(productId));

        if (!exists) {
            wishlist.items.push({ product: productId });
            await wishlist.save();
        }

        const refreshed = await Wishlist.findById(wishlist._id).populate('items.product');
        return response.status(200).json(formatWishlistResponse(refreshed));
    }
    catch (err) {
        console.error(err);
        return response.status(500).json({
            msg: err.message
        });
    }
});

router.delete('/wishlist/items/:productId', requireAuth, async (request, response) => {
    try {
        const productId = request.params.productId;

        if (!validateObjectId(productId)) {
            return response.status(400).json({
                msg: 'Invalid product id'
            });
        }

        const wishlist = await getOrCreateWishlist(request.authUser._id);
        wishlist.items = wishlist.items.filter((entry) => String(entry.product._id || entry.product) !== String(productId));
        await wishlist.save();

        const refreshed = await Wishlist.findById(wishlist._id).populate('items.product');
        return response.status(200).json(formatWishlistResponse(refreshed));
    }
    catch (err) {
        console.error(err);
        return response.status(500).json({
            msg: err.message
        });
    }
});

router.delete('/wishlist', requireAuth, async (request, response) => {
    try {
        const wishlist = await getOrCreateWishlist(request.authUser._id);
        wishlist.items = [];
        await wishlist.save();
        return response.status(200).json(formatWishlistResponse(wishlist));
    }
    catch (err) {
        console.error(err);
        return response.status(500).json({
            msg: err.message
        });
    }
});

router.get('/cart', requireAuth, async (request, response) => {
    try {
        const cart = await getOrCreateCart(request.authUser._id);
        return response.status(200).json(formatCartResponse(cart));
    }
    catch (err) {
        console.error(err);
        return response.status(500).json({
            msg: err.message
        });
    }
});

router.post('/cart/items', requireAuth, async (request, response) => {
    try {
        const productId = request.body.productId;
        const addQuantity = Number(request.body.quantity || 1);

        if (!validateObjectId(productId)) {
            return response.status(400).json({
                msg: 'Invalid product id'
            });
        }

        if (!Number.isInteger(addQuantity) || addQuantity < 1) {
            return response.status(400).json({
                msg: 'Quantity must be a positive whole number'
            });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return response.status(404).json({
                msg: 'No Product Found'
            });
        }

        const cart = await getOrCreateCart(request.authUser._id);
        const existingIndex = cart.items.findIndex((item) => String(item.product._id || item.product) === String(productId));

        if (existingIndex >= 0) {
            const nextQty = cart.items[existingIndex].quantity + addQuantity;
            cart.items[existingIndex].quantity = nextQty;
        } else {
            cart.items.push({ product: productId, quantity: addQuantity });
        }

        await cart.save();
        const refreshed = await Cart.findById(cart._id).populate('items.product');
        return response.status(200).json(formatCartResponse(refreshed));
    }
    catch (err) {
        console.error(err);
        return response.status(500).json({
            msg: err.message
        });
    }
});

router.put('/cart/items/:productId', requireAuth, async (request, response) => {
    try {
        const productId = request.params.productId;
        const quantity = Number(request.body.quantity);

        if (!validateObjectId(productId)) {
            return response.status(400).json({
                msg: 'Invalid product id'
            });
        }

        if (!Number.isInteger(quantity) || quantity < 1) {
            return response.status(400).json({
                msg: 'Quantity must be a positive whole number'
            });
        }

        const cart = await getOrCreateCart(request.authUser._id);
        const item = cart.items.find((entry) => String(entry.product._id || entry.product) === String(productId));
        if (!item) {
            return response.status(404).json({
                msg: 'Item not found in cart'
            });
        }

        item.quantity = quantity;
        await cart.save();
        const refreshed = await Cart.findById(cart._id).populate('items.product');
        return response.status(200).json(formatCartResponse(refreshed));
    }
    catch (err) {
        console.error(err);
        return response.status(500).json({
            msg: err.message
        });
    }
});

router.delete('/cart/items/:productId', requireAuth, async (request, response) => {
    try {
        const productId = request.params.productId;
        if (!validateObjectId(productId)) {
            return response.status(400).json({
                msg: 'Invalid product id'
            });
        }

        const cart = await getOrCreateCart(request.authUser._id);
        cart.items = cart.items.filter((entry) => String(entry.product._id || entry.product) !== String(productId));
        await cart.save();
        const refreshed = await Cart.findById(cart._id).populate('items.product');
        return response.status(200).json(formatCartResponse(refreshed));
    }
    catch (err) {
        console.error(err);
        return response.status(500).json({
            msg: err.message
        });
    }
});

router.delete('/cart', requireAuth, async (request, response) => {
    try {
        const cart = await getOrCreateCart(request.authUser._id);
        cart.items = [];
        await cart.save();
        return response.status(200).json(formatCartResponse(cart));
    }
    catch (err) {
        console.error(err);
        return response.status(500).json({
            msg: err.message
        });
    }
});

router.get('/orders', requireAuth, async (request, response) => {
    try {
        const orders = await Order.find({ user: request.authUser._id }).sort({ createdAt: -1 });
        return response.status(200).json({ data: orders });
    }
    catch (err) {
        console.error(err);
        return response.status(500).json({
            msg: err.message
        });
    }
});

router.post('/orders/checkout', requireAuth, async (request, response) => {
    try {
        const cart = await getOrCreateCart(request.authUser._id);
        const cartItems = (cart.items || []).filter((item) => item.product);

        if (!cartItems.length) {
            return response.status(400).json({
                msg: 'Cart is empty'
            });
        }

        for (const item of cartItems) {
            if (item.product.qty < item.quantity) {
                return response.status(400).json({
                    msg: `Insufficient stock for ${item.product.name}`
                });
            }
        }

        const orderItems = cartItems.map((item) => ({
            product: item.product._id,
            name: item.product.name,
            image: item.product.image,
            price: Number(item.product.price),
            quantity: Number(item.quantity),
            lineTotal: Number(item.product.price) * Number(item.quantity)
        }));

        const subtotal = orderItems.reduce((sum, item) => sum + item.lineTotal, 0);
        const totals = calculateTotals(subtotal, request.body.couponCode || '');

        for (const item of cartItems) {
            item.product.qty = Number(item.product.qty) - Number(item.quantity);
            await item.product.save();
        }

        const order = await Order.create({
            user: request.authUser._id,
            items: orderItems,
            totals: {
                subtotal: totals.subtotal,
                discount: totals.discount,
                tax: totals.tax,
                shipping: totals.shipping,
                grandTotal: totals.grandTotal
            },
            couponCode: totals.couponCode,
            status: 'placed'
        });

        cart.items = [];
        await cart.save();

        return response.status(201).json({
            msg: 'Order placed successfully',
            order,
            cart: formatCartResponse(cart)
        });
    }
    catch (err) {
        console.error(err);
        return response.status(500).json({
            msg: err.message
        });
    }
});

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

router.get('/products/mine/listed', requireAdmin, async (request, response) => {
    try {
        const products = await Product.find({ createdBy: request.authUser._id }).sort({ createdAt: -1 });
        response.status(200).json({ data: products });
    }
    catch (err) {
        console.error(err);
        response.status(500).json({
            msg: err.message
        });
    }
});

/*
    USAGE : Get a Single Product
    URL : http://127.0.0.1:5000/api/products/:id
    Method : GET
    Fields : no-fields
 */
router.get('/products/analytics/summary', requireAdmin, async (request, response) => {
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
router.post('/products', requireAdmin, async (request , response) => {
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
        product = new Product({
            ...newProduct,
            createdBy: request.authUser._id,
            updatedBy: request.authUser._id
        });
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
router.put('/products/:id', requireAdmin, async (request , response) => {
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
            $set : {
                ...updatedProduct,
                updatedBy: request.authUser._id
            }
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
router.delete('/products/:id', requireAdmin, async (request, response) => {
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
