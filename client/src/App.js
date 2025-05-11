import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  useParams,
  Navigate,
  useLocation,
} from "react-router-dom";
import { SocketProvider } from "./context/SocketContext";
import Login from "./components/Login";
import Chat from "./components/Chat";
import "./App.css";
import UserList from "./components/UserList";

const MessageRoute = ({ currentUser }) => {
  const { id } = useParams();
  const location = useLocation();
  const recipient = location.state?.recipientUser[0];
  if (!recipient) return <div>Loading recipient...</div>;

  return <Chat currentUser={currentUser} recipient={recipient} chatId={id} />;
};

function AppContent() {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("http://localhost:5001/users");
        const data = await res.json();
        setUsers(data);
      } catch (err) {
        console.error("Failed to fetch users", err);
      }
    };

    fetchUsers();
  }, []);

  const handleLogin = (userData) => {
    setCurrentUser(userData);
    setUsers((prev) => [...prev, userData]);
    navigate("/users");
  };

  return (
    <div className="app">
      <h1>Simple Chat App</h1>
      <Routes>
        <Route
          path="/"
          element={
            !currentUser ? (
              <Login onLogin={handleLogin} />
            ) : (
              <Navigate to="/users" replace />
            )
          }
        />
        <Route
          path="/users"
          element={
            currentUser ? (
              <UserList users={users} currentUser={currentUser} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/chat/:id"
          element={
            currentUser ? (
              <MessageRoute currentUser={currentUser} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
      </Routes>
    </div>
  );
}

// App Root
function App() {
  return (
    <SocketProvider>
      <Router>
        <AppContent />
      </Router>
    </SocketProvider>
  );
}

export default App;
