import express from "express";
import { esewaFailure, esewaSuccess, initiateEsewaPayment } from "../controllers/paymentController.js";
import { protect } from "../middleware/auth.js";

const paymentRouter = express.Router();

paymentRouter.post('/esewa/initiate', protect, initiateEsewaPayment);
paymentRouter.get('/esewa/success', esewaSuccess);
paymentRouter.get('/esewa/failure', esewaFailure);

export default paymentRouter;
