import React, { useState } from "react";
import { loginUser } from "../services/authService";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    setMessage("");
    try {
      const data = await loginUser({ email, password });

      setMessage(`Welcome ${data.name} (${data.role})`);

      if (data.role === "admin") {
        navigate("/admin");
      } else if (data.role === "kitchen") {
        navigate("/kitchen-home");
      } else {
        navigate("/");
      }
    } catch (error) {
      setMessage("Invalid credentials");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #8e2de2, #ff4ecd)",
        fontFamily: "Segoe UI, sans-serif",
      }}
    >
      <div
        style={{
          width: "360px",
          padding: "35px",
          borderRadius: "14px",
          background: "rgba(255,255,255,0.95)",
          boxShadow: "0 8px 25px rgba(0,0,0,0.25)",
          textAlign: "center",
        }}
      >
        <h2
          style={{
            marginBottom: "25px",
            color: "#6a1b9a",
            fontWeight: "600",
          }}
        >
          DINE TECH Login
        </h2>

        <input
          type="email"
          placeholder="Enter Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            marginBottom: "15px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            fontSize: "14px",
          }}
        />

        <input
          type="password"
          placeholder="Enter Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            marginBottom: "20px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            fontSize: "14px",
          }}
        />

        <button
          onClick={handleLogin}
          style={{
            width: "100%",
            padding: "12px",
            background: "linear-gradient(135deg,#8e2de2,#ff4ecd)",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontWeight: "bold",
            fontSize: "15px",
            cursor: "pointer",
            transition: "0.2s",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.transform = "scale(1.05)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.transform = "scale(1)")
          }
        >
          Login
        </button>

        {message && (
          <p
            style={{
              marginTop: "15px",
              fontWeight: "500",
              color: message.includes("Invalid") ? "red" : "green",
            }}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

export default Login;
