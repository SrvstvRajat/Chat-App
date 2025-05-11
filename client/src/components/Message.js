import React from "react";

const Message = ({ message, isOwnMessage }) => {
  return (
    <div
      className={`message ${isOwnMessage ? "own-message" : "other-message"}`}
    >
      <div className="message-content">
        <p>{message.text}</p>
        <span className="message-time">
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
    </div>
  );
};

export default Message;
