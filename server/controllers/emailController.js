import sgMail from "@sendgrid/mail";
import dotenv from "dotenv";
dotenv.config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export const sendBookingEmails = async (req, res) => {
  try {
    const data = req.body;

    console.log("📩 Booking recibido:", data);

    // -----------------------
    // 1. EMAIL PARA LA EMPRESA
    // -----------------------
    const companyHTML = `
      <div style="font-family:Arial;padding:20px;background:#f7f7f7;">
        <h2 style="color:#0A6EFD;">Nueva Reservación Recibida</h2>

        <p><strong>Nombre:</strong> ${data.firstName} ${data.lastName}</p>
        <p><strong>Teléfono:</strong> ${data.phone}</p>
        <p><strong>Email:</strong> ${data.email}</p>

        <hr>

        <h3 style="color:#333;">Detalles del Viaje</h3>
        <p><strong>Pick-up:</strong> ${data.pickupLocation}</p>
        <p><strong>Drop-off:</strong> ${data.dropoffLocation}</p>
        <p><strong>Fecha:</strong> ${data.tripDate}</p>
        <p><strong>Hora:</strong> ${data.tripTime}</p>

        <hr>

        <h3 style="color:#333;">Detalles del Servicio</h3>
        <p><strong>Vehículo:</strong> ${data.vehicleType}</p>
        <p><strong>Round Trip:</strong> ${data.returnTrip ? "Sí" : "No"}</p>
        ${
          data.returnTrip
            ? `<p><strong>Fecha retorno:</strong> ${data.returnDate}</p>`
            : ""
        }

        <hr>

        <h3 style="color:#333;">Costo Total</h3>
        <p><strong>Total estimado:</strong> $${data.finalTotal}</p>

        <br><br>
      </div>
    `;

    // -----------------------
    // 2. EMAIL PARA EL CLIENTE
    // -----------------------
    const clientHTML = `
      <div style="font-family:Arial;padding:20px;background:#fff;">
        <h2 style="color:#0A6EFD;">Thank you for booking with OnTheClock Transportation!</h2>

        <p>Hello ${data.firstName},</p>
        <p>We’ve received your transportation request. Here is a summary:</p>

        <h3 style="color:#333;">Trip Summary</h3>
        <p><strong>Pick-up:</strong> ${data.pickupLocation}</p>
        <p><strong>Drop-off:</strong> ${data.dropoffLocation}</p>
        <p><strong>Vehicle:</strong> ${data.vehicleType}</p>
        <p><strong>Date:</strong> ${data.tripDate} at ${data.tripTime}</p>

        <h3>Total Estimated Cost</h3>
        <p><strong>Amount:</strong> $${data.finalTotal}</p>

        <br>

        <p>We will contact you soon to confirm your reservation.</p>
        <p>Thank you!</p>

        <br>
        <p>— OnTheClock Transportation</p>
      </div>
    `;

    // -----------------------
    // Enviar a empresa
    // -----------------------
    await sgMail.send({
      to: process.env.COMPANY_EMAIL,
      from: process.env.FROM_EMAIL,
      subject: "Nueva Reservación Recibida",
      html: companyHTML,
    });

    // -----------------------
    // Enviar a cliente
    // -----------------------
    await sgMail.send({
      to: data.email,
      from: process.env.FROM_EMAIL,
      subject: "Your Booking Has Been Received!",
      html: clientHTML,
    });

    return res.json({ success: true });
  } catch (err) {
    console.error("❌ ERROR EN SENDGRID:", err);
    return res.status(500).json({ success: false, message: "Email error" });
  }
};