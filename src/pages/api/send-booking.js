import nodemailer from 'nodemailer';
import { calculateFare } from '../../utils/pricing.js';

// CONFIGURACIÓN DE CORREO
// IMPORTANTE: Actualiza estas credenciales con las reales
const EMAIL_CONFIG = {
  host: import.meta.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(import.meta.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: import.meta.env.EMAIL_USER,
    pass: import.meta.env.EMAIL_PASS
  }
};

const COMPANY_EMAIL = import.meta.env.COMPANY_EMAIL || 'info@liferide.com'; // Email donde llegarán las reservas

export async function POST({ request }) {
  try {
    const bookingData = await request.json();
    
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
    
    // Calcular tarifa
    const fareDetails = calculateFare(bookingData);
    
    // Crear transporter
    const transporter = nodemailer.createTransport(EMAIL_CONFIG);
    
    // Email para la empresa
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
            <h1>Nueva Solicitud de Viaje - On the Clock Transportation</h1>
          </div>
          
          <div class="section">
            <h3>📍 Detalles del Viaje</h3>
            <div class="info-row">
              <span class="label">Origen:</span>
              <span>${bookingData.pickupLocation}</span>
            </div>
            <div class="info-row">
              <span class="label">Destino:</span>
              <span>${bookingData.dropoffLocation}</span>
            </div>
            <div class="info-row">
              <span class="label">Fecha:</span>
              <span>${bookingData.rideDate}</span>
            </div>
            <div class="info-row">
              <span class="label">Hora:</span>
              <span>${bookingData.rideTime}</span>
            </div>
            ${bookingData.returnTrip ? `
            <div class="info-row">
              <span class="label">Viaje de regreso:</span>
              <span>Sí - ${bookingData.returnDate} a las ${bookingData.returnTime || 'Por confirmar'}</span>
            </div>
            ` : ''}
          </div>
          
          <div class="section">
            <h3>👤 Información del Pasajero</h3>
            <div class="info-row">
              <span class="label">Nombre:</span>
              <span>${bookingData.passengerFirstName} ${bookingData.passengerLastName}</span>
            </div>
            <div class="info-row">
              <span class="label">Email:</span>
              <span>${bookingData.passengerEmail}</span>
            </div>
            <div class="info-row">
              <span class="label">Teléfono:</span>
              <span>${bookingData.passengerPhone}</span>
            </div>
            ${bookingData.passengerDOB ? `
            <div class="info-row">
              <span class="label">Fecha de Nacimiento:</span>
              <span>${bookingData.passengerDOB}</span>
            </div>
            ` : ''}
            ${bookingData.passengerWeight ? `
            <div class="info-row">
              <span class="label">Peso:</span>
              <span>${bookingData.passengerWeight} lbs</span>
            </div>
            ` : ''}
            ${bookingData.passengerGender ? `
            <div class="info-row">
              <span class="label">Género:</span>
              <span>${bookingData.passengerGender}</span>
            </div>
            ` : ''}
          </div>
          
          <div class="section">
            <h3>🚐 Tipo de Vehículo</h3>
            <div class="info-row">
              <span class="label">Vehículo:</span>
              <span>${bookingData.vehicleType === 'wheelchair' ? 'Wheelchair Accessible Van' : bookingData.vehicleType === 'ambulance' ? 'Non-Emergency Ambulance' : 'Standard Van'}</span>
            </div>
          </div>
          
          ${bookingData.bedService && bookingData.bedService !== 'none' ? `
          <div class="section">
            <h3>🛏️ Servicio de Cama</h3>
            <div class="info-row">
              <span>${bookingData.bedService}</span>
            </div>
          </div>
          ` : ''}
          
          ${bookingData.equipment && bookingData.equipment.length > 0 ? `
          <div class="section">
            <h3>🔧 Equipo Adicional</h3>
            ${bookingData.equipment.map(eq => `<div class="info-row"><span>${eq}</span></div>`).join('')}
          </div>
          ` : ''}
          
          ${bookingData.notes ? `
          <div class="section">
            <h3>📝 Notas</h3>
            <p>${bookingData.notes}</p>
          </div>
          ` : ''}
          
          <div class="section">
            <h3>💰 Detalles de Tarifa</h3>
            <div class="info-row">
              <span class="label">Distancia estimada:</span>
              <span>${fareDetails.distance} millas</span>
            </div>
            <div class="info-row">
              <span class="label">Tarifa base:</span>
              <span>$${fareDetails.baseFare}</span>
            </div>
            ${fareDetails.vehicleCharge > 0 ? `
            <div class="info-row">
              <span class="label">Cargo por vehículo:</span>
              <span>$${fareDetails.vehicleCharge}</span>
            </div>
            ` : ''}
            ${fareDetails.additionalCosts > 0 ? `
            <div class="info-row">
              <span class="label">Cargos adicionales:</span>
              <span>$${fareDetails.additionalCosts}</span>
            </div>
            ` : ''}
            <div class="info-row">
              <span class="label">Total ida:</span>
              <span>$${fareDetails.oneWayTotal}</span>
            </div>
            ${fareDetails.returnTripCost ? `
            <div class="info-row">
              <span class="label">Total regreso:</span>
              <span>$${fareDetails.returnTripCost}</span>
            </div>
            ` : ''}
          </div>
          
          <div class="total">
            TOTAL: $${fareDetails.finalTotal}
          </div>
          
          <p style="text-align: center; color: #666; font-size: 14px;">
            Esta es una solicitud automática. Por favor contacte al cliente para confirmar.
          </p>
        </div>
      </body>
      </html>
    `;
    
    // Email de confirmación para el cliente
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
          .contact { text-align: center; padding: 20px; background: #f0f0f0; margin: 20px 0; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>¡Solicitud Recibida!</h1>
            <p>Gracias por elegir On the Clock Transportation</p>
          </div>
          
          <div class="section">
            <h3>Hola ${bookingData.passengerFirstName},</h3>
            <p>Hemos recibido tu solicitud de viaje. Nos pondremos en contacto contigo pronto para confirmar todos los detalles.</p>
          </div>
          
          <div class="section">
            <h3>📍 Resumen de tu Viaje</h3>
            <p><strong>Desde:</strong> ${bookingData.pickupLocation}</p>
            <p><strong>Hasta:</strong> ${bookingData.dropoffLocation}</p>
            <p><strong>Fecha:</strong> ${bookingData.rideDate} a las ${bookingData.rideTime}</p>
            ${bookingData.returnTrip ? `<p><strong>Regreso:</strong> ${bookingData.returnDate}</p>` : ''}
          </div>
          
          <div class="total">
            Tarifa Estimada: $${fareDetails.finalTotal}
          </div>
          
          <div class="contact">
            <h3>¿Tienes preguntas?</h3>
            <p>Llámanos al: <strong>(551) 225-0080</strong></p>
            <p>Email: <strong>${COMPANY_EMAIL}</strong></p>
          </div>
          
          <p style="text-align: center; color: #666; font-size: 12px;">
            Este es un email automático de confirmación. Por favor no respondas a este correo.
          </p>
        </div>
      </body>
      </html>
    `;
    
    // Enviar email a la empresa
    await transporter.sendMail({
      from: EMAIL_CONFIG.auth.user,
      to: COMPANY_EMAIL,
      subject: `Nueva Solicitud de Viaje - ${bookingData.passengerFirstName} ${bookingData.passengerLastName}`,
      html: companyEmailHTML
    });
    
    // Enviar confirmación al cliente
    await transporter.sendMail({
      from: EMAIL_CONFIG.auth.user,
      to: bookingData.passengerEmail,
      subject: 'Confirmación de Solicitud - On the Clock Transportation',
      html: customerEmailHTML
    });
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Booking request sent successfully',
      fareDetails: fareDetails
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Error sending booking:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Error processing booking request'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}