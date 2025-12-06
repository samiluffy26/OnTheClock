import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  serviceType: {
    type: String,
    enum: ['wheelchair', 'ambulance', 'standard', 'medication-delivery', 'other'],
    default: 'other'
  },
  location: {
    type: String,
    trim: true,
    maxlength: 200
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  featured: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  approvedAt: {
    type: Date
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  }
});

// Índices para búsquedas eficientes
reviewSchema.index({ status: 1, createdAt: -1 });
reviewSchema.index({ rating: -1 });
reviewSchema.index({ featured: -1 });

export default mongoose.model('Review', reviewSchema);