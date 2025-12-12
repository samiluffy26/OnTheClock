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
      <div style="font-family:Arial;padding:20px;background:#f7f7f7;">
        <h2 style="color:#0A6EFD;">Nueva Reservación Recibida</h2>

        <h3>Información del Pasajero</h3>
        <p><strong>Nombre:</strong> ${data.passengerFirstName} ${data.passengerLastName}</p>
        <p><strong>Teléfono:</strong> ${data.passengerPhone}</p>
        <p><strong>Email:</strong> ${data.passengerEmail}</p>

        <h3>Contacto</h3>
        <p><strong>Nombre:</strong> ${data.contactFirstName} ${data.contactLastName}</p>
        <p><strong>Teléfono:</strong> ${data.contactPhone}</p>
        <p><strong>Email:</strong> ${data.contactEmail}</p>

        <hr>

        <h3 style="color:#333;">Detalles del Viaje</h3>
        <p><strong>Pick-up:</strong> ${data.pickupLocation}</p>
        <p><strong>Drop-off:</strong> ${data.dropoffLocation}</p>
        <p><strong>Fecha:</strong> ${data.rideDate}</p>
        <p><strong>Hora:</strong> ${data.rideTime}</p>
        <p><strong>Distancia:</strong> ${data.distance} miles</p>

        <hr>

        <h3 style="color:#333;">Detalles del Servicio</h3>
        <p><strong>Vehículo:</strong> ${data.vehicleType}</p>
        <p><strong>Tipo:</strong> ${data.tripType}</p>
        <p><strong>Return Trip:</strong> ${data.returnTrip ? "Sí" : "No"}</p>
        ${data.returnTrip ? `
          <p><strong>Fecha retorno:</strong> ${data.returnDate}</p>
          <p><strong>Hora retorno:</strong> ${data.returnTime}</p>
          <p><strong>Esperar en sitio:</strong> ${data.waitOnSite ? "Sí" : "No"}</p>
        ` : ""}

        <h3>Servicios Adicionales</h3>
        <p><strong>Equipamiento:</strong> ${data.equipment.join(", ") || "Ninguno"}</p>
        <p><strong>Servicio de cama:</strong> ${data.bedService}</p>
        <p><strong>Asistencia adicional:</strong> ${data.additionalAssistance ? "Sí" : "No"}</p>

        ${data.notes ? `<h3>Notas</h3><p>${data.notes}</p>` : ""}

        <br><br>
      </div>
    `;

    // Email para el cliente
    const clientHTML = `
      <div style="font-family:Arial;padding:20px;background:#fff;">
        <h2 style="color:#0A6EFD;">Thank you for booking with OnTheClock Transportation!</h2>

        <p>Hello ${data.passengerFirstName},</p>
        <p>We've received your transportation request. Here is a summary:</p>

        <h3 style="color:#333;">Trip Summary</h3>
        <p><strong>Pick-up:</strong> ${data.pickupLocation}</p>
        <p><strong>Drop-off:</strong> ${data.dropoffLocation}</p>
        <p><strong>Vehicle:</strong> ${data.vehicleType}</p>
        <p><strong>Date:</strong> ${data.rideDate} at ${data.rideTime}</p>
        <p><strong>Distance:</strong> ${data.distance} miles</p>

        ${data.returnTrip ? `<p><strong>Return:</strong> ${data.returnDate} at ${data.returnTime}</p>` : ""}

        <br>

        <p>We will contact you at <strong>${data.contactPhone}</strong> to confirm your reservation and collect payment information.</p>
        <p>Thank you for choosing us!</p>

        <br>
        <p>— OnTheClock Transportation</p>
        <p>Phone: (352) 623-2608</p>
      </div>
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


