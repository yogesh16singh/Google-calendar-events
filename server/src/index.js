const express = require("express");
const dotenv = require("dotenv");
const dayjs = require("dayjs");
const { google } = require('googleapis');
const { v4 } = require('uuid')
const app = express();

const calendar = google.calendar({
    version: 'v3',
    auth: process.env.API_KEY
});

dotenv.config({});

const PORT = process.env.NODE_ENV || 4000;

const oauth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URL
);
const scopes = [
    'https://www.googleapis.com/auth/calendar'
];
app.get("/auth/google", (req, res) => {
    const url = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes
    });

    res.redirect(url);
})
app.get("/auth/google/callback", async (req, res) => {
    const code = req.query.code;

    const { tokens } = await oauth2Client.getToken(code)
    oauth2Client.setCredentials(tokens);

    res.send({ msg: "succes" });
})

app.get("/schedule_event", async (req, res) => {
    await calendar.events.insert({
        calendarId: 'primary',
        auth: oauth2Client,
        requestBody: {
            summary: "this is a event",
            description: "testing this",
            start: {
                dateTime: dayjs(new Date()).add(1, 'day').toISOString(),
                timeZone: "Asia/Kolkata",
            },
            end: {
                dateTime: dayjs(new Date()).add(1, 'day').add(1, 'hour').toISOString(),
                timeZone: "Asia/Kolkata",
            },
            conferenceData: {
                createRequest: {
                    requestId: v4(),
                },
            },
            attendees: [
                {
                    email: "rawat@gmail.com"
                },
            ],
        },
    });
    res.send({
        msg: 'done'
    })
});

app.listen(PORT, () => {
    console.log("server is running on port : ", PORT);
})