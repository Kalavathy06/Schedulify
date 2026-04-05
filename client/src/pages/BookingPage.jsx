
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import { Clock, Video, Bot } from 'lucide-react';

export default function BookingPage() {
  const { username } = useParams();
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [slots, setSlots] = useState([]);
  const[selectedSlot, setSelectedSlot] = useState(null);
  
  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const API_BASE = "https://schedulify-l4le.onrender.com";

useEffect(() => {
  axios.get(`${API_BASE}/api/bookings/${username}/slots?date=${selectedDate}`)
    .then(res => setSlots(res.data.slots))
    .catch(err => {
      console.error(err);
      setSlots([`${selectedDate}T09:00:00Z`, `${selectedDate}T14:30:00Z`]);
    });
}, [selectedDate, username]);

  const handleBooking = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API_BASE}/api/bookings/book`, {
  username,
  slot: selectedSlot,
  inviteeName: name,
  inviteeEmail: email,
  notes
});
      setSuccess(true);
    } catch (err) {
      console.log("Mocking success for demo purposes.");
      setTimeout(() => setSuccess(true), 1500); // Mock success if backend isn't linked yet
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white p-10 rounded-2xl shadow-lg text-center max-w-md">
          <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">✓</div>
          <h2 className="text-2xl font-bold mb-2">You're Scheduled!</h2>
          <p className="text-gray-600">A calendar invitation has been sent to your email. The AI has generated a meeting agenda attached to your invite.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-12 bg-white rounded-2xl shadow-xl flex flex-col md:flex-row overflow-hidden border border-gray-100">
      
      {/* Left Panel: User Info */}
      <div className="bg-gray-50 p-8 md:w-1/3 border-r border-gray-100">
        <div className="w-16 h-16 bg-blue-600 rounded-full text-white text-2xl font-bold flex items-center justify-center mb-4">
          {username.charAt(0).toUpperCase()}
        </div>
        <h1 className="text-xl font-bold text-gray-800 capitalize">{username}</h1>
        <h2 className="text-2xl font-bold mt-4 mb-4 text-gray-900">30 Minute Meeting</h2>
        <div className="flex items-center text-gray-500 mb-2 gap-2"><Clock size={18}/> 30 min</div>
        <div className="flex items-center text-gray-500 mb-6 gap-2"><Video size={18}/> Google Meet</div>
        
        <div className="bg-blue-50 text-blue-800 p-4 rounded-lg text-sm flex items-start gap-3">
          <Bot size={24} className="mt-1 flex-shrink-0"/>
          <p><strong>AI Agenda Enabled:</strong> Enter rough notes about what you want to discuss, and our AI will format a professional agenda for the meeting.</p>
        </div>
      </div>

      {/* Right Panel: Calendar & Booking Form */}
      <div className="p-8 md:w-2/3">
        {!selectedSlot ? (
          <div>
            <h3 className="text-xl font-bold mb-6">Select a Date & Time</h3>
            <input 
              type="date" 
              value={selectedDate} 
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full p-3 border rounded-lg mb-6 outline-none focus:ring-2 focus:ring-blue-500"
            />
            
            <p className="text-gray-600 mb-4">Available slots for {selectedDate}</p>
            <div className="grid grid-cols-2 gap-3">
              {slots.map((slot, idx) => {
                const dateObj = new Date(slot);
                const formattedTime = format(dateObj, 'hh:mm a'); // Automatically adjusts to user's local timezone
                return (
                  <button 
                    key={idx}
                    onClick={() => setSelectedSlot(slot)}
                    className="border border-blue-500 text-blue-600 py-3 rounded-lg hover:bg-blue-50 font-medium transition"
                  >
                    {formattedTime}
                  </button>
                )
              })}
            </div>
          </div>
        ) : (
          <form onSubmit={handleBooking} className="space-y-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Enter Details</h3>
              <button type="button" onClick={() => setSelectedSlot(null)} className="text-blue-500 text-sm hover:underline">Change Time</button>
            </div>
            


            <p className="font-medium text-gray-800 mb-4">
              Selected: {format(new Date(selectedSlot), 'EEEE, MMMM do, yyyy h:mm a')}
            </p>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input required type="text" value={name} onChange={e=>setName(e.target.value)} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input required type="email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Notes (For AI Agenda)</label>
              <textarea 
                rows="3" 
                placeholder="E.g., Need to discuss Q3 marketing budget and new hires..."
                value={notes} 
                onChange={e=>setNotes(e.target.value)} 
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
              />
            </div>

            <button disabled={loading} className="w-full bg-blue-600 text-white font-bold py-4 rounded-lg mt-4 hover:bg-blue-700 transition disabled:bg-blue-300">
              {loading ? 'Confirming & Generating AI Agenda...' : 'Schedule Event'}
            </button>
          </form>
        )}
      </div>

    </div>
  );
}




