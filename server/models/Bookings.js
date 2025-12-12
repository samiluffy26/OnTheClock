import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  // Trip Information
  pickupLocation: {
    type: String,
    required: true
  },
  dropoffLocation: {
    type: String,
    required: true
  },
  rideDate: {
    type: String,
    required: true
  },
  rideTime: {
    type: String,
    required: true
  },
  distance: {
    type: Number,
    required: true
  },
  
  // Trip Type
  tripType: {
    type: String,
    enum: ['one-way', 'round-trip'],
    default: 'one-way'
  },
  returnTrip: {
    type: Boolean,
    default: false
  },
  returnDate: String,
  returnTime: String,
  waitOnSite: {
    type: Boolean,
    default: false
  },
  
  // Vehicle & Services
  vehicleType: {
    type: String,
    enum: ['standard', 'wheelchair', 'ambulance'],
    required: true
  },
  equipment: [{
    type: String,
    enum: ['electric-stair-chair', 'oxygen-tank']
  }],
  bedService: {
    type: String,
    enum: ['none', 'bed-to-room', 'room-to-bed', 'bed-to-bed'],
    default: 'none'
  },
  additionalAssistance: {
    type: Boolean,
    default: false
  },
  assistOrigin: {
    type: Boolean,
    default: false
  },
  assistDestination: {
    type: Boolean,
    default: false
  },
  
  // Passenger Information
  passengerFirstName: {
    type: String,
    required: true
  },
  passengerLastName: {
    type: String,
    required: true
  },
  passengerEmail: {
    type: String,
    required: true
  },
  passengerPhone: {
    type: String,
    required: true
  },
  passengerDOB: String,
  passengerWeight: Number,
  passengerGender: {
    type: String,
    enum: ['male', 'female', 'other', '']
  },
  
  // Contact Information
  contactFirstName: {
    type: String,
    required: true
  },
  contactLastName: {
    type: String,
    required: true
  },
  contactEmail: {
    type: String,
    required: true
  },
  contactPhone: {
    type: String,
    required: true
  },
  
  // Additional
  notes: String,
  
  // Fare Details
  fareDetails: {
    distance: String,
    baseFare: String,
    vehicleCharge: String,
    additionalCosts: String,
    waitTimeCost: String,
    oneWayTotal: String,
    returnTripCost: String,
    finalTotal: String
  },
  
  // Status & Tracking
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  emailSent: {
    company: {
      type: Boolean,
      default: false
    },
    customer: {
      type: Boolean,
      default: false
    }
  },
  
  // Metadata
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Índices para búsquedas rápidas
bookingSchema.index({ rideDate: 1, status: 1 });
bookingSchema.index({ contactEmail: 1 });
bookingSchema.index({ createdAt: -1 });

// Middleware para actualizar updatedAt
bookingSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('Booking', bookingSchema);