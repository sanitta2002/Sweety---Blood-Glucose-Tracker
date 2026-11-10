import { Router } from "express";
import { readingController } from "../controllers/reading.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

router.use(authenticate);

router.get("/reports", readingController.getReports);
router.post("/", readingController.create);
router.get("/", readingController.getAll);
router.get("/:id", readingController.getById);
router.put("/:id", readingController.update);
router.delete("/:id", readingController.delete);

export default router;
