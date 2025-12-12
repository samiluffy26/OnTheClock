import express from "express";
import { sendBookingEmails } from "../controllers/emailController.js";

const router = express.Router();

router.post("/send", sendBookingEmails);

export default router;