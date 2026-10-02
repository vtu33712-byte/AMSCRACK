/**
 * AttendAI — Core Mathematical & Baseline-Event Attendance Engine
 * Tagline: Track. Predict. Improve.
 *
 * Core Architecture (Sections 4, 11, 12, 25, 26, 41):
 * CURRENT STATE = BASELINE (Imported College Data) + ATTENDANCE EVENTS (Daily Live Confirmations)
 */

const STORAGE_KEY = 'attendai_state_v2';

const DEFAULT_STATE = {
  currentUser: {
    id: 1,
    name: "Jagadesh R",
    rollNo: "22BCSE104",
    email: "jagadesh@college.edu",
    department: "Computer Science & Engineering",
    degree: "B.Tech",
    year: "3rd Year",
    semester: "6th Semester",
    section: "Section A",
    college: "Institute of Technology",
    role: "STUDENT",
    minimumAttendance: 75,
    status: "ACTIVE"
  },
  // Baselines imported once from College AMS/Portal
  baselines: [
    { subjectId: 1, subject: "Java Programming", code: "CS301", faculty: "Dr. K. Sharma", conducted: 42, present: 35 },
    { subjectId: 2, subject: "Database Management Systems", code: "CS302", faculty: "Prof. Priya V", conducted: 38, present: 31 },
    { subjectId: 3, subject: "Cyber Security", code: "CS303", faculty: "Dr. M. Arvind", conducted: 40, present: 34 },
    { subjectId: 4, subject: "Mathematics - III", code: "MA301", faculty: "Prof. R. Raman", conducted: 34, present: 31 },
    { subjectId: 5, subject: "Operating Systems", code: "CS304", faculty: "Dr. S. Nair", conducted: 22, present: 13 }
  ],
  // Live Attendance Events recorded day-by-day
  attendanceEvents: [
    { id: 1, subjectId: 1, date: "2026-10-01", time: "09:00", status: "PRESENT", source: "STUDENT" },
    { id: 2, subjectId: 2, date: "2026-10-01", time: "10:15", status: "PRESENT", source: "STUDENT" },
    { id: 3, subjectId: 5, date: "2026-10-01", time: "14:00", status: "PRESENT", source: "STUDENT" }
  ],
  // Today's Scheduled Classes (Pending confirmation)
  todayClasses: [
    { id: 101, subjectId: 1, subject: "Java Programming", code: "CS301", time: "09:00 - 10:00", room: "Lab 3", faculty: "Dr. K. Sharma", status: "PENDING" },
    { id: 102, subjectId: 2, subject: "Database Management Systems", code: "CS302", time: "10:15 - 11:15", room: "Hall B", faculty: "Prof. Priya V", status: "PENDING" },
    { id: 103, subjectId: 3, subject: "Cyber Security", code: "CS303", time: "11:30 - 12:30", room: "LH 201", faculty: "Dr. M. Arvind", status: "PENDING" },
    { id: 104, subjectId: 4, subject: "Mathematics - III", code: "MA301", time: "14:00 - 15:00", room: "LH 102", faculty: "Prof. R. Raman", status: "PENDING" },
    { id: 105, subjectId: 5, subject: "Operating Systems", code: "CS304", time: "15:15 - 16:15", room: "Lab 1", faculty: "Dr. S. Nair", status: "PENDING" }
  ],
  notifications: [
    { id: 1, type: "danger", title: "Operating Systems Alert", message: "OS attendance is at 60.87%, which is below the 75% threshold. Recovery required.", read: false, time: "10 mins ago" },
    { id: 2, type: "warning", title: "Java Programming Notice", message: "Java is approaching the safe margin. Mark today's 09:00 AM class as Present to improve.", read: false, time: "1 hour ago" },
    { id: 3, type: "safe", title: "Maths - III Compliant", message: "Mathematics is at 91.18%. You have 7 safe bunks available.", read: true, time: "Yesterday" }
  ],
  auditLogs: [
    { id: 1, actor: "SUPER ADMIN", action: "ATTENDANCE_CORRECTION", target: "Jagadesh R (22BCSE104)", subject: "Operating Systems", oldValue: "ABSENT", newValue: "OD (On Duty)", timestamp: "2026-10-02 14:30:12", reason: "Approved Symposium Participation" },
    { id: 2, actor: "Jagadesh R", action: "ATTENDANCE_MARKED", target: "Self", subject: "Database Management Systems", oldValue: "PENDING", newValue: "PRESENT", timestamp: "2026-10-01 10:18:44", reason: "Regular Class" },
    { id: 3, actor: "SUPER ADMIN", action: "RULE_UPDATE", target: "Global Rule", subject: "Academic Policy", oldValue: "70%", newValue: "75%", timestamp: "2026-09-15 09:00:00", reason: "Semester Regulation 2026" }
  ]
};

class AttendAIState {
  constructor() {
    this.state = this.loadState();
  }

