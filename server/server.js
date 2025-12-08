import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import connectDB from './config/database.js';
import authRoutes from './routes/auth.js';
import reviewsRoutes from './routes/reviews.js';

dotenv.config();

const app = express();

// Conectar a MongoDB
connectDB();

// CORS configurado correctamente
const allowedOrigins = [
  'http://localhost:4321',
  'http://localhost:3000',
  'https://on-the-clock.vercel.app',
  'https://on-the-clock-git-main.vercel.app'
];

const vercelPreviewRegex = /^https:\/\/on-the-clock-git-[a-z0-9-]+\.vercel\.app$/i;

const corsOptions = {
  origin: function(origin, callback) {
    // Permitir requests sin origin (Postman, mobile apps, server-to-server)
    if (!origin) return callback(null, true);

    // Origen explícito en la lista
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Previews de Vercel para este proyecto
    if (vercelPreviewRegex.test(origin)) {
      return callback(null, true);
    }

    // Si llega aquí: bloqueado
    console.log('❌ CORS blocked origin:', origin);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range']
};

// ✅ SOLUCIÓN: Aplica CORS antes que todo
app.use(cors(corsOptions));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/reviews', reviewsRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    cors: allowedOrigins
  });
});

// ✅ IMPORTANTE: NO uses app.options('*', ...) - CORS ya lo maneja automáticamente
// Esta línea causaba el error en Render, así que la eliminamos completamente

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Allowed origins:`, allowedOrigins);
});