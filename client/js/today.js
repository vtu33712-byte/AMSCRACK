/**
 * AttendAI — Quick Daily Attendance Screen Controller ("TODAY")
 * 5-Second Daily Attendance Workflow (Sections 5, 6, 13, 31)
 */

let dailyStatusMap = {};

document.addEventListener('DOMContentLoaded', () => {
  renderTodayScreen();
});

function renderTodayScreen() {
  const classes = window.AttendAI.state.todayClasses;
  const container = document.getElementById('today-classes-container');
  const dateHeading = document.getElementById('today-date-heading');

  const now = new Date();
  const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
  if (dateHeading) {
    dateHeading.textContent = now.toLocaleDateString('en-US', options);
  }

  // Populate initial map
  classes.forEach(c => {
    if (!dailyStatusMap[c.id]) {
      dailyStatusMap[c.id] = c.status;
    }
  });

  if (!container) return;

  container.innerHTML = classes.map(cls => {
    const activeStatus = dailyStatusMap[cls.id] || cls.status;

    return `
      <div class="schedule-card" id="today-item-${cls.id}" style="padding:1.25rem;">
        <div>
          <span class="schedule-time-badge">${cls.time}</span>
          <div class="schedule-subject-name" style="font-size:1.1rem; margin-top:0.25rem;">${cls.subject}</div>
          <div class="schedule-meta" style="font-size:0.825rem; margin-top:0.35rem;">
            <span><i data-lucide="map-pin" style="width:14px;height:14px;vertical-align:middle;"></i> ${cls.room}</span>
            <span><i data-lucide="user" style="width:14px;height:14px;vertical-align:middle;"></i> ${cls.faculty}</span>
          </div>
        </div>

        <div class="schedule-actions" style="gap:0.5rem;">
          <button type="button" class="mark-btn present ${activeStatus === 'PRESENT' ? 'active' : ''}" style="padding:0.6rem 1rem;" onclick="setTodayItemStatus(${cls.id}, 'PRESENT')">
            ✓ Present
          </button>
          <button type="button" class="mark-btn absent ${activeStatus === 'ABSENT' ? 'active' : ''}" style="padding:0.6rem 1rem;" onclick="setTodayItemStatus(${cls.id}, 'ABSENT')">
            ✕ Absent
          </button>
          <button type="button" class="mark-btn od ${activeStatus === 'OD' ? 'active' : ''}" style="padding:0.6rem 1rem;" onclick="setTodayItemStatus(${cls.id}, 'OD')">
            OD
          </button>
        </div>
      </div>
    `;
  }).join('');

  if (window.lucide) lucide.createIcons();
}

function setTodayItemStatus(classId, status) {
  dailyStatusMap[classId] = status;
  renderTodayScreen();
}

function markAllTodayAs(status) {
  const classes = window.AttendAI.state.todayClasses;
  classes.forEach(c => {
    dailyStatusMap[c.id] = status;
  });
  renderTodayScreen();
  showToast(`Marked all classes as ${status}`, 'info');
}

function saveTodayAttendance() {
  const beforeStats = window.AttendAI.getOverallStats();
  const success = window.AttendAI.saveDailyAttendanceBatch(dailyStatusMap);

  if (success) {
    const afterStats = window.AttendAI.getOverallStats();
    showLiveDeltaModal(beforeStats, afterStats);
  }
}

function showLiveDeltaModal(before, after) {
  const modal = document.getElementById('today-summary-modal');
  const deltaContainer = document.getElementById('live-delta-container');

  const diffPct = (after.percentage - before.percentage).toFixed(2);
  const sign = diffPct >= 0 ? '+' : '';
  const isPositive = diffPct >= 0;

  if (deltaContainer) {
    deltaContainer.innerHTML = `
      <div style="text-align:center; margin-bottom:1.5rem;">
        <div style="font-size:0.85rem; color:var(--text-muted); text-transform:uppercase;">Overall Attendance Updated</div>
        <div style="font-size:2.5rem; font-weight:800; color:var(--text-primary); margin:0.25rem 0;">
          ${before.percentage}% &rarr; <span style="color:var(--brand-primary);">${after.percentage}%</span>
        </div>
        <div class="badge ${isPositive ? 'badge-safe' : 'badge-danger'}" style="font-size:0.9rem;">
          ${sign}${diffPct}% Today
        </div>
      </div>

      <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-bottom:1.5rem;">
        <div class="glass-card" style="padding:1rem; text-align:center; background:var(--bg-secondary);">
          <div style="font-size:0.75rem; color:var(--text-muted); text-transform:uppercase;">Safe Bunk Capacity</div>
          <div style="font-size:1.35rem; font-weight:800; color:var(--status-safe);">${after.safeBunkCount} Classes</div>
        </div>
        <div class="glass-card" style="padding:1rem; text-align:center; background:var(--bg-secondary);">
          <div style="font-size:0.75rem; color:var(--text-muted); text-transform:uppercase;">Recovery Requirement</div>
          <div style="font-size:1.35rem; font-weight:800; color:${after.recoveryRequired > 0 ? 'var(--status-danger)' : 'var(--status-safe)'};">
            ${after.recoveryRequired > 0 ? `${after.recoveryRequired} Classes` : 'Safe ✓'}
          </div>
        </div>
      </div>
    `;
  }

  if (modal) modal.style.display = 'flex';
  if (window.lucide) lucide.createIcons();
}

function closeTodaySummaryModal() {
  const modal = document.getElementById('today-summary-modal');
  if (modal) modal.style.display = 'none';
  window.location.href = 'dashboard.html';
}
