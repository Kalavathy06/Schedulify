//C:\schedulify-app\client\src\pages\Register.jsx
import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  // THIS is the function that was missing!
  const handleRegister = async (e) => {
    e.preventDefault(); // Prevents the page from refreshing
    try {
      await axios.post("https://schedulify-l4le.onrender.com/api/auth/register", {  
        username, 
        email, 
        password 
      });
      alert("Registration successful! Please login.");
      navigate("/login");
    } catch (err) {
      console.error("Full error object:", err);
      // Safely check if a response exists, otherwise fallback to the network error message
      const errorMessage = err.response?.data?.error || err.message || "Could not connect to the server.";
      alert("Registration failed: " + errorMessage);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <form onSubmit={handleRegister} className="bg-white p-8 shadow rounded w-80">
        <h2 className="text-xl font-bold mb-4">Register</h2>
        
        <input 
          type="text" 
          placeholder="Username" 
          onChange={(e) => setUsername(e.target.value)} 
          className="w-full border p-2 mb-3" 
          required
        />
        
        <input 
          type="email" 
          placeholder="Email" 
          onChange={(e) => setEmail(e.target.value)} 
          className="w-full border p-2 mb-3" 
          required
        />
        
        <input 
          type="password" 
          placeholder="Password" 
          onChange={(e) => setPassword(e.target.value)} 
          className="w-full border p-2 mb-3" 
          required
        />
        
        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded mb-2">
          Register
        </button>
        
        <Link to="/login" className="text-sm text-blue-500 text-center block">
          Already have an account? Login
        </Link>
      </form>
    </div>
  );
}