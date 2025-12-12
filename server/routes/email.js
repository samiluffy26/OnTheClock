import express from "express";
import { sendBookingEmails } from "../controllers/emailController.js";

const router = express.Router();

router.post("/send", sendBookingEmails);
// book-ride route
router.post("/book-ride", async (req, res) => {
  try {
    console.log("📩 Reserva recibida:", req.body); // esto debe mostrar los datos reales

    await sendBookingEmails(req.body);

    res.json({ success: true });
  } catch (err) {
    console.error("❌ ERROR BOOK-RIDE:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;