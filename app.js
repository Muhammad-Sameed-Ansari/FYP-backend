const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const morgan = require('morgan');
const mongoose = require('mongoose');
const authJwt = require('./helper/jwt');
const errorHandler = require('./helper/error-handler');

require('dotenv/config')

//middleware
app.use(bodyParser.json());
app.use(morgan('tiny'));
app.use(authJwt());
app.use(errorHandler);

//Routers
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const userRoutes = require('./routes/users');

const api_url = process.env.API_URL;

app.use(`${api_url}/products`, productRoutes);
app.use(`${api_url}/orders`, orderRoutes);
app.use(`${api_url}/users`, userRoutes);

//Database
mongoose.connect(process.env.CONNECTION_STRING)
.then(() => {
    console.log('Database connection is ready...');
})
.catch((err) => {
    console.log(err);
})

//Server
app.listen(3000, () => {
    console.log('server is running http://localhost:3000');
})