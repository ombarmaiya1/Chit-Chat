import {Server} from "socket.io";

export const onlineUsers = {};
export let io;

export const initSocket = (server)=>{
    io = new Server(server,{
        cors : {
            origin: process.env.CORS_ORIGIN || "http://localhost:5173",
            credentials: true,
        }
    });

    io.on("connection",(socket)=>{
     
        socket.on("register_user", (userId)=>{
            socket.userId = userId;
            onlineUsers[userId] = socket.id;
            io.emit("get_online_users",Object.keys(onlineUsers));

        });

        socket.on("disconnect",() =>{
                delete onlineUsers[socket.userId];
            io.emit("get_online_users",Object.keys(onlineUsers));
        })

    

    });

    return io;
}
