import React, { useState, useEffect, useRef } from "react";
import { useSocket } from "../context/SocketContext";
import Message from "./Message";
import OnlineStatus from "./OnlineStatus";

const Chat = ({ currentUser, recipient, chatId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isRecipientOnline, setIsRecipientOnline] = useState(false);
  const { socket } = useSocket();
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [istyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const handleStatus = ({ userId, status }) => {
      console.log("h bjuinn", userId, status, recipient._id);

      if (userId === recipient._id) {
        setIsRecipientOnline(status === "online");
      }
    };
    socket.on("user_status", handleStatus);
  }, [socket, recipient._id, isRecipientOnline]);

  const handleSendMessage = async (e) => {
    if (e.key === "Enter" && newMessage) {
      socket.emit("stop typing", chatId);
    }
    e.preventDefault();
    if (!newMessage.trim()) return;
    const messageData = {
      senderId: currentUser._id,
      recipientId: recipient._id,
      text: newMessage,
      chatId,
      timestamp: new Date().toISOString(),
    };

    const res = await fetch(`http://localhost:5001/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(messageData),
    });
    const data = await res.json();

    if (socket && socket.connected) {
      socket.emit("send_message", messageData);
    }
    socket.emit("new message", data);
    setMessages([...messages, data]);
    setNewMessage("");
  };

  const fetchMessages = async () => {
    try {
      const res = await fetch(`http://localhost:5001/messages/${chatId}`, {
        method: "GET",
      });

      const data = await res.json();
      if (recipient.status === "online") setIsRecipientOnline(true);

      if (data) setMessages(data);

      socket.emit("join chat", chatId);
    } catch (error) {
      console.log(error.message);
    }
  };

  useEffect(() => {
    socket.emit("setup", currentUser);
    socket.on("connected", () => setSocketConnected(true));
    socket.on("typing", () => setIsTyping(true));
    socket.on("stop typing", () => setIsTyping(false));

    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    fetchMessages();

    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    socket.on("message recieved", (newMessageRecieved) => {
      if (chatId === newMessageRecieved.chat._id) {
        setMessages([...messages, newMessageRecieved]);
      }
    });
  });

  const handleTyping = (e) => {
    setNewMessage(e.target.value);

    if (!socketConnected) return;

    if (!typing) {
      setTyping(true);
      socket.emit("typing", chatId);
    }
    let lastTypingTime = new Date().getTime();
    var timerLength = 3000;
    setTimeout(() => {
      var timeNow = new Date().getTime();
      var timeDiff = timeNow - lastTypingTime;
      if (timeDiff >= timerLength && typing) {
        socket.emit("stop typing", chatId);
        setTyping(false);
      }
    }, timerLength);
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h3>{recipient.name}</h3>
        <OnlineStatus isOnline={isRecipientOnline} />
      </div>

      <div className="messages-container">
        {messages?.map((message, index) => {
          return (
            <Message
              key={index}
              message={message}
              isOwnMessage={message.senderId._id === currentUser._id}
            />
          );
        })}

        <div ref={messagesEndRef} />
      </div>
      {istyping ? <div>{currentUser.name} is typing...</div> : <></>}
      <form className="message-input-form" onSubmit={handleSendMessage}>
        <input
          type="text"
          value={newMessage}
          onChange={handleTyping}
          placeholder="Type a message..."
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default Chat;
