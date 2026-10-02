const express = require('express');
const path = require('path');
const cors = require('cors');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Static files for client frontend
app.use(express.static(path.join(__dirname, '..', 'client')));

// Basic healthcheck route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'AttendAI',
    tagline: 'Track. Predict. Improve.',
    version: '1.0.0-phase1',
    timestamp: new Date().toISOString()
  });
});

// Phase 1 Mock Data Endpoint for Live Testing & Demo UI
app.get('/api/mock/student', (req, res) => {
  res.json({
    student: {
      name: "Jagadesh R",
      rollNo: "22BCSE104",
      department: "Computer Science & Engineering",
      semester: "6th Semester",
      college: "Institute of Technology",
      minimumAttendance: 75
    },
    overall: {
      present: 138,
      conducted: 176,
      percentage: 78.41,
      status: "SAFE",
      safeBunkCount: 7,
      recoveryRequired: 0,
      weeklyChange: 1.6
    },
    subjects: [
      { id: 1, name: "Java Programming", code: "CS301", faculty: "Dr. K. Sharma", conducted: 44, present: 32, absent: 12, minReq: 75 },
      { id: 2, name: "Database Management Systems", code: "CS302", faculty: "Prof. Priya V", conducted: 40, present: 34, absent: 6, minReq: 75 },
      { id: 3, name: "Cyber Security", code: "CS303", faculty: "Dr. M. Arvind", conducted: 32, present: 26, absent: 6, minReq: 75 },
      { id: 4, name: "Mathematics - III", code: "MA301", faculty: "Prof. R. Raman", conducted: 36, present: 32, absent: 4, minReq: 75 },
      { id: 5, name: "Operating Systems", code: "CS304", faculty: "Dr. S. Nair", conducted: 24, present: 14, absent: 10, minReq: 75 }
    ],
    todayClasses: [
      { id: 101, subject: "Java Programming", code: "CS301", time: "09:00 - 10:00", room: "Lab 3", status: "PENDING" },
      { id: 102, subject: "Database Management Systems", code: "CS302", time: "10:15 - 11:15", room: "Hall B", status: "PENDING" },
      { id: 103, subject: "Mathematics - III", code: "MA301", time: "11:30 - 12:30", room: "LH 102", status: "PENDING" },
      { id: 104, subject: "Operating Systems", code: "CS304", time: "14:00 - 15:30", room: "Lab 1", status: "PENDING" }
    ]
  });
});

// Fallback for HTML5 navigation
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'client', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`🚀 AttendAI Server is live!`);
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log(`🏷️  Tagline: Track. Predict. Improve.`);
  console.log(`✨ Phase 1 UI Shell is active`);
  console.log(`=========================================`);
});
