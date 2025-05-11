import React, { createContext, useContext, useEffect, useState } from "react";
import io from "socket.io-client";

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // Connect to the real socket server
    const newSocket = io("http://localhost:5001");

    newSocket.on("connect", () => {
      console.log("Connected to socket server");
      setConnected(true);
    });

    newSocket.on("disconnect", () => {
      console.log("Disconnected from socket server");
      setConnected(false);
    });

    // Listen for user list updates
    newSocket.on("user_list", (userList) => {
      console.log("Received user list:", userList);
      setUsers(userList);
    });

    // Listen for errors
    newSocket.on("error", (error) => {
      console.error("Socket error:", error);
    });

    setSocket(newSocket);

    // Clean up the socket connection when the component unmounts
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
