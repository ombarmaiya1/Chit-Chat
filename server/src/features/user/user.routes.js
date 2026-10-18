import { Router } from "express";
import { getme, updateUser, updateProfilePic, sendPasswordChangeOTP, changePasswordWithOTP, getUsersForSidebar } from "./user.controller.js";
import { VerifyUser } from "../../middlewares/auth.middleware.js";

const router = Router();

router.get("/me", VerifyUser, getme);
router.put("/update-user", VerifyUser, updateUser);
router.put("/update-dp", VerifyUser, updateProfilePic);
router.post("/send-password-change-otp", VerifyUser, sendPasswordChangeOTP);
router.post("/change-password-otp", VerifyUser, changePasswordWithOTP);
router.get("/", VerifyUser, getUsersForSidebar);

export default router;