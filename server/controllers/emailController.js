import sgMail from "@sendgrid/mail";
import dotenv from "dotenv";
dotenv.config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export const sendBookingEmails = async (req, res) => {
  try {
    const data = req.body;

    console.log("📩 Booking recibido:", data);

    // ✅ VALIDAR VARIABLES DE ENTORNO
    if (!process.env.SENDGRID_API_KEY) {
      throw new Error("SENDGRID_API_KEY no está configurada");
    }
    if (!process.env.COMPANY_EMAIL) {
      throw new Error("COMPANY_EMAIL no está configurada");
    }
    if (!process.env.FROM_EMAIL) {
      throw new Error("FROM_EMAIL no está configurada");
    }
    if (!data.passengerEmail) {
      throw new Error("Email del pasajero no proporcionado");
    }

    console.log("📧 Enviando emails:");
    console.log("  - Company:", process.env.COMPANY_EMAIL);
    console.log("  - From:", process.env.FROM_EMAIL);
    console.log("  - Client:", data.passengerEmail);

    // Email para la empresa
    const companyHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin:0;padding:0;background-color:#f4f4f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4;padding:20px 0;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
                
                <!-- Header con Logo -->
                <tr>
                  <td style="background:linear-gradient(135deg, #0A6EFD 0%, #0052CC 100%);padding:40px 30px;text-align:center;">
                    <div style="background-color:white;display:inline-block;padding:20px 40px;border-radius:8px;margin-bottom:15px;">
                      <img src="https://www.ontheclocktrans.com/logo.png" alt="OnTheClock Transportation" style="max-width:200px;height:auto;display:block;" />
                    </div>
                    <h2 style="margin:20px 0 0 0;color:#ffffff;font-size:22px;font-weight:600;">Nueva Reservación Recibida</h2>
                  </td>
                </tr>

                <!-- Contenido -->
                <tr>
                  <td style="padding:40px 30px;">
                    
                    <!-- Información del Pasajero -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:30px;">
                      <tr>
                        <td style="background-color:#f8f9fa;padding:20px;border-radius:6px;">
                          <h3 style="margin:0 0 15px 0;color:#0A6EFD;font-size:18px;border-bottom:2px solid #0A6EFD;padding-bottom:10px;">👤 Información del Pasajero</h3>
                          <table width="100%" cellpadding="5" cellspacing="0">
                            <tr>
                              <td style="color:#666;width:120px;"><strong>Nombre:</strong></td>
                              <td style="color:#333;">${data.passengerFirstName} ${data.passengerLastName}</td>
                            </tr>
                            <tr>
                              <td style="color:#666;"><strong>Teléfono:</strong></td>
                              <td style="color:#333;">${data.passengerPhone}</td>
                            </tr>
                            <tr>
                              <td style="color:#666;"><strong>Email:</strong></td>
                              <td style="color:#333;">${data.passengerEmail}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <!-- Información de Contacto -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:30px;">
                      <tr>
                        <td style="background-color:#f8f9fa;padding:20px;border-radius:6px;">
                          <h3 style="margin:0 0 15px 0;color:#0A6EFD;font-size:18px;border-bottom:2px solid #0A6EFD;padding-bottom:10px;">📞 Contacto de Emergencia</h3>
                          <table width="100%" cellpadding="5" cellspacing="0">
                            <tr>
                              <td style="color:#666;width:120px;"><strong>Nombre:</strong></td>
                              <td style="color:#333;">${data.contactFirstName} ${data.contactLastName}</td>
                            </tr>
                            <tr>
                              <td style="color:#666;"><strong>Teléfono:</strong></td>
                              <td style="color:#333;">${data.contactPhone}</td>
                            </tr>
                            <tr>
                              <td style="color:#666;"><strong>Email:</strong></td>
                              <td style="color:#333;">${data.contactEmail}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <!-- Detalles del Viaje -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:30px;">
                      <tr>
                        <td style="background-color:#e7f3ff;padding:20px;border-radius:6px;border-left:4px solid #0A6EFD;">
                          <h3 style="margin:0 0 15px 0;color:#0A6EFD;font-size:18px;">🚗 Detalles del Viaje</h3>
                          <table width="100%" cellpadding="5" cellspacing="0">
                            <tr>
                              <td style="color:#666;width:120px;"><strong>Pick-up:</strong></td>
                              <td style="color:#333;">${data.pickupLocation}</td>
                            </tr>
                            <tr>
                              <td style="color:#666;"><strong>Drop-off:</strong></td>
                              <td style="color:#333;">${data.dropoffLocation}</td>
                            </tr>
                            <tr>
                              <td style="color:#666;"><strong>Fecha:</strong></td>
                              <td style="color:#333;">${data.rideDate}</td>
                            </tr>
                            <tr>
                              <td style="color:#666;"><strong>Hora:</strong></td>
                              <td style="color:#333;">${data.rideTime}</td>
                            </tr>
                            <tr>
                              <td style="color:#666;"><strong>Distancia:</strong></td>
                              <td style="color:#333;font-weight:600;">${data.distance} miles</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <!-- Detalles del Servicio -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:30px;">
                      <tr>
                        <td style="background-color:#f8f9fa;padding:20px;border-radius:6px;">
                          <h3 style="margin:0 0 15px 0;color:#0A6EFD;font-size:18px;">🎯 Detalles del Servicio</h3>
                          <table width="100%" cellpadding="5" cellspacing="0">
                            <tr>
                              <td style="color:#666;width:150px;"><strong>Vehículo:</strong></td>
                              <td style="color:#333;">${data.vehicleType}</td>
                            </tr>
                            <tr>
                              <td style="color:#666;"><strong>Tipo de viaje:</strong></td>
                              <td style="color:#333;">${data.tripType}</td>
                            </tr>
                            <tr>
                              <td style="color:#666;"><strong>Viaje de retorno:</strong></td>
                              <td style="color:#333;font-weight:${data.returnTrip ? '600' : 'normal'};">${data.returnTrip ? "✅ Sí" : "❌ No"}</td>
                            </tr>
                            ${data.returnTrip ? `
                              <tr>
                                <td style="color:#666;"><strong>Fecha retorno:</strong></td>
                                <td style="color:#333;">${data.returnDate}</td>
                              </tr>
                              <tr>
                                <td style="color:#666;"><strong>Hora retorno:</strong></td>
                                <td style="color:#333;">${data.returnTime}</td>
                              </tr>
                              <tr>
                                <td style="color:#666;"><strong>Esperar en sitio:</strong></td>
                                <td style="color:#333;">${data.waitOnSite ? "✅ Sí" : "❌ No"}</td>
                              </tr>
                            ` : ""}
                          </table>
                        </td>
                      </tr>
                    </table>

                    <!-- Servicios Adicionales -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:30px;">
                      <tr>
                        <td style="background-color:#fff3cd;padding:20px;border-radius:6px;border-left:4px solid #ffc107;">
                          <h3 style="margin:0 0 15px 0;color:#856404;font-size:18px;">➕ Servicios Adicionales</h3>
                          <table width="100%" cellpadding="5" cellspacing="0">
                            <tr>
                              <td style="color:#666;width:180px;"><strong>Equipamiento:</strong></td>
                              <td style="color:#333;">${data.equipment.length > 0 ? data.equipment.join(", ") : "Ninguno"}</td>
                            </tr>
                            <tr>
                              <td style="color:#666;"><strong>Servicio de cama:</strong></td>
                              <td style="color:#333;">${data.bedService}</td>
                            </tr>
                            <tr>
                              <td style="color:#666;"><strong>Asistencia adicional:</strong></td>
                              <td style="color:#333;">${data.additionalAssistance ? "✅ Sí" : "❌ No"}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <!-- Notas -->
                    ${data.notes ? `
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
                      <tr>
                        <td style="background-color:#f8f9fa;padding:20px;border-radius:6px;border-left:4px solid #6c757d;">
                          <h3 style="margin:0 0 10px 0;color:#495057;font-size:18px;">📝 Notas Adicionales</h3>
                          <p style="margin:0;color:#333;line-height:1.6;">${data.notes}</p>
                        </td>
                      </tr>
                    </table>
                    ` : ""}

                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color:#f8f9fa;padding:30px;text-align:center;border-top:3px solid #0A6EFD;">
                    <p style="margin:0 0 10px 0;color:#666;font-size:14px;">OnTheClock Transportation</p>
                    <p style="margin:0;color:#999;font-size:12px;">📞 (352) 623-2608 | 📧 ${process.env.COMPANY_EMAIL}</p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    // Email para el cliente
    const clientHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin:0;padding:0;background-color:#f4f4f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4;padding:20px 0;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
                
                <!-- Header con Logo -->
                <tr>
                  <td style="background:linear-gradient(135deg, #0A6EFD 0%, #0052CC 100%);padding:40px 30px;text-align:center;">
                    <div style="background-color:white;display:inline-block;padding:20px 40px;border-radius:8px;margin-bottom:15px;">
                      <img src="https://www.ontheclocktrans.com/logo.png" alt="OnTheClock Transportation" style="max-width:200px;height:auto;display:block;" />
                    </div>
                    <h2 style="margin:20px 0 0 0;color:#ffffff;font-size:24px;font-weight:600;">Booking Confirmed! ✓</h2>
                  </td>
                </tr>

                <!-- Contenido -->
                <tr>
                  <td style="padding:40px 30px;">
                    
                    <p style="margin:0 0 20px 0;color:#333;font-size:16px;line-height:1.6;">
                      Hello <strong>${data.passengerFirstName}</strong>,
                    </p>
                    
                    <p style="margin:0 0 30px 0;color:#666;font-size:15px;line-height:1.6;">
                      Thank you for choosing <strong>OnTheClock Transportation</strong>! We've received your booking request and our team will contact you shortly to confirm all the details.
                    </p>

                    <!-- Trip Summary -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:30px;">
                      <tr>
                        <td style="background:linear-gradient(135deg, #e7f3ff 0%, #f0f8ff 100%);padding:25px;border-radius:8px;border-left:4px solid #0A6EFD;">
                          <h3 style="margin:0 0 20px 0;color:#0A6EFD;font-size:20px;">🚗 Your Trip Summary</h3>
                          
                          <table width="100%" cellpadding="8" cellspacing="0">
                            <tr>
                              <td style="color:#666;font-size:14px;width:100px;vertical-align:top;"><strong>From:</strong></td>
                              <td style="color:#333;font-size:15px;line-height:1.5;">${data.pickupLocation}</td>
                            </tr>
                            <tr>
                              <td style="color:#666;font-size:14px;vertical-align:top;"><strong>To:</strong></td>
                              <td style="color:#333;font-size:15px;line-height:1.5;">${data.dropoffLocation}</td>
                            </tr>
                            <tr>
                              <td colspan="2" style="padding:10px 0;">
                                <div style="border-top:1px dashed #ccc;"></div>
                              </td>
                            </tr>
                            <tr>
                              <td style="color:#666;font-size:14px;"><strong>Date:</strong></td>
                              <td style="color:#333;font-size:15px;font-weight:600;">${data.rideDate}</td>
                            </tr>
                            <tr>
                              <td style="color:#666;font-size:14px;"><strong>Time:</strong></td>
                              <td style="color:#333;font-size:15px;font-weight:600;">${data.rideTime}</td>
                            </tr>
                            <tr>
                              <td style="color:#666;font-size:14px;"><strong>Vehicle:</strong></td>
                              <td style="color:#333;font-size:15px;">${data.vehicleType}</td>
                            </tr>
                            <tr>
                              <td style="color:#666;font-size:14px;"><strong>Distance:</strong></td>
                              <td style="color:#333;font-size:15px;">${data.distance} miles</td>
                            </tr>
                            ${data.returnTrip ? `
                              <tr>
                                <td colspan="2" style="padding:10px 0;">
                                  <div style="border-top:1px dashed #ccc;"></div>
                                </td>
                              </tr>
                              <tr>
                                <td style="color:#666;font-size:14px;"><strong>Return:</strong></td>
                                <td style="color:#333;font-size:15px;font-weight:600;">${data.returnDate} at ${data.returnTime}</td>
                              </tr>
                            ` : ""}
                          </table>
                        </td>
                      </tr>
                    </table>

                    <!-- Next Steps -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:30px;">
                      <tr>
                        <td style="background-color:#fff3cd;padding:20px;border-radius:8px;border-left:4px solid #ffc107;">
                          <h3 style="margin:0 0 15px 0;color:#856404;font-size:18px;">📋 Next Steps</h3>
                          <ol style="margin:0;padding-left:20px;color:#666;line-height:1.8;">
                            <li>Our team will contact you at <strong style="color:#333;">${data.contactPhone}</strong></li>
                            <li>We'll confirm all trip details and answer any questions</li>
                            <li>Payment information will be collected during confirmation</li>
                            <li>You'll receive a final confirmation before your trip</li>
                          </ol>
                        </td>
                      </tr>
                    </table>

                    <!-- Contact Info -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
                      <tr>
                        <td style="background-color:#f8f9fa;padding:20px;border-radius:8px;text-align:center;">
                          <p style="margin:0 0 10px 0;color:#666;font-size:14px;">Questions? We're here to help!</p>
                          <p style="margin:0;color:#0A6EFD;font-size:18px;font-weight:600;">📞 (352) 623-2608</p>
                        </td>
                      </tr>
                    </table>

                    <p style="margin:30px 0 0 0;color:#666;font-size:15px;line-height:1.6;text-align:center;">
                      Thank you for trusting us with your transportation needs!<br>
                      <strong style="color:#0A6EFD;">— The OnTheClock Team</strong>
                    </p>

                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color:#0A6EFD;padding:30px;text-align:center;">
                    <img src="https://www.ontheclocktrans.com/logo.png" alt="OnTheClock Transportation" style="max-width:150px;height:auto;margin-bottom:15px;filter:brightness(0) invert(1);" />
                    <p style="margin:0 0 5px 0;color:#e3f2ff;font-size:14px;">Reliable • Professional • On Time</p>
                    <p style="margin:0;color:#e3f2ff;font-size:13px;">📞 (352) 623-2608 | 📧 info@ontheclocktransport.com</p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    // Enviar a empresa
    await sgMail.send({
      to: process.env.COMPANY_EMAIL,
      from: process.env.FROM_EMAIL,
      subject: "Nueva Reservación Recibida",
      html: companyHTML,
    });

    console.log("✅ Email enviado a la empresa");

    // Enviar a cliente
    await sgMail.send({
      to: data.passengerEmail,
      from: process.env.FROM_EMAIL,
      subject: "Your Booking Has Been Received!",
      html: clientHTML,
    });

    console.log("✅ Email enviado al cliente");

    return res.json({ success: true });
  } catch (err) {
    console.error("❌ ERROR EN SENDGRID:", err.message);
    console.error("Stack:", err.stack);
    return res.status(500).json({ 
      success: false, 
      message: "Email error",
      error: err.message 
    });
  }
};