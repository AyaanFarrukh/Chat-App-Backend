import express from "express";
import cors from "cors";
import connectDB from "./config/connectdb.mjs";
import router from "./router/router.mjs";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import http from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { Conversations } from "./models/ConversationModels.mjs";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}));

const server = http.createServer(app);
const io = new Server(server,{
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ["GET","POST"],
    credentials: true
  }
});

app.get("/api/ping", (req,res) => {
  res.status(200).send("Server is alive");
})

io.use((socket,next) => {
  console.log("handshake auth," ,socket.handshake.auth)
  const token = socket.handshake.auth?.token;
  if(!token) return next(new Error("Authentication Failed!"));
  try {
    const decode = jwt.verify(token,process.env.JWT_SECRET_KEY);
    if(!decode) return next(new Error("No User Found!"));
    socket.user = decode;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      socket.emit("token_expired");
      socket.disconnect(true); 
    }
    next(new Error(error));
  }
});

const onlineUsers = new Set();

const getChatList = async (userId) => {
  const Chatconversation = await Conversations.find({
    $or: [{ sender: userId }, { receiver: userId }]
  })
    .populate("sender", "name profile_pic")
    .populate("receiver", "name profile_pic")
    .lean()
    .sort({ updatedAt: -1 })
    .exec();

  return Chatconversation.map((conv) => {
    const otherUser = conv.sender._id.toString() === userId ? conv.receiver : conv.sender;
    return {
      conversationId: conv._id,
      otherUser,
      lastMessage: conv.messages[conv.messages.length - 1] || null,
      lastMessageseen: conv.messages[conv.messages.length - 1].seen
    };
  });
};


io.on("connection", (socket) => {

  socket.join(socket.user.id);

  onlineUsers.add(socket.user.id);

  io.emit("take_online_users",Array.from(onlineUsers));

  socket.on("disconnect",(msg) => {
    onlineUsers.delete(socket.user.id);
    io.emit("take_online_users",Array.from(onlineUsers));
  })

  socket.on("start_typing", (data) => {
    io.to(data.to).emit("show_typing",{
      from: socket.user.id
    })
  });

  socket.on("hide_typing",(data) => {
    io.to(data.to).emit("hide_typing",{
      from: socket.user.id
    })
  })

  socket.on("error", (err) => {
    if (err.message === "Token expired or invalid") {
      socket.disconnect(true);
    }
  });

  socket.on("send_message", async (data) => {
    const { senderId, recieverId, text, imageUrl, videoUrl } = data;
  
    try {
      let conversation = await Conversations.findOne({
        $or: [
          { sender: senderId, receiver: recieverId },
          { sender: recieverId, receiver: senderId }
        ]
      });
  
      const newMessage = {
        sender: senderId,
        receiver: recieverId,
        text,
        imageUrl: imageUrl || "",
        videoUrl: videoUrl || "",
        seen: false,
        createdAt: new Date()
      };
  
      if (!conversation) {
        conversation = new Conversations({
          sender: senderId,
          receiver: recieverId,
          messages: [newMessage]
        });
      } else {
        conversation.messages.push(newMessage);
      }

      conversation.messages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  
      await conversation.save();

      const senderChatList = await getChatList(senderId);
      const recieverChatList = await getChatList(recieverId);

      io.to(senderId).emit("take_chat_list", { chatList: senderChatList });
      io.to(senderId).emit("recieve_message", { conversation, message: newMessage });

      io.to(recieverId).emit("take_chat_list", { chatList: recieverChatList });
      io.to(recieverId).emit("recieve_message", { conversation, message: newMessage });

  
    } catch (error) {
      console.error("Error sending message:", error);
    }
  });

  socket.on("get_messages", async (data) => {
    const { conversationId, userId, otherUserId } = data;
    try {
      const conversation = await Conversations.findById(conversationId);
      if(!conversation) {
        io.to(userId).emit("get_messages_error",{
          success: false,
          conversation: false
        })
        return;
      }
      conversation.messages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      io.to(userId).emit("take_chat_messages",{
        conversation
      })

    } catch (error) {
      console.error("Error sending message:", error);
    }
  })

  socket.on("get_chat_list", async (data) => {
    const { userId } = data;
    try {
      const conversation = await Conversations.find({
        $or: [{ sender: userId },{ receiver: userId }]
      }).populate("sender").populate("receiver").sort({ updatedAt: -1 }).lean().exec();

      if(conversation.length === 0) {
        io.to(userId).emit("take_chat_list_error",{
          conversation: false
        })
        return;
      }
      const chatList = conversation.map((conv,i) => {
        const otherUser = conv.sender._id.toString() === userId ? conv.receiver : conv.sender;
        return {
          conversationId: conv._id,
          otherUser,
          lastMessage: conv.messages[conv.messages.length - 1] || null,
          lastMessageseen: conv.messages[conv.messages.length - 1].seen
        }
      });
      console.log(chatList);
      io.to(userId).emit("take_chat_list",{
        chatList
      });
      
    } catch (error) {
      console.error(error);
    }
  });

  socket.on("messages_seen", async (data) => {
    const { conversationId,userId,otherUserId } = data;
    try {
      const conversation = await Conversations.findById(conversationId);

      const messages = conversation.messages;

      conversation.messages = conversation.messages.map((msg) => {
        if (msg.receiver.toString() === userId.toString()) {
          msg.seen = true;
        }
        return msg;
      });
      await conversation.save();

      console.log(conversation.messages);

      const userChatList = await getChatList(userId);
      const otherChatList = await getChatList(otherUserId);

      io.to(userId).emit("take_chat_list", { chatList: userChatList });
      io.to(otherUserId).emit("take_chat_list", { chatList: otherChatList });

    } catch (error) {
   console.error(error);
    } 
  })
});

app.use("/api", router);

connectDB().then(() => {
  console.log("db is running!")
  server.listen(PORT, () => {
    console.log("server is running!");
  });
})

