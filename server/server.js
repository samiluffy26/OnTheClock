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

// ⭐ CORS configurado correctamente (sustituir el bloque anterior)
const allowedOrigins = [
  'http://localhost:4321',
  'http://localhost:3000',
  'https://on-the-clock.vercel.app' // dominio de producción
];

// patrón para previews de Vercel (on-the-clock-git-xxxx.vercel.app)
const vercelPreviewRegex = /^https:\/\/on-the-clock-git-[a-z0-9-]+\.vercel\.app$/i;

// helper seguro: convierte un patrón con '*' a RegExp escapando puntos y demás
function patternToRegex(pattern) {
  // escapamos los caracteres especiales, luego reemplazamos \* por .*
  const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\\\*/g, '.*');
  return new RegExp(`^${escaped}$`, 'i');
}

// Si en el futuro quieres añadir patrones, agrégalos aquí (usa '*' si quieres)
const allowedPatterns = [
  // Ejemplo: 'https://mi-sitio-*.vercel.app'
];

const allowedPatternRegexes = allowedPatterns.map(patternToRegex);

// CORS options
const corsOptions = {
  origin: function(origin, callback) {
    // permitir requests sin origin (Postman, mobile apps, server-to-server)
    if (!origin) return callback(null, true);

    // origen explícito en la lista
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // previews de Vercel para este proyecto
    if (vercelPreviewRegex.test(origin)) {
      return callback(null, true);
    }

    // patrones adicionales
    for (const rx of allowedPatternRegexes) {
      if (rx.test(origin)) return callback(null, true);
    }

    // si llega aquí: bloqueado
    console.log('❌ CORS blocked origin:', origin);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range']
};

app.use(cors(corsOptions));
// asegurar manejo de preflight
app.options('*', cors(corsOptions));

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
