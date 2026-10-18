import { Router } from 'express';
import { RegisterUser, LoginUser , LogoutUser, SendOTP , VerifyOTP, ResetPassword
} from './auth.controller.js';
import {ValidateOTP} from "../../middlewares/auth.middleware.js"
const router = Router();

router.post('/register', RegisterUser);

router.post('/login', LoginUser);

router.post('/logout', LogoutUser);


router.post('/send-otp', SendOTP);

router.post('/verify-otp', VerifyOTP);

router.post('/reset-password', ValidateOTP, ResetPassword);

export default router;