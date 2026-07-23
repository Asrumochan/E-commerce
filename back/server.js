const express = require('express');
const app = express();
const dotEnv = require('dotenv');
const mongoose = require('mongoose');
// https://mongoosejs.com/docs/queries.html
const cors = require('cors');

// configure cors
app.use(cors());

// configure dotEnv
dotEnv.config({ path: './config/config.env' });

// configure express to receive the form data
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const hostname = process.env.HOST_NAME || '127.0.0.1';
const port = process.env.PORT || 5000;

app.get('/', (request, response) => {
    response.send('<h2>E-Commerce API is running</h2>');
});

app.get('/health', (request, response) => {
    response.status(200).json({
        status: 'ok',
        service: 'ecommerce-api',
        timestamp: new Date().toISOString()
    });
});

// connect to Mongo DB Database
mongoose.connect(process.env.MONGO_DB_LOCAL_URL, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useFindAndModify: false,
    useCreateIndex: true
}).then(() => {
    console.log(`Connected to Mongo DB Successfully..............`);
}).catch((err) => {
    console.error(err);
    process.exit(1); // stop the node js process if unable to connect to mongodb
});

// configure the router
app.use('/api', require('./router/apiRouter'));

app.use((request, response) => {
    response.status(404).json({
        msg: 'Route not found'
    });
});

app.use((err, request, response) => {
    console.error(err);
    response.status(err.status || 500).json({
        msg: err.message || 'Internal server error'
    });
});

app.listen(port, hostname, () => {
    console.log(`Express Server is Started at http://${hostname}:${port}`);
});
