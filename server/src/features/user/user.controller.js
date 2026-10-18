import User from "./user.model.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import OTP from "../auth/otp.model.js";
import SendOTPEmail from "../../services/email.service.js";
import Message from "../message/message.model.js";
import cloudinary from "../../config/cloudinary.js";
import { io } from "../../socket/socket.js";


const getme = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({ user });

    } catch (error) {
    error.statusCode = 500;
    error.message = "Error occurred while fetching user data";
    next(error);
  } 
}


const updateUser = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { fullName, email, password, description, profilePic } = req.body;

    // Disallow arbitrary or sensitive fields (e.g. attempting to update password directly)
    const allowedKeys = ["fullName", "email", "password", "description", "profilePic"];
    const invalidKeys = Object.keys(req.body).filter((k) => !allowedKeys.includes(k));
    if (invalidKeys.length > 0) {
      return res.status(400).json({
        message: `Disallowed field(s): ${invalidKeys.join(", ")}. Password changes must be performed via the dedicated password change flow.`,
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Require password if changing sensitive credentials (like email)
    if (email && email.toLowerCase().trim() !== user.email) {
      if (!password) {
        return res.status(400).json({ message: "Current password is required to change email address" });
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Invalid Password" });
      }

      const trimmedEmail = email.toLowerCase().trim();
      const existingUser = await User.findOne({
        email: trimmedEmail,
        _id: { $ne: user._id },
      });

      if (existingUser) {
        return res.status(400).json({ message: "Email is already registered to another account" });
      }

      user.email = trimmedEmail;
    } else if (password) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Invalid Password" });
      }
    }

    // Update name / username if provided
    if (fullName && fullName.trim()) {
      user.fullName = fullName.trim();
    }

    if (description !== undefined) {
      user.description = description;
    }

    // Update profilePic if provided
    if (profilePic !== undefined) {
      let imageUrl = profilePic;
      if (profilePic && profilePic.startsWith("data:image")) {
        if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
          try {
            const uploadRes = await cloudinary.uploader.upload(profilePic, {
              folder: "chit_chat_profiles",
              transformation: [
                { width: 400, height: 400, crop: "fill", gravity: "face" }
              ]
            });
            imageUrl = uploadRes.secure_url;
          } catch (uploadErr) {
            console.error("Cloudinary profile upload error, falling back:", uploadErr);
            imageUrl = profilePic;
          }
        }
      }
      user.profilePic = imageUrl;
    }

    await user.save();

    const updatedUser = {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      description: user.description || "",
      profilePic: user.profilePic || "",
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    if (io) {
      io.emit("user_updated", updatedUser);
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    error.statusCode = 500;
    error.message = "Error occurred while updating user information";
    next(error);
  }
};


const sendPasswordChangeOTP = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const newOTP = crypto.randomInt(100000, 999999).toString();

    // Store in OTP collection with 10-minute expiry
    await OTP.findOneAndUpdate(
      { email: user.email },
      { otp: newOTP, expiresAt: new Date(Date.now() + 10 * 60 * 1000) },
      { upsert: true, new: true }
    );

    // Send email with OTP
    await SendOTPEmail(user.email, newOTP);

    res.status(200).json({
      success: true,
      message: "OTP sent to your registered email address",
    });
  } catch (error) {
    error.statusCode = 500;
    error.message = "Error occurred while sending OTP";
    next(error);
  }
};

/**
 * Change password using OTP verification.
 * PUT /api/users/password
 */
const changePasswordWithOTP = async (req, res, next) => {
  try {
    const { otp, newPassword } = req.body;

    if (!otp || !newPassword) {
      return res.status(400).json({ message: "OTP and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters long" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify OTP from database
    const existingOTP = await OTP.findOne({ email: user.email });
    if (!existingOTP) {
      res.status(400).json({ message: "OTP expired or not found. Please request a new OTP" });
      return;
    }

    if (existingOTP.otp !== otp.trim()) {
      res.status(400).json({ message: "Invalid OTP code" });
      return;
    }

    // Hash and update password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    // Delete used OTP
    await existingOTP.deleteOne();

    res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    error.statusCode = 500;
    error.message = "Error occurred while changing password";
    next(error);
  }
};


const getUsersForSidebar = async (req, res, next) => {
  try {
    const loggedInUserId = req.user.id;
    const filteredUsers = await User.find({
      _id: { $ne: loggedInUserId },
    })
      .select("-password")
      .lean();

    const usersWithUnread = await Promise.all(
      filteredUsers.map(async (u) => {
        const unreadCount = await Message.countDocuments({
          senderId: u._id,
          receiverId: loggedInUserId,
          status: { $ne: "read" },
        });

        const lastMsg = await Message.findOne({
          $or: [
            { senderId: u._id, receiverId: loggedInUserId },
            { senderId: loggedInUserId, receiverId: u._id },
          ],
        }).sort({ createdAt: -1 });

        return {
          ...u,
          unreadCount,
          lastMessage: lastMsg
            ? String(lastMsg.senderId) === String(loggedInUserId)
              ? `You: ${lastMsg.message}`
              : lastMsg.message
            : "",
          lastMessageTime: lastMsg
            ? new Date(lastMsg.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "",
        };
      })
    );

    return res.status(200).json({
      users: usersWithUnread,
    });
  } catch (error) {
    error.statusCode = 500;
    error.message = "Error occurred while fetching users";
    next(error);
  }
};




const updateProfilePic = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { profilePic } = req.body;

    if (!profilePic) {
      return res.status(400).json({ message: "Profile picture image is required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let imageUrl = profilePic;
    if (profilePic.startsWith("data:image")) {
      if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
        try {
          const uploadRes = await cloudinary.uploader.upload(profilePic, {
            folder: "chit_chat_profiles",
            transformation: [
              { width: 400, height: 400, crop: "fill", gravity: "face" }
            ]
          });
          imageUrl = uploadRes.secure_url;
        } catch (uploadErr) {
          console.error("Cloudinary profile upload error, using fallback:", uploadErr);
          imageUrl = profilePic;
        }
      }
    }

    user.profilePic = imageUrl;
    await user.save();

    const updatedUser = {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      description: user.description || "",
      profilePic: user.profilePic || "",
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    if (io) {
      io.emit("user_updated", updatedUser);
    }

    return res.status(200).json({
      success: true,
      message: "Display picture updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    error.statusCode = 500;
    error.message = "Error occurred while updating profile picture";
    next(error);
  }
};

export { getme, updateUser, updateProfilePic, sendPasswordChangeOTP, changePasswordWithOTP, getUsersForSidebar };