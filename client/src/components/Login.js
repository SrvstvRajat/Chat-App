import React, { useState, useEffect } from "react";
import { useSocket } from "../context/SocketContext";
import "./Login.css";

const Login = ({ onLogin }) => {
  const { socket } = useSocket();
  const [isSignup, setIsSignup] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    if (!socket) return;

    const handleLoginSuccess = (userData) => {
      console.log("Login success received:", userData);
      onLogin(userData);
    };

    socket.on("login_success", handleLoginSuccess);

    return () => {
      socket.off("login_success", handleLoginSuccess);
    };
  }, [socket, onLogin]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { name, email, password } = form;
    if (!email.trim() || !password.trim() || (isSignup && !name.trim())) return;

    try {
      const endpoint = isSignup ? "/users/signup" : "/users/login";
      console.log(endpoint);

      const res = await fetch(`https://chat-app-uvyv.onrender.com${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Login/Signup failed");
      console.log(data);

      socket.emit("login", data);
      onLogin(data);
    } catch (err) {
      console.error(err.message);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-box">
        <h2>{isSignup ? "Sign Up" : "Log In"} to Chat</h2>
        <form onSubmit={handleSubmit}>
          {isSignup && (
            <input
              type="text"
              name="name"
              placeholder="name"
              value={form.name}
              onChange={handleChange}
              required
            />
          )}
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
          />
          <button type="submit">{isSignup ? "Sign Up" : "Log In"}</button>
        </form>
        <p onClick={() => setIsSignup((prev) => !prev)} className="toggle">
          {isSignup
            ? "Already have an account? Log In"
            : "Don't have an account? Sign Up"}
        </p>
      </div>
    </div>
  );
};

export default Login;
