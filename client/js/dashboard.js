/**
 * AttendAI — Dashboard Controller
 */

document.addEventListener('DOMContentLoaded', () => {
  renderDashboard();
});

function renderDashboard() {
  const stats = window.AttendAI.getOverallStats();
  const state = window.AttendAI.state;

  // Update Overall Percentage Gauge
  const gaugePercentElem = document.getElementById('overall-percentage-val');
  const gaugeLabelElem = document.getElementById('overall-status-badge');
  const gaugeCircle = document.getElementById('gauge-progress-circle');

  if (gaugePercentElem) {
    gaugePercentElem.textContent = `${stats.percentage}%`;
  }

  if (gaugeLabelElem) {
    gaugeLabelElem.textContent = stats.status;
    gaugeLabelElem.className = `badge badge-${stats.status.toLowerCase()}`;
  }

  if (gaugeCircle) {
    // 2 * PI * r = 2 * 3.14159 * 70 ≈ 440
    const circumference = 440;
    const offset = circumference - (stats.percentage / 100) * circumference;
    gaugeCircle.style.strokeDashoffset = offset;
    
    if (stats.percentage >= 75) {
      gaugeCircle.style.stroke = '#10b981'; // Green
    } else if (stats.percentage >= 70) {
      gaugeCircle.style.stroke = '#f59e0b'; // Amber
    } else {
      gaugeCircle.style.stroke = '#ef4444'; // Red
    }
  }

  // Update Stats Cards
  const attendedElem = document.getElementById('stat-attended');
  const conductedElem = document.getElementById('stat-conducted');
  const bunksElem = document.getElementById('stat-safe-bunks');
  const recoveryElem = document.getElementById('stat-recovery');

  if (attendedElem) attendedElem.textContent = stats.present;
  if (conductedElem) conductedElem.textContent = stats.conducted;
  if (bunksElem) bunksElem.textContent = `${stats.safeBunkCount} Classes`;
  if (recoveryElem) recoveryElem.textContent = stats.recoveryRequired > 0 ? `${stats.recoveryRequired} Classes` : 'None';

  // Render AI Daily Insight Banner
  renderAIDailyInsight(stats, state.subjects);

  // Render Today's Classes List
  renderTodaySchedule(state.todayClasses);

  // Render Risk Subjects Summary
  renderRiskSubjects(state.subjects, stats.minReq);

  // Initialize Lucide icons
  if (window.lucide) lucide.createIcons();
}

function renderAIDailyInsight(stats, subjects) {
  const container = document.getElementById('ai-insight-text-content');
  const chipsContainer = document.getElementById('ai-insight-chips');
  if (!container) return;

  const lowSubjects = subjects.filter(s => {
    const pct = window.AttendAI.calculatePercentage(s.present, s.conducted);
    return pct < 75;
  });

  let message = `Good morning 👋 Your overall attendance is <strong>${stats.percentage}%</strong>. `;
  
  if (lowSubjects.length > 0) {
    const names = lowSubjects.map(s => s.name).join(', ');
    message += `Priority attention needed: <strong>${names}</strong> is currently below the required 75% threshold. You have <strong>${stats.safeBunkCount}</strong> safe bunk capacity across safe subjects.`;
  } else {
    message += `All your registered subjects are currently in the safe zone! You have a buffer of <strong>${stats.safeBunkCount}</strong> safe bunks available while remaining above the 75% cutoff.`;
  }

  container.innerHTML = message;

  if (chipsContainer) {
    chipsContainer.innerHTML = `
      <span class="insight-chip">🎯 Target: ${stats.minReq}%</span>
      <span class="insight-chip">⚡ Buffer: ${stats.safeBunkCount} Bunks</span>
      <span class="insight-chip">📈 Status: ${stats.status}</span>
    `;
  }
}

function renderTodaySchedule(classes) {
  const container = document.getElementById('today-schedule-container');
  if (!container) return;

  if (!classes || classes.length === 0) {
    container.innerHTML = `
      <div class="glass-card" style="text-align: center; padding: 2rem;">
        <p style="color: var(--text-muted);">No classes scheduled for today.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = classes.map(cls => {
    const isPresent = cls.status === 'PRESENT';
    const isAbsent = cls.status === 'ABSENT';
    const isOD = cls.status === 'OD';
    const isMedical = cls.status === 'MEDICAL';

    return `
      <div class="schedule-card" id="schedule-card-${cls.id}">
        <div>
          <span class="schedule-time-badge">${cls.time}</span>
          <div class="schedule-subject-name">${cls.subject} (${cls.code})</div>
          <div class="schedule-meta">
            <span><i data-lucide="map-pin" style="width:14px; height:14px; vertical-align:middle;"></i> ${cls.room}</span>
            <span><i data-lucide="user" style="width:14px; height:14px; vertical-align:middle;"></i> ${cls.faculty}</span>
          </div>
        </div>
        <div class="schedule-actions">
          <button class="mark-btn present ${isPresent ? 'active' : ''}" onclick="handleMarkAttendance(${cls.id}, 'PRESENT')">Present</button>
          <button class="mark-btn absent ${isAbsent ? 'active' : ''}" onclick="handleMarkAttendance(${cls.id}, 'ABSENT')">Absent</button>
          <button class="mark-btn od ${isOD ? 'active' : ''}" onclick="handleMarkAttendance(${cls.id}, 'OD')">OD</button>
          <button class="mark-btn medical ${isMedical ? 'active' : ''}" onclick="handleMarkAttendance(${cls.id}, 'MEDICAL')">Medical</button>
        </div>
      </div>
    `;
  }).join('');
}

function handleMarkAttendance(classId, status) {
  const success = window.AttendAI.markTodayClass(classId, status);
  if (success) {
    showToast(`Marked ${status} for class`, 'success');
    renderDashboard();
  }
}

function renderRiskSubjects(subjects, minReq) {
  const container = document.getElementById('risk-subjects-container');
  if (!container) return;

  const subjectRows = subjects.map(sub => {
    const pct = window.AttendAI.calculatePercentage(sub.present, sub.conducted);
    const safeBunks = window.AttendAI.calculateSafeBunks(sub.present, sub.conducted, minReq);
    const recovery = window.AttendAI.calculateRecoveryRequired(sub.present, sub.conducted, minReq);
    
    let badgeClass = 'badge-safe';
    let statusText = 'Safe';
    let fillClass = 'safe';

    if (pct < minReq) {
      badgeClass = 'badge-danger';
      statusText = `Need +${recovery}`;
      fillClass = 'danger';
    } else if (pct < minReq + 4) {
      badgeClass = 'badge-warning';
      statusText = `${safeBunks} Bunks`;
      fillClass = 'warning';
    } else {
      statusText = `${safeBunks} Bunks`;
    }

    return `
      <div style="margin-bottom: 1rem;">
        <div style="display:flex; justify-content:space-between; font-size:0.875rem; margin-bottom:0.35rem;">
          <span style="font-weight:600;">${sub.name}</span>
          <span class="badge ${badgeClass}">${statusText} (${pct.toFixed(1)}%)</span>
        </div>
        <div class="progress-bar-track">
          <div class="progress-bar-fill ${fillClass}" style="width: ${Math.min(100, pct)}%;"></div>
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = subjectRows;
}
