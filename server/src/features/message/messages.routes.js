import Router from "express";
import { sendMessage, getMessages } from "./message.controller.js";
import { VerifyUser } from "../../middlewares/auth.middleware.js";

const router = Router();

router.post("/send/:receiverId", VerifyUser, sendMessage);
router.get("/:receiverId", VerifyUser, getMessages);

export default router;