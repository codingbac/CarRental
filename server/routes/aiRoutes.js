import express from "express";
import { aiHelp } from "../controllers/aiController.js";
import { protect } from "../middleware/auth.js";

const aiRouter = express.Router();

aiRouter.post('/help', protect, aiHelp);

export default aiRouter;
