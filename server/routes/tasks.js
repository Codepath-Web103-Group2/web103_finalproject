import express from "express";
import {
  createTask,
  deleteTask,
  getTask,
  getTasks,
  updateTask,
} from "../controllers/tasksController.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = express.Router();

router.use(requireAuth);

router.get("/", getTasks);
router.get("/:id", getTask);
router.post("/", createTask);
router.patch("/:id", updateTask);
router.delete("/:id", deleteTask);

export default router;
