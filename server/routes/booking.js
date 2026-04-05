const express = require('express');
const { google } = require('googleapis');
const { OpenAI } = require('openai');
const User = require('../models/User');
const moment = require('moment-timezone');
const router = express.Router();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// 0. UPDATE AVAILABILITY
router.post('/availability', async (req, res) => {
  try {
    const { username, startHour, endHour } = req.body;

    const user = await User.findOneAndUpdate(
      { username },
      { availability: { startHour, endHour } },
      { new: true }
    );

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Setup Google Calendar Auth
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET
);

// 1. GET AVAILABLE SLOTS (With Timezone Fix)
router.get('/:username/slots', async (req, res) => {
  try {
    const { username } = req.params;
    const { date } = req.query; // YYYY-MM-DD
    
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ error: "User not found" });

    oauth2Client.setCredentials({ refresh_token: user.googleRefreshToken });
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    
    // Set Timezone (Default to Asia/Kolkata if not provided)
    const timezone = user.timezone || "Asia/Kolkata";

    // Safely parse timeMin and timeMax in the correct timezone
    const timeMin = moment.tz(`${date} ${user.availability.startHour}`, "YYYY-MM-DD HH:mm", timezone).toISOString();
    const timeMax = moment.tz(`${date} ${user.availability.endHour}`, "YYYY-MM-DD HH:mm", timezone).toISOString();

    // Query Google Calendar for busy periods
    const response = await calendar.freebusy.query({
      requestBody: {
        timeMin,
        timeMax,
        items: [{ id: 'primary' }]
      }
    });

    const busySlots = response.data.calendars.primary.busy;

    const generateSlots = (date, startHour, endHour, tz, duration) => {
      const slots = [];
      let current = moment.tz(`${date} ${startHour}`, "YYYY-MM-DD HH:mm", tz);
      const end = moment.tz(`${date} ${endHour}`, "YYYY-MM-DD HH:mm", tz);

      while (current.isBefore(end)) {
        slots.push(current.toISOString());
        current = current.add(duration, 'minutes');
      }
      return slots;
    };

    const allSlots = generateSlots(
      date,
      user.availability.startHour,
      user.availability.endHour,
      timezone,
      30 // Default 30 min duration
    );

    // Accurately check if a slot overlaps with a busy period
    const availableSlots = allSlots.filter(slot => {
      const slotStart = new Date(slot).getTime();
      const slotEnd = slotStart + (30 * 60000); // Add 30 mins in milliseconds

      return !busySlots.some(busy => {
        const busyStart = new Date(busy.start).getTime();
        const busyEnd = new Date(busy.end).getTime();
        
        // Overlap logic: Slot starts before Busy ends AND Slot ends after Busy starts
        return slotStart < busyEnd && slotEnd > busyStart;
      });
    });

    res.json({ slots: availableSlots });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// 2. BOOK MEETING & RUN LLM
router.post('/book', async (req, res) => {
  try {
    const { username, slot, inviteeName, inviteeEmail, notes } = req.body;
    
    const user = await User.findOne({ username });
    oauth2Client.setCredentials({ refresh_token: user.googleRefreshToken });
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    // --- 🤖 LLM FEATURE: SMART AGENDA GENERATOR ---
    let smartAgenda = notes;
    if (notes && notes.length > 5) {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages:[{
          role: "system",
          content: `You are an AI meeting assistant. Transform the following rough notes into a professional, bulleted meeting agenda with estimated time blocks. Rough Notes: "${notes}"`
        }]
      });
      smartAgenda = completion.choices[0].message.content;
    }
    // ----------------------------------------------

    const startTime = new Date(slot);
    const endTime = new Date(startTime.getTime() + 30 * 60000); // Add 30 mins

    // Create Event in Google Calendar
    const event = {
      summary: `Meeting: ${user.username} & ${inviteeName}`,
      description: `**AI Generated Agenda:**\n\n${smartAgenda}`,
      start: { dateTime: startTime.toISOString(), timeZone: user.timezone || 'Asia/Kolkata'},
      end: { dateTime: endTime.toISOString(), timeZone: user.timezone || 'Asia/Kolkata' },
      attendees: [{ email: inviteeEmail }],
      conferenceData: {
        createRequest: { requestId: "req-" + Date.now() }
      },
      guestsCanInviteOthers: false,
      guestsCanModify: false,
      guestsCanSeeOtherGuests: true
    };

    const createdEvent = await calendar.events.insert({
      calendarId: 'primary',
      resource: event,
      conferenceDataVersion: 1,
      sendUpdates: 'all'
    });

    res.json({ success: true, link: createdEvent.data.htmlLink });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// THIS WAS MISSING AND CAUSED THE CRASH!
module.exports = router;