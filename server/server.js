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

// ⭐ CORS configurado correctamente
const allowedOrigins = [
  'http://localhost:4321',
  'http://localhost:3000',
  'https://on-the-clock.vercel.app', // ⚠️ SIN barra final
  'https://on-the-clock-git-main.vercel.app', // Preview deployments
  'https://on-the-clock-git-*.vercel.app', // Otros preview
];

app.use(cors({
  origin: function(origin, callback) {
    // Permitir requests sin origin (como mobile apps, Postman)
    if (!origin) {
      return callback(null, true);
    }
    
    // Verificar si el origin está en la lista o coincide con patrón de Vercel
    const isAllowed = allowedOrigins.some(allowed => {
      if (allowed.includes('*')) {
        const pattern = allowed.replace('*', '.*');
        return new RegExp(pattern).test(origin);
      }
      return origin === allowed;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      console.log('❌ CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range']
}));

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
