import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/database.js';
import authRoutes from './routes/auth.js';
import reviewsRoutes from './routes/reviews.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Conectar a MongoDB
connectDB();

// CORS
app.use(cors({
  origin: true,
  credentials: true
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/reviews', reviewsRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK',
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Servir archivos estáticos de Astro
app.use(express.static(path.join(__dirname, '../dist')));

// Todas las demás rutas sirven index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'production'}`);
});