  loadState() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : JSON.parse(JSON.stringify(DEFAULT_STATE));
    } catch (e) {
      return JSON.parse(JSON.stringify(DEFAULT_STATE));
    }
  }

  saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
  }

  resetToDefault() {
    this.state = JSON.parse(JSON.stringify(DEFAULT_STATE));
    this.saveState();
  }

  /* ------------------- Mathematical Engine ------------------- */

  // Exact Percentage from raw counts (Never store floating point display values)
  calculatePercentage(present, total) {
    if (!total || total <= 0) return 0;
    return (present / total) * 100;
  }

  // Exact Bunk Calculator: P / (T + B) >= R
  calculateSafeBunks(present, total, requiredPct = 75) {
    if (!total || total <= 0) return 0;
    const r = requiredPct / 100;
    if ((present / total) < r) return 0; // Already below required

    let bunks = 0;
    while ((present / (total + bunks + 1)) >= r) {
      bunks++;
    }
    return bunks;
  }

  // Exact Recovery Calculator: (P + X) / (T + X) >= R
  calculateRecoveryRequired(present, total, requiredPct = 75) {
    if (!total || total <= 0) return 0;
    const r = requiredPct / 100;
    if ((present / total) >= r) return 0; // Already compliant

    let x = 0;
    while (((present + x) / (total + x)) < r) {
      x++;
    }
    return x;
  }

  /* ------------------- Live Subject Calculations ------------------- */

  // Reconstruct Subject Attendance: BASELINE + ATTENDANCE EVENTS
  getSubjectStats(subjectId) {
    const baseline = this.state.baselines.find(b => b.subjectId === subjectId);
    if (!baseline) return null;

    let totalConducted = baseline.conducted;
    let totalPresent = baseline.present;
    let totalAbsent = baseline.conducted - baseline.present;

    const events = this.state.attendanceEvents.filter(e => e.subjectId === subjectId);
    events.forEach(ev => {
      if (ev.status === 'PRESENT' || ev.status === 'OD' || ev.status === 'MEDICAL') {
        totalConducted += 1;
        totalPresent += 1;
      } else if (ev.status === 'ABSENT') {
        totalConducted += 1;
        totalAbsent += 1;
      }
      // CANCELLED does not increment conducted
    });

    const minReq = this.state.currentUser.minimumAttendance || 75;
    const percentage = this.calculatePercentage(totalPresent, totalConducted);
    const safeBunks = this.calculateSafeBunks(totalPresent, totalConducted, minReq);
    const recovery = this.calculateRecoveryRequired(totalPresent, totalConducted, minReq);

    let status = "SAFE";
    if (percentage < minReq) {
      status = "DANGER";
    } else if (percentage < minReq + 4) {
      status = "WARNING";
    }

    return {
      id: baseline.subjectId,
      name: baseline.subject,
      code: baseline.code,
      faculty: baseline.faculty,
      baselineConducted: baseline.conducted,
      baselinePresent: baseline.present,
      liveEventsCount: events.length,
      conducted: totalConducted,
      present: totalPresent,
      absent: totalAbsent,
      percentage: Number(percentage.toFixed(2)),
      rawPercentage: percentage,
      status,
      safeBunkCount: safeBunks,
      recoveryRequired: recovery,
      minReq
    };
  }

  // Aggregate All Subjects (Section 26: Sum of all attended / Sum of all conducted * 100)
  getOverallStats() {
    let grandPresent = 0;
    let grandConducted = 0;
    let grandAbsent = 0;

    const allSubjectStats = this.state.baselines.map(b => this.getSubjectStats(b.subjectId));

    allSubjectStats.forEach(sub => {
      grandPresent += sub.present;
      grandConducted += sub.conducted;
      grandAbsent += sub.absent;
    });

    const percentage = grandConducted > 0 ? (grandPresent / grandConducted) * 100 : 0;
    const minReq = this.state.currentUser.minimumAttendance || 75;

    let status = "SAFE";
    if (percentage < minReq) {
      status = "DANGER";
    } else if (percentage < minReq + 4) {
      status = "WARNING";
    }

    const safeBunks = this.calculateSafeBunks(grandPresent, grandConducted, minReq);
    const recovery = this.calculateRecoveryRequired(grandPresent, grandConducted, minReq);

    return {
      present: grandPresent,
      conducted: grandConducted,
      absent: grandAbsent,
      percentage: Number(percentage.toFixed(2)),
      rawPercentage: percentage,
      status,
      safeBunkCount: safeBunks,
      recoveryRequired: recovery,
      minReq,
      subjects: allSubjectStats
    };
  }

  // Quick 1-Tap Daily Attendance Save (Section 5 & 6)
  saveDailyAttendanceBatch(statusMap) {
    const today = new Date().toISOString().split('T')[0];

    Object.keys(statusMap).forEach(classIdStr => {
      const classId = parseInt(classIdStr);
      const status = statusMap[classId];
      const cls = this.state.todayClasses.find(c => c.id === classId);

      if (cls && status && status !== 'PENDING') {
        const oldStatus = cls.status;
        cls.status = status;

        // Record Attendance Event
        this.state.attendanceEvents.push({
          id: Date.now() + Math.random(),
          subjectId: cls.subjectId,
          date: today,
          time: cls.time.split(' - ')[0],
          status: status,
          source: 'STUDENT'
        });

        // Audit Log
        this.state.auditLogs.unshift({
          id: Date.now(),
          actor: this.state.currentUser.name,
          action: "ATTENDANCE_MARKED",
          target: "Self",
          subject: cls.subject,
          oldValue: oldStatus,
          newValue: status,
          timestamp: new Date().toLocaleString(),
          reason: `Quick Daily Attendance (${cls.time})`
        });
      }
    });

    this.saveState();
    return true;
  }
}

window.AttendAI = new AttendAIState();
