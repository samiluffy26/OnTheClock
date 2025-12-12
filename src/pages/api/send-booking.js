import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import { calculateFare } from '../../utils/pricing.js';
import mongoose from 'mongoose';

// Solo cargar .env en desarrollo
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

// Conectar a MongoDB si no está conectado
if (mongoose.connection.readyState === 0) {
  await mongoose.connect(process.env.MONGODB_URI);
}

// Importar modelo dinámicamente
const Booking = mongoose.models.Booking || mongoose.model('Booking', new mongoose.Schema({
  pickupLocation: { type: String, required: true },
  dropoffLocation: { type: String, required: true },
  rideDate: { type: String, required: true },
  rideTime: { type: String, required: true },
  distance: { type: Number, required: true },
  tripType: { type: String, default: 'one-way' },
  returnTrip: { type: Boolean, default: false },
  returnDate: String,
  returnTime: String,
  waitOnSite: { type: Boolean, default: false },
  vehicleType: { type: String, required: true },
  equipment: [String],
  bedService: { type: String, default: 'none' },
  additionalAssistance: { type: Boolean, default: false },
  assistOrigin: { type: Boolean, default: false },
  assistDestination: { type: Boolean, default: false },
  passengerFirstName: { type: String, required: true },
  passengerLastName: { type: String, required: true },
  passengerEmail: { type: String, required: true },
  passengerPhone: { type: String, required: true },
  passengerDOB: String,
  passengerWeight: Number,
  passengerGender: String,
  contactFirstName: { type: String, required: true },
  contactLastName: { type: String, required: true },
  contactEmail: { type: String, required: true },
  contactPhone: { type: String, required: true },
  notes: String,
  fareDetails: mongoose.Schema.Types.Mixed,
  status: { type: String, default: 'pending' },
  emailSent: {
    company: { type: Boolean, default: false },
    customer: { type: Boolean, default: false }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}));

const EMAIL_CONFIG = {
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
};

const COMPANY_EMAIL = process.env.COMPANY_EMAIL || 'daviddiaz@ontheclocktrans.com';

export async function POST({ request }) {
  const startTime = Date.now();
  let savedBooking = null;
  
  try {
    console.log('🚀 [ASTRO] Iniciando proceso de booking...');
    
    const bookingData = await request.json();
    console.log('📦 Booking data recibido');
    
    // Validar datos requeridos
    if (!bookingData.passengerEmail || !bookingData.pickupLocation) {
      console.error('❌ Missing required fields');
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing required booking information'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Calcular tarifa
    const fareCalculationData = {
      distance: parseFloat(bookingData.distance) || 0,
      vehicleType: bookingData.vehicleType || 'standard',
      returnTrip: bookingData.returnTrip || false,
      waitOnSite: bookingData.waitOnSite || false,
      equipment: Array.isArray(bookingData.equipment) ? bookingData.equipment : [],
      bedService: bookingData.bedService || 'none',
      additionalAssistance: bookingData.additionalAssistance || false
    };
    
    console.log('💰 Calculando tarifa...');
    const fareDetails = calculateFare(fareCalculationData);
    console.log('✓ Tarifa calculada: $' + fareDetails.finalTotal);
    
    // 🔥 GUARDAR EN BASE DE DATOS PRIMERO (antes de intentar emails)
    console.log('💾 Guardando en base de datos...');
    try {
      savedBooking = await Booking.create({
        ...bookingData,
        fareDetails,
        status: 'pending',
        emailSent: {
          company: false,
          customer: false
        }
      });
      console.log('✓ Booking guardado en DB con ID:', savedBooking._id);
    } catch (dbError) {
      console.error('❌ Error guardando en DB:', dbError.message);
      return new Response(JSON.stringify({
        success: false,
        error: 'Database error. Please call us at (352) 623-2608'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Intentar enviar emails (pero no es crítico si falla)
    let companyEmailSent = false;
    let customerEmailSent = false;
    
    if (EMAIL_CONFIG.auth.user && EMAIL_CONFIG.auth.pass) {
      console.log('📧 Intentando enviar emails...');
      const transporter = nodemailer.createTransport(EMAIL_CONFIG);
      
      const equipmentList = bookingData.equipment?.length > 0 
        ? bookingData.equipment.join(', ') 
        : 'None';
      
      // Email HTML para la empresa
      const companyEmailHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .section { background: #f9f9f9; padding: 15px; margin: 10px 0; border-radius: 5px; }
            .section h3 { margin-top: 0; color: #1E40AF; }
            .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #ddd; }
            .label { font-weight: bold; }
            .total { font-size: 24px; color: #1E40AF; font-weight: bold; text-align: center; padding: 20px; background: #e8f4ff; margin: 20px 0; border-radius: 5px; }
            .booking-id { text-align: center; color: #666; font-size: 12px; margin-top: 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🚐 New Booking Request</h1>
            </div>
            
            <div class="booking-id">Booking ID: ${savedBooking._id}</div>
            
            <div class="section">
              <h3>📍 Trip Details</h3>
              <div class="info-row">
                <span class="label">From:</span>
                <span>${bookingData.pickupLocation}</span>
              </div>
              <div class="info-row">
                <span class="label">To:</span>
                <span>${bookingData.dropoffLocation}</span>
              </div>
              <div class="info-row">
                <span class="label">Date:</span>
                <span>${bookingData.rideDate} at ${bookingData.rideTime}</span>
              </div>
              <div class="info-row">
                <span class="label">Distance:</span>
                <span>${fareDetails.distance} miles</span>
              </div>
            </div>
            
            <div class="section">
              <h3>👤 Passenger</h3>
              <div class="info-row">
                <span class="label">Name:</span>
                <span>${bookingData.passengerFirstName} ${bookingData.passengerLastName}</span>
              </div>
              <div class="info-row">
                <span class="label">Phone:</span>
                <span>${bookingData.passengerPhone}</span>
              </div>
              <div class="info-row">
                <span class="label">Email:</span>
                <span>${bookingData.passengerEmail}</span>
              </div>
            </div>
            
            <div class="section">
              <h3>📞 Contact</h3>
              <div class="info-row">
                <span class="label">Name:</span>
                <span>${bookingData.contactFirstName} ${bookingData.contactLastName}</span>
              </div>
              <div class="info-row">
                <span class="label">Phone:</span>
                <span>${bookingData.contactPhone}</span>
              </div>
              <div class="info-row">
                <span class="label">Email:</span>
                <span>${bookingData.contactEmail}</span>
              </div>
            </div>
            
            <div class="section">
              <h3>🚐 Vehicle & Services</h3>
              <div class="info-row">
                <span class="label">Vehicle:</span>
                <span>${bookingData.vehicleType}</span>
              </div>
              <div class="info-row">
                <span class="label">Equipment:</span>
                <span>${equipmentList}</span>
              </div>
              <div class="info-row">
                <span class="label">Bed Service:</span>
                <span>${bookingData.bedService}</span>
              </div>
            </div>
            
            ${bookingData.notes ? `
            <div class="section">
              <h3>📝 Notes</h3>
              <p>${bookingData.notes}</p>
            </div>
            ` : ''}
            
            <div class="total">
              TOTAL ESTIMATE: $${fareDetails.finalTotal}
            </div>
          </div>
        </body>
        </html>
      `;
      
      // Email para el cliente
      const customerEmailHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .section { background: #f9f9f9; padding: 15px; margin: 10px 0; border-radius: 5px; }
            .total { font-size: 24px; color: #1E40AF; font-weight: bold; text-align: center; padding: 20px; background: #e8f4ff; margin: 20px 0; border-radius: 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✓ Booking Confirmed!</h1>
            </div>
            
            <div class="section">
              <h3>Hello ${bookingData.passengerFirstName},</h3>
              <p>Thank you for choosing On the Clock Transportation! We have received your booking request and will contact you shortly to confirm all details.</p>
            </div>
            
            <div class="section">
              <h3>📍 Your Trip</h3>
              <p><strong>From:</strong> ${bookingData.pickupLocation}</p>
              <p><strong>To:</strong> ${bookingData.dropoffLocation}</p>
              <p><strong>Date:</strong> ${bookingData.rideDate} at ${bookingData.rideTime}</p>
              <p><strong>Vehicle:</strong> ${bookingData.vehicleType}</p>
            </div>
            
            <div class="total">
              Estimated Fare: $${fareDetails.finalTotal}
            </div>
            
            <div class="section" style="text-align: center;">
              <h3>Questions?</h3>
              <p>📞 <strong>(352) 623-2608</strong></p>
              <p>📧 <strong>${COMPANY_EMAIL}</strong></p>
              <p style="margin-top: 15px; font-size: 12px; color: #666;">Booking ID: ${savedBooking._id}</p>
            </div>
          </div>
        </body>
        </html>
      `;
      
      // Enviar email a la empresa
      try {
        const emailPromise = transporter.sendMail({
          from: `"On the Clock Transportation" <${EMAIL_CONFIG.auth.user}>`,
          to: COMPANY_EMAIL,
          subject: `🚐 New Booking - ${bookingData.passengerFirstName} ${bookingData.passengerLastName}`,
          html: companyEmailHTML
        });
        
        await Promise.race([
          emailPromise,
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 15000))
        ]);
        
        console.log('✓ Email a empresa enviado');
        companyEmailSent = true;
        
        // Actualizar DB
        await Booking.findByIdAndUpdate(savedBooking._id, {
          'emailSent.company': true
        });
      } catch (emailError) {
        console.error('⚠️ Error enviando email a empresa:', emailError.message);
      }
      
      // Enviar email al cliente
      try {
        const emailPromise = transporter.sendMail({
          from: `"On the Clock Transportation" <${EMAIL_CONFIG.auth.user}>`,
          to: bookingData.contactEmail,
          subject: '✓ Booking Confirmation - On the Clock Transportation',
          html: customerEmailHTML
        });
        
        await Promise.race([
          emailPromise,
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 15000))
        ]);
        
        console.log('✓ Email a cliente enviado');
        customerEmailSent = true;
        
        // Actualizar DB
        await Booking.findByIdAndUpdate(savedBooking._id, {
          'emailSent.customer': true
        });
      } catch (emailError) {
        console.error('⚠️ Error enviando email a cliente:', emailError.message);
      }
    } else {
      console.log('⚠️ Email credentials not configured - booking saved but no emails sent');
    }
    
    const duration = Date.now() - startTime;
    console.log(`✅ Proceso completado en ${duration}ms`);
    console.log(`📊 DB: ${savedBooking ? 'saved' : 'failed'}, Emails: Company=${companyEmailSent}, Customer=${customerEmailSent}`);
    
    // SIEMPRE responder con éxito si se guardó en DB
    return new Response(JSON.stringify({
      success: true,
      message: 'Booking received successfully!',
      bookingId: savedBooking._id,
      fareDetails: fareDetails,
      emailStatus: {
        company: companyEmailSent,
        customer: customerEmailSent
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('❌ Error general:', error);
    console.error('Stack:', error.stack);
    
    return new Response(JSON.stringify({
      success: false,
      error: 'An error occurred. Please call us at (352) 623-2608',
      details: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}