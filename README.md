# AttendAI — Personal Attendance Operating System & AI Assistant

> **Track. Predict. Improve.**

AttendAI is a modern, AI-powered multi-user college attendance management platform. Built to serve as a personal attendance OS for students and an academic governance console for administrators.

---

## 🚀 Key Features

- **Live Daily Attendance Engine:** Calculates exact percentages from raw values without floating-point distortion.
- **Bunk Calculator ($P / (T + B) \ge R$):** Accurately computes how many classes you can safely miss without falling below the required minimum.
- **Recovery Planner ($(P + X) / (T + X) \ge R$):** Calculates the exact number of consecutive classes required to regain safe standing.
- **Future What-If Simulator:** Test hypothetical attendance scenarios without altering persistent records.
- **Academic Timetable & Calendar:** Day-to-day timetable mapping with Pending/Present/Absent/OD/Medical statuses.
- **Context-Grounded AI Assistant:** Provides proactive morning briefings and answers attendance strategy questions using verified calculation data.
- **Super Admin Console & Audit History:** Comprehensive student management with immutable audit logs.
- **Mobile-First UX:** Bottom navigation bar and adaptive layout optimized for smartphones.

---

## 🛠️ Technology Stack

- **Frontend:** HTML5, CSS3 (Modern Glassmorphism & Tokens), Vanilla JavaScript (Modular Architecture), Chart.js, Lucide Icons
- **Backend:** Node.js, Express.js
- **Database (Phase 3+):** PostgreSQL

---

## 💻 Getting Started (Windows / PowerShell)

### 1. Installation
```powershell
npm install
```

### 2. Start the Server
```powershell
npm start
```
or
```powershell
node server/server.js
```

### 3. Open in Browser
Visit **[http://localhost:3000](http://localhost:3000)**

---

## 📂 Phase 1 Structure

```
├── client/
│   ├── index.html            # Landing / Hero Page
│   ├── login.html            # Student & Admin Login
│   ├── setup.html            # 6-Step Student Onboarding Wizard
│   ├── dashboard.html        # Main Student Dashboard
│   ├── attendance.html       # Subject-wise Attendance Cards
│   ├── recovery.html         # Bunk Calculator & Recovery Simulator
│   ├── timetable.html        # Weekly Timetable Schedule
│   ├── calendar.html         # Academic Month Calendar
│   ├── analytics.html        # Chart.js Visual Intelligence
│   ├── ai.html               # AI Attendance Assistant Chat
│   ├── profile.html          # Student Profile & Rules
│   ├── admin.html            # Super Admin Console Preview
│   ├── css/
│   │   ├── global.css        # Design tokens, variables & dark/light theme
│   │   ├── dashboard.css     # Widgets, progress rings, cards & chat
│   │   └── responsive.css    # Mobile bottom navigation & layout
│   └── js/
│       ├── api.js            # Math calculation engine & mock state
│       ├── theme.js          # Dark/Light mode switcher & toast helper
│       ├── dashboard.js      # Student dashboard controller
│       ├── attendance.js     # Subject cards controller
│       ├── recovery.js       # Bunk & recovery calculation controller
│       ├── timetable.js      # Timetable controller
│       ├── calendar.js       # Calendar renderer & date modal
│       ├── analytics.js      # Chart.js charts
│       ├── ai.js             # Grounded AI assistant chat controller
│       ├── admin.js          # Super Admin dashboard & audit controller
│       └── setup.js          # Onboarding wizard controller
├── server/
│   └── server.js             # Express static web server & mock API
├── package.json
├── .env.example
├── .gitignore
└── README.md
```
