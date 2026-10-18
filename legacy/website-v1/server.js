// Import core modules
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import bodyParser from 'body-parser';
import path from 'path';
import cookieParser from 'cookie-parser';
import { fileURLToPath } from 'url';
import { connectDB } from './src/db/connect.js';

// Helpers for __dirname (not available in ES modules by default)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// Environment variable configuration
dotenv.config();

// Initialize app
const app = express();


// Middleware
app.use(cors({origin: "http://localhost:8000"}));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(express.json({limit: "10mb"}))
app.use(express.urlencoded({extended: true, limit: "10mb"}))
// app.use(express.static("public"))
app.use(helmet());



// Static files
app.use(express.static(path.join(__dirname, 'src/public')));


// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));
// app.set("views", path.join(process.cwd(), "src", "views"));

// // Middleware for parsing request bodies
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));


app.use((req, res, next) => {
  res.setHeader("Content-Security-Policy", "script-src 'unsafe-inline' *");
  next();
});


// Import routes
// import authRoutes from './src/routes/authRoutes.js';
// import disputeRoutes from './src/routes/disputeRoutes.js';
// import jobRoutes from './src/routes/jobRoutes.js';
// import logRoutes from './src/routes/logRoutes.js';
// import paymentRoutes from './src/routes/paymentRoutes.js';
import siteRoutes from './src/routes/siteRoutes.js';
// import userRoutes from './src/routes/userRoutes.js';
import laborRoutes from './src/routes/laborRoutes.js';
import clientRoutes from './src/routes/clientRoutes.js';
import adminRoutes from './src/routes/adminRoutes.js';




// Routes
// app.use('/auth', authRoutes);
// app.use('/disputes', disputeRoutes);
// app.use('/jobs', jobRoutes);
// app.use('/logs', logRoutes);
// app.use('/payments', paymentRoutes);
app.use('/', siteRoutes);
// app.use('/users', userRoutes);
app.use('/labor', laborRoutes);
app.use('/client', clientRoutes);
app.use('/admin', adminRoutes);





// 404 Route
app.use((req, res, next) => {
  res.status(404).sendFile('src/public/html/404.html', { root: '.' });
});


// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ error: 'Something went wrong!' });
});



// Database connection
connectDB()
  .then(() => {
    // console.log('MongoDB Connected');
    // Start the server
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  })
  .catch((err) => console.error('Database connection error:', err));
