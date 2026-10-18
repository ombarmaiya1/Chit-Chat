import nodemailer from "nodemailer";
import {EMAIL_USER} from "./config.js";
import {EMAIL_PASS} from "./config.js";

const sendEmail = async (to, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
      },
    });

    const mailOptions = {
      from:EMAIL_USER, // Sender's email address
      to: to, // Recipient's email address
      subject: subject, // Email subject
      html: text, // Email content in HTML format
    };

    const res = await transporter.sendMail(mailOptions);
    return res;
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Error occurred while sending email");
  }
};

export default sendEmail;
