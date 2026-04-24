const express = require('express');
const createError = require('http-errors');
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const cors = require('cors');
const cookieParser = require("cookie-parser");
const path = require('path');
require('dotenv').config();
require('./Middlewares/DbConnection');

const app = express();

app.use(helmet());


const allowedOrigins = [
  process.env.ALLOWED_ORIGIN_1,
  process.env.ALLOWED_ORIGIN_2,
].filter(Boolean); // Filter out any undefined values

// CORS configuration
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: "GET, POST, PUT, DELETE, PATCH, OPTIONS",
    allowedHeaders: "Content-Type, Authorization",
  })
);

// Add OPTIONS handling for preflight requests
app.options("*", cors());


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); 


const limiter = rateLimit({ 
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 200, // Limit each IP
  error: {
    status: 429,
    message: "Too many requests from this IP, please try again later."
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api", limiter);

app.get('/', (req, res) => {
  res.send('API is running...');
});

const authRoute=require('./Routes/Auth');

app.use('/api/auth',authRoute);
// Handle 404 errors
app.use(async (req, res, next) => {
  next(createError(404, 'Not Found'));
});

// Global error handling
app.use((err, req, res, next) => {
  const statusCode = err.status || 500;
  
  res.status(statusCode).json({
    success: false,
    error: {
      message: err.message || "Internal Server Error",
      status: statusCode,
    }
  });
});


// Start the server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});