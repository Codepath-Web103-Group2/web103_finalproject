import express from "express";
import { createTag, deleteTag, getTags } from "../controllers/tagsController.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = express.Router();

router.use(requireAuth);

router.get("/", getTags);
router.post("/", createTag);
router.delete("/:id", deleteTag);

export default router;
