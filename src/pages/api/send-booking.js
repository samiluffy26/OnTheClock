import dotenv from 'dotenv';
dotenv.config();

import nodemailer from 'nodemailer';
import { calculateFare } from '../../utils/pricing.js';

// ✅ USAR process.env en lugar de import.meta.env
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
  try {
    const bookingData = await request.json();
    
    console.log('📧 Enviando email de reserva...');
    console.log('📧 Config:', {
      host: EMAIL_CONFIG.host,
      port: EMAIL_CONFIG.port,
      user: EMAIL_CONFIG.auth.user,
      hasPassword: !!EMAIL_CONFIG.auth.pass,
      passwordLength: EMAIL_CONFIG.auth.pass?.length || 0
    });
    
    // Validar credenciales
    if (!EMAIL_CONFIG.auth.user || !EMAIL_CONFIG.auth.pass) {
      console.error('❌ Faltan credenciales de email');
      console.error('EMAIL_USER:', process.env.EMAIL_USER);
      console.error('EMAIL_PASS exists:', !!process.env.EMAIL_PASS);
      return new Response(JSON.stringify({
        success: false,
        error: 'Email credentials not configured'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Validar datos
    if (!bookingData.passengerEmail || !bookingData.pickupLocation) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing required fields'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // ✅ CONVERTIR distance a número si viene como string
    const bookingDataFixed = {
      ...bookingData,
      distance: typeof bookingData.distance === 'string' 
        ? parseFloat(bookingData.distance) 
        : bookingData.distance
    };
    
    console.log('📊 Datos para calcular tarifa:', {
      distance: bookingDataFixed.distance,
      distanceType: typeof bookingDataFixed.distance,
      vehicleType: bookingDataFixed.vehicleType
    });
    
    // Calcular tarifa
    const fareDetails = calculateFare(bookingDataFixed);
    
    // Crear transporter
    const transporter = nodemailer.createTransport(EMAIL_CONFIG);
    
    // Verificar conexión
    console.log('🔌 Verificando conexión SMTP...');
    try {
      await transporter.verify();
      console.log('✅ Conexión SMTP verificada');
    } catch (verifyError) {
      console.error('❌ Error verificando SMTP:', verifyError.message);
      return new Response(JSON.stringify({
        success: false,
        error: 'Email server error: ' + verifyError.message
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Email HTML para la empresa
    const companyEmailHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%); color: white; padding: 20px; text-align: center; }
          .section { background: #f9f9f9; padding: 15px; margin: 10px 0; border-radius: 5px; }
          .section h3 { margin-top: 0; color: #1E40AF; }
          .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #ddd; }
          .label { font-weight: bold; }
          .total { font-size: 24px; color: #1E40AF; font-weight: bold; text-align: center; padding: 20px; background: #e8f4ff; margin: 20px 0; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Booking Request</h1>
          </div>
          
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
            ${bookingData.returnTrip ? `
            <div class="info-row">
              <span class="label">Return Trip:</span>
              <span>Yes - ${bookingData.returnDate || 'TBD'} at ${bookingData.returnTime || 'TBD'}</span>
            </div>
            ` : ''}
          </div>
          
          <div class="section">
            <h3>👤 Passenger</h3>
            <div class="info-row">
              <span class="label">Name:</span>
              <span>${bookingData.passengerFirstName} ${bookingData.passengerLastName}</span>
            </div>
            <div class="info-row">
              <span class="label">Email:</span>
              <span>${bookingData.passengerEmail}</span>
            </div>
            <div class="info-row">
              <span class="label">Phone:</span>
              <span>${bookingData.passengerPhone}</span>
            </div>
          </div>
          
          <div class="section">
            <h3>🚐 Vehicle</h3>
            <div class="info-row">
              <span class="label">Type:</span>
              <span>${bookingData.vehicleType}</span>
            </div>
          </div>
          
          ${bookingData.notes ? `
          <div class="section">
            <h3>📝 Notes</h3>
            <p>${bookingData.notes}</p>
          </div>
          ` : ''}
          
          <div class="section">
            <h3>💰 Fare</h3>
            <div class="info-row">
              <span class="label">Distance:</span>
              <span>${fareDetails.distance} miles</span>
            </div>
            <div class="info-row">
              <span class="label">Base Fare:</span>
              <span>$${fareDetails.baseFare}</span>
            </div>
          </div>
          
          <div class="total">
            TOTAL: $${fareDetails.finalTotal}
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
          .header { background: linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%); color: white; padding: 20px; text-align: center; }
          .section { background: #f9f9f9; padding: 15px; margin: 10px 0; border-radius: 5px; }
          .total { font-size: 24px; color: #1E40AF; font-weight: bold; text-align: center; padding: 20px; background: #e8f4ff; margin: 20px 0; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Booking Confirmed!</h1>
          </div>
          
          <div class="section">
            <h3>Hello ${bookingData.passengerFirstName},</h3>
            <p>We have received your booking request. We will contact you soon to confirm.</p>
          </div>
          
          <div class="section">
            <h3>📍 Trip Summary</h3>
            <p><strong>From:</strong> ${bookingData.pickupLocation}</p>
            <p><strong>To:</strong> ${bookingData.dropoffLocation}</p>
            <p><strong>Date:</strong> ${bookingData.rideDate} at ${bookingData.rideTime}</p>
          </div>
          
          <div class="total">
            Estimated Fare: $${fareDetails.finalTotal}
          </div>
          
          <div class="section" style="text-align: center;">
            <h3>Questions?</h3>
            <p>Call: <strong>(352) 623-2608</strong></p>
            <p>Email: <strong>${COMPANY_EMAIL}</strong></p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    // Enviar emails
    console.log('📧 Enviando email a la empresa...');
    await transporter.sendMail({
      from: `"On the Clock Transportation" <${EMAIL_CONFIG.auth.user}>`,
      to: COMPANY_EMAIL,
      subject: `New Booking - ${bookingData.passengerFirstName} ${bookingData.passengerLastName}`,
      html: companyEmailHTML
    });
    
    console.log('📧 Enviando confirmación al cliente...');
    await transporter.sendMail({
      from: `"On the Clock Transportation" <${EMAIL_CONFIG.auth.user}>`,
      to: bookingData.passengerEmail,
      subject: 'Booking Confirmation - On the Clock Transportation',
      html: customerEmailHTML
    });
    
    console.log('✅ Emails enviados exitosamente');
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Booking sent successfully',
      fareDetails: fareDetails
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('❌ Error sending booking:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}