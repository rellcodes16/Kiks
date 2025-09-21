const express = require('express')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')
const helmet = require('helmet')
const mongoSanitize = require('express-mongo-sanitize')
const xss = require('xss-clean') 
const hpp = require('hpp')
const path = require('path');
const cors = require('cors')
const cookieParser = require('cookie-parser')
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./docs/swaggerConfig");

const AppError = require('./utils/apiError')
const globalErrorHandler = require('./controllers/errorController')
const productRouter = require('./routes/productRoutes') 
const userRouter = require('./routes/userRoutes')
const reviewRouter = require('./routes/reviewRoutes')
const cartRouter = require('./routes/cartRoutes')
const paymentRouter = require('./routes/paymentRoutes')
const favicon = require('serve-favicon');

const app = express();

// Serve favicon
app.use(favicon(path.join(__dirname, 'favicon.ico')));

//1. GLOBAL MIDDLEWARES

//Set security HTTP headers
app.use(helmet())

app.use(cookieParser());

const corsOptions = {
    origin: 'http://localhost:5173',
    credentials: true, 
};

// Enable CORS for all routes
app.use(cors(corsOptions));

//Development logging
if(!process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'))
}

//Limit requests from same API
const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: 'Too many request from this IP, please try again in an hour!'
})

app.use('/api', limiter);

//Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));

// Data sanitization against NOSQL query injection
app.use(mongoSanitize())

// Data sanitization against XSS
app.use(xss())

//Prevent parameter pollution

//Test middleware
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString()
    // console.log(req.headers)

    next();
})

app.use((req, res, next) => {
    console.log('Cookies: ', req.cookies);
    next();
});


// Swagger docs route
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));


// Define the root route
app.get('/', (req, res) => {
    res.status(200).send('Hello, World!');
});


//3. ROUTES
app.use('/api/v1/products', productRouter)
app.use('/api/v1/users', userRouter)
app.use('/api/v1/reviews', reviewRouter)
app.use('/api/v1/cart', cartRouter)
app.use('/api/v1/payment', paymentRouter)

app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404))
})

app.use(globalErrorHandler)

module.exports = app;
