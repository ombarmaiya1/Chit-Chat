import Message from "./message.model.js"
import Conversation from "./conversation.model.js";
import { io , onlineUsers} from "../../socket/socket.js";
import cloudinary from "../../config/cloudinary.js";

const sendMessage = async(req,res)=>{
    try {
        const { message, image } = req.body;
        const senderId = req.user.id;
        const receiverId = req.params.receiverId;

        if (!message?.trim() && !image) {
            return res.status(400).json({ message: "Message text or image is required" });
        }

        let imageUrl = null;
        if (image) {
            if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
                try {
                    const uploadRes = await cloudinary.uploader.upload(image, {
                        folder: "chit_chat_messages",
                    });
                    imageUrl = uploadRes.secure_url;
                } catch (uploadErr) {
                    console.error("Cloudinary upload error, using direct image fallback:", uploadErr);
                    imageUrl = image;
                }
            } else {
                imageUrl = image;
            }
        }

        const newMsg = await Message.create({
            senderId,
            receiverId,
            message: message ? message.trim() : "",
            image: imageUrl,
        });

        let conversation = await Conversation.findOne({
            participants: { $all: [senderId, receiverId] },
        })

        if(!conversation){
            conversation = await Conversation.create({
                participants: [senderId, receiverId],
            })
        }
        
            conversation.messages.push(newMsg._id);
            await conversation.save();

        const receiverSocketId = onlineUsers[receiverId];

        if(receiverSocketId){
            io.to(receiverSocketId).emit("new_message",newMsg);
        }

        return res.status(201).json({
            newMsg
        })
    } catch (error) {
        console.error("❌ Error in sendMessage:", error);
        return res.status(500).json({
            message: "Failed to send message",
        })
    }
}


const getMessages = async(req,res)=>{
    try{
        const {receiverId} = req.params;
        const senderId = req.user.id;

        const conversation = await Conversation.findOne({
            participants: { $all: [senderId, receiverId] },
        }).populate("messages")

        if(!conversation){
            return res.status(200).json({
                messages: [],
            })
        }

        // Mark all messages from the other user as read
        await Message.updateMany(
            { senderId: receiverId, receiverId: senderId, status: { $ne: "read" } },
            { $set: { status: "read" } }
        );

        return res.status(200).json({
            messages: conversation.messages,
        })
    }catch(error){
        return res.status(500).json({
            message: "Failed to get messages",
        })
    }
}
    
        export {sendMessage,getMessages};
        


