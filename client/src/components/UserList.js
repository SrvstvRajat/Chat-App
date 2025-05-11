import React from "react";
import "./UserList.css";
import { useNavigate } from "react-router-dom";

const UserList = ({ users, currentUser, setChatHistory }) => {
  const navigate = useNavigate();

  const handleUserClick = async (recipient) => {
    try {
      const res = await fetch(
        `https://chat-app-uvyv.onrender.com/chats/accessChat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            senderId: currentUser._id,
            recipientId: recipient._id,
          }),
        }
      );

      const chat = await res.json();
      if (!res.ok) throw new Error(chat.message || "Unable to access chat");

      const recipientUser = chat.user.filter(
        (user) => user._id !== currentUser._id
      );
      navigate(`/chat/${chat._id}`, {
        state: {
          recipientUser,
        },
      });
    } catch (err) {
      console.error("Failed to access or fetch chat", err);
    }
  };

  return (
    <div>
      <h2>Select a user to chat with:</h2>
      <ul>
        {users
          .filter((u) => u._id !== currentUser._id)
          .map((user) => (
            <li
              key={user._id}
              onClick={() => handleUserClick(user)}
              style={{ cursor: "pointer", marginBottom: "8px" }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  width: "300px",
                }}
              >
                <span>{user.name}</span>
                <span>{user.status}</span>
              </div>
            </li>
          ))}
      </ul>
    </div>
  );
};

export default UserList;
