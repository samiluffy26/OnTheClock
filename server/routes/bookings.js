import express from 'express';
import mongoose from 'mongoose';

const router = express.Router();

// Importar modelo (asegúrate de tenerlo en server/models/Booking.js)
const Booking = mongoose.models.Booking || await import('../models/Booking.js').then(m => m.default);

// GET /api/bookings - Listar todas las reservas
router.get('/', async (req, res) => {
  try {
    const { status, date, limit = 50 } = req.query;
    
    let query = {};
    if (status) query.status = status;
    if (date) query.rideDate = date;
    
    const bookings = await Booking.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));
    
    res.json({
      success: true,
      count: bookings.length,
      bookings
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/bookings/:id - Obtener una reserva específica
router.get('/:id', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }
    
    res.json({
      success: true,
      booking
    });
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// PATCH /api/bookings/:id - Actualizar estado de reserva
router.patch('/:id', async (req, res) => {
  try {
    const { status, notes } = req.body;
    
    const updateData = {};
    if (status) updateData.status = status;
    if (notes) updateData.notes = notes;
    updateData.updatedAt = Date.now();
    
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }
    
    res.json({
      success: true,
      booking
    });
  } catch (error) {
    console.error('Error updating booking:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/bookings/stats/summary - Estadísticas
router.get('/stats/summary', async (req, res) => {
  try {
    const total = await Booking.countDocuments();
    const pending = await Booking.countDocuments({ status: 'pending' });
    const confirmed = await Booking.countDocuments({ status: 'confirmed' });
    const completed = await Booking.countDocuments({ status: 'completed' });
    
    res.json({
      success: true,
      stats: {
        total,
        pending,
        confirmed,
        completed
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;