/**
 * AttendAI — Timetable Controller
 */

const TIMETABLE_DATA = {
  Monday: [
    { time: "09:00 - 10:00", subject: "Java Programming", code: "CS301", room: "Lab 3", faculty: "Dr. K. Sharma" },
    { time: "10:15 - 11:15", subject: "Database Management Systems", code: "CS302", room: "Hall B", faculty: "Prof. Priya V" },
    { time: "11:30 - 12:30", subject: "Mathematics - III", code: "MA301", room: "LH 102", faculty: "Prof. R. Raman" },
    { time: "14:00 - 15:30", subject: "Operating Systems", code: "CS304", room: "Lab 1", faculty: "Dr. S. Nair" }
  ],
  Tuesday: [
    { time: "09:00 - 10:00", subject: "Cyber Security", code: "CS303", room: "LH 201", faculty: "Dr. M. Arvind" },
    { time: "10:15 - 11:15", subject: "Java Programming", code: "CS301", room: "Lab 3", faculty: "Dr. K. Sharma" },
    { time: "11:30 - 12:30", subject: "Operating Systems", code: "CS304", room: "Lab 1", faculty: "Dr. S. Nair" },
    { time: "14:00 - 16:00", subject: "DBMS Laboratory", code: "CS302L", room: "Computing Lab 2", faculty: "Prof. Priya V" }
  ],
  Wednesday: [
    { time: "09:00 - 10:00", subject: "Mathematics - III", code: "MA301", room: "LH 102", faculty: "Prof. R. Raman" },
    { time: "10:15 - 11:15", subject: "Cyber Security", code: "CS303", room: "LH 201", faculty: "Dr. M. Arvind" },
    { time: "11:30 - 12:30", subject: "Database Management Systems", code: "CS302", room: "Hall B", faculty: "Prof. Priya V" },
    { time: "14:00 - 15:30", subject: "Java Programming Lab", code: "CS301L", room: "Lab 3", faculty: "Dr. K. Sharma" }
  ],
  Thursday: [
    { time: "09:00 - 10:00", subject: "Operating Systems", code: "CS304", room: "Lab 1", faculty: "Dr. S. Nair" },
    { time: "10:15 - 11:15", subject: "Mathematics - III", code: "MA301", room: "LH 102", faculty: "Prof. R. Raman" },
    { time: "11:30 - 12:30", subject: "Cyber Security", code: "CS303", room: "LH 201", faculty: "Dr. M. Arvind" },
    { time: "14:00 - 15:00", subject: "Library / Research Period", code: "LIB01", room: "Central Library", faculty: "Staff" }
  ],
  Friday: [
    { time: "09:00 - 10:00", subject: "Database Management Systems", code: "CS302", room: "Hall B", faculty: "Prof. Priya V" },
    { time: "10:15 - 11:15", subject: "Java Programming", code: "CS301", room: "Lab 3", faculty: "Dr. K. Sharma" },
    { time: "11:30 - 12:30", subject: "Cyber Security", code: "CS303", room: "LH 201", faculty: "Dr. M. Arvind" },
    { time: "14:00 - 15:30", subject: "Seminar & Group Discussion", code: "SEM01", room: "Seminar Hall 1", faculty: "Prof. R. Raman" }
  ],
  Saturday: [
    { time: "09:00 - 11:00", subject: "Open Elective / Skill Workshop", code: "OE101", room: "Auditorium", faculty: "Guest Faculty" },
    { time: "11:15 - 12:30", subject: "Technical Mentoring", code: "MEN01", room: "Dept Library", faculty: "Faculty Advisor" }
  ]
};

let currentSelectedDay = "Monday";

document.addEventListener('DOMContentLoaded', () => {
  renderTimetableTabs();
  renderDaySchedule(currentSelectedDay);
});

function renderTimetableTabs() {
  const container = document.getElementById('timetable-day-tabs');
  if (!container) return;

  const days = Object.keys(TIMETABLE_DATA);
  container.innerHTML = days.map(day => `
    <button class="btn ${day === currentSelectedDay ? 'btn-primary' : 'btn-secondary'} btn-sm" onclick="selectDay('${day}')">
      ${day}
    </button>
  `).join('');
}

function selectDay(day) {
  currentSelectedDay = day;
  renderTimetableTabs();
  renderDaySchedule(day);
}

function renderDaySchedule(day) {
  const container = document.getElementById('timetable-schedule-list');
  if (!container) return;

  const classes = TIMETABLE_DATA[day] || [];
  if (classes.length === 0) {
    container.innerHTML = `<p style="color:var(--text-muted); text-align:center;">No classes configured for ${day}.</p>`;
    return;
  }

  container.innerHTML = classes.map(cls => `
    <div class="schedule-card">
      <div>
        <span class="schedule-time-badge">${cls.time}</span>
        <div class="schedule-subject-name">${cls.subject} (${cls.code})</div>
        <div class="schedule-meta">
          <span><i data-lucide="map-pin" style="width:14px;height:14px;vertical-align:middle;"></i> ${cls.room}</span>
          <span><i data-lucide="user" style="width:14px;height:14px;vertical-align:middle;"></i> ${cls.faculty}</span>
        </div>
      </div>
      <span class="badge badge-info">SCHEDULED</span>
    </div>
  `).join('');

  if (window.lucide) lucide.createIcons();
}
