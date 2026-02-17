import express from "express";
import { logInsight } from "../controllers/insightController.js";

const router = express.Router();

router.post("/create", logInsight);

export default router;
