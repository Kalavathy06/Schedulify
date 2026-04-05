import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Calendar, Link as LinkIcon, Settings } from 'lucide-react';
import axios from 'axios'; 

export default function Dashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [username, setUsername] = useState(localStorage.getItem("username") || "");
  const baseUrl = window.location.origin;
  
  const [start, setStart] = useState("09:00");
  const [end, setEnd] = useState("17:00");

  const saveAvailability = async () => {
    try {
      await axios.post("https://schedulify-l4le.onrender.com/api/bookings/availability", {
        username,
        startHour: start,
        endHour: end
      });
      alert("Availability Saved Successfully!");
    } catch (error) {
      console.error(error);
      alert("Failed to save availability. Check console for details.");
    }
  };

  useEffect(() => {
    // If returning from Google Auth, catch the username from the URL
    const urlUser = searchParams.get("username");
    if (urlUser) {
      localStorage.setItem("username", urlUser);
      setUsername(urlUser);
      // Clean up the URL so it looks nice
      setSearchParams({}); 
    }
  }, [searchParams, setSearchParams]);

  if (!username) return <div>Loading...</div>;

  return (
    <div className="max-w-5xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Welcome back, {username}!</h1>
      
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <LinkIcon size={20} className="text-blue-500"/> Your Booking Link
          </h2>
        </div>
        <div className="bg-gray-50 p-4 rounded-md border flex justify-between items-center">
          <p className="text-gray-600 font-mono">{baseUrl}/book/{username}</p>
          <Link to={`/book/${username}`} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition">
            View Live Page
          </Link>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mt-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Calendar size={20}/> Availability
          </h2>
          <p className="text-sm text-gray-500 mb-4">Set your standard working hours.</p>
          <div className="flex gap-4">
            <input 
              type="time" 
              value={start} 
              onChange={e => setStart(e.target.value)} 
              className="border p-2 rounded flex-1 outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="self-center">to</span>
            <input 
              type="time" 
              value={end} 
              onChange={e => setEnd(e.target.value)} 
              className="border p-2 rounded flex-1 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {/* I added a little styling here to make it look like a real button! */}
          <button 
            onClick={saveAvailability}
            className="mt-4 w-full bg-gray-900 text-white py-2 rounded hover:bg-gray-800 transition"
          >
            Save Hours
          </button>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Settings size={20}/> Integrations
          </h2>
          <p className="text-sm text-gray-500 mb-4">Connect your calendar and AI features.</p>
          <button
            onClick={() => window.open("https://schedulify-l4le.onrender.com/auth/google", "_self")}
            className="w-full border py-2 rounded flex justify-center items-center gap-2 hover:bg-gray-50 transition"
          >
            Connect Google Calendar
          </button>
          <button
            onClick={() => window.open("https://schedulify-l4le.onrender.com/auth/microsoft", "_self")}
            className="w-full border py-2 rounded flex justify-center items-center gap-2 mt-3 hover:bg-gray-50 transition"
          >
            Connect Outlook Calendar
          </button>
        </div>
      </div>
    </div>
  );
}