import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import connectDB from './config/database.js';
import authRoutes from './routes/auth.js';
import reviewsRoutes from './routes/reviews.js';
import { handler as ssrHandler } from '../dist/server/entry.mjs';

dotenv.config();

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

// API Routes ANTES del handler de Astro
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

// Servir archivos estáticos del cliente de Astro
app.use(express.static('dist/client'));

// Handler de Astro SSR para todas las demás rutas
app.use(ssrHandler);

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