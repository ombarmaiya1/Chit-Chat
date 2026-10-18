import { createContext,useContext,useEffect,useState } from "react";
import { io } from "socket.io-client";  

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({children , currentUser}) => {
    const [socket,setSocket] = useState(null);
    const [onlineUsers,setOnlineUsers] = useState([]);

    useEffect(() => {

    if(currentUser?._id){
        const newSocket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:4500",{
            withCredentials:true,
            
        });
        setSocket(newSocket);

    newSocket.on("connect",() => {
        newSocket.emit("register_user",currentUser._id);
    })

    newSocket.on("get_online_users",(users) => {
            setOnlineUsers(users);
        });

    return () => newSocket.close();

    }else{
        if(socket){
            socket.close();
            setSocket(null);
        }
    }

  

    }, [currentUser?._id]);

    return (
        <SocketContext.Provider value={{socket,onlineUsers}}>
            {children}
        </SocketContext.Provider>
    )
}
    
    