import React from "react";

const OnlineStatus = ({ isOnline, isTyping }) => {
  return (
    <div className="status-indicator">
      {isTyping ? (
        <span className="typing-indicator">User is typing...</span>
      ) : (
        <span className={`online-status ${isOnline ? "online" : "offline"}`}>
          {isOnline ? "Online" : "User is offline"}
        </span>
      )}
    </div>
  );
};

export default OnlineStatus;
