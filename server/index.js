// CONFIGURATION IMPORTS
import express from "express";
import http from 'http'
import { PORT } from "./src/config/config.js";
import connectDB from "./src/config/db.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import { initSocket } from "./src/socket/socket.js";
// SERVICES IMPORTS
//
//

// ROUTES IMPORTS
import authRoutes from "./src/features/auth/auth.routes.js";
import userRoutes from "./src/features/user/user.routes.js";
import messageRoutes from "./src/features/message/messages.routes.js";

//********************************************************************************* */

// SERVER CONFIGURATION

const app = express();
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
  }),
);

const server = http.createServer(app);

const io = initSocket(server);




app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));
app.use(cookieParser());
await connectDB();

// ROUTES
app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/messages", messageRoutes);


app.get("/", (req, res) => {
  res.json("Hello World ");
});

// DEFAULT ERROR HANDLER
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  console.error(err.stack);
  res.status(statusCode).json({ message });
});



server.listen(PORT, () => {
  console.log(`\nServer Started a Port : ${PORT}`);
});
