import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import connectDatabase from './config/database';
import { errorHandler } from './middleware/errorHandler';

// Import routes
import authRoutes from './routes/auth';
import productRoutes from './routes/products';
import orderRoutes from './routes/orders';
import paymentRoutes from './routes/payments';
import adminRoutes from './routes/admin';

// Load env vars
dotenv.config();

// Connect to database
connectDatabase();

const app = express();

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});

app.use('/api', limiter);

// More strict rate limiting for auth and payment
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: 'Too many authentication attempts, please try again later.',
});

app.use('/api/auth', authLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Smoke Bros API is running',
    timestamp: new Date().toISOString(),
  });
});

// Error handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  process.exit(1);
});
