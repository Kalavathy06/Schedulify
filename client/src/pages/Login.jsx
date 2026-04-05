
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("https://schedulify-api.onrender.com/api/auth/login", {
        email,
        password
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("username", res.data.username);

      navigate("/");
    } catch (err) {
      alert("Login failed");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <form onSubmit={handleLogin} className="bg-white p-8 shadow rounded w-80">
        <h2 className="text-xl font-bold mb-4">Login</h2>

        <input type="email" placeholder="Email"
          onChange={(e)=>setEmail(e.target.value)}
          className="w-full border p-2 mb-3" />

        <input type="password" placeholder="Password"
          onChange={(e)=>setPassword(e.target.value)}
          className="w-full border p-2 mb-3" />

        <button className="w-full bg-blue-600 text-white p-2 rounded">
          Login
        </button>
      </form>
    </div>
  );
}