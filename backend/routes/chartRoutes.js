import express from "express";
import { logChartCreation } from "../controllers/chartController.js";

const router = express.Router();

router.post("/create", logChartCreation);

export default router;
