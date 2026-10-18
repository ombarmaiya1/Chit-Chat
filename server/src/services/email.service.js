import sendEmail from "../config/email.config.js";

 const SendOTPEmail = async (email, otp) => {
  try {
    const subject = "Your chit-Chat OTP Code";
    const message = `Your chit-Chat OTP code is: ${otp}. Please use this code to complete your verification process.`;

    await sendEmail(email, subject, message);
  } catch (error) {
    console.error("Error sending OTP email:", error);
    throw new Error("Failed to send OTP email");
  }
};


export default SendOTPEmail;