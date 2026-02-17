import express from "express";
import { handleFileUpload } from "../controllers/fileController.js";

const router = express.Router();

// Upload file metadata (used for dashboard stats)
router.post("/upload", handleFileUpload);

export default router;
