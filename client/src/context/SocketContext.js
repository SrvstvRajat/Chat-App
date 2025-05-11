import React, { createContext, useContext, useEffect, useState } from "react";
import io from "socket.io-client";

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const newSocket = io("https://chat-app-uvyv.onrender.com");

    newSocket.on("connect", () => {
      console.log("Connected to socket server");
      setConnected(true);
    });

    newSocket.on("disconnect", () => {
      console.log("Disconnected from socket server");
      setConnected(false);
    });

    newSocket.on("user_list", (userList) => {
      console.log("Received user list:", userList);
      setUsers(userList);
    });

    newSocket.on("error", (error) => {
      console.error("Socket error:", error);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, connected, users }}>
      {children}
    </SocketContext.Provider>
  );
};
