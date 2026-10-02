/**
 * AttendAI — Academic Calendar Controller
 */

document.addEventListener('DOMContentLoaded', () => {
  renderCalendar();
});

function renderCalendar(year = 2026, month = 9) { // October 2026 (0-indexed 9)
  const container = document.getElementById('calendar-days-grid');
  const monthTitle = document.getElementById('calendar-month-title');
  if (!container) return;

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  if (monthTitle) {
    monthTitle.textContent = `${monthNames[month]} ${year}`;
  }

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  let html = '';

  // Empty cells for preceding month
  for (let i = 0; i < firstDayIndex; i++) {
    html += `<div class="calendar-cell" style="opacity: 0.2; pointer-events: none;"></div>`;
  }

  // Days of the current month
  for (let day = 1; day <= daysInMonth; day++) {
    const isToday = day === 2; // Demo current day is 2nd October
    const isSunday = (firstDayIndex + day - 1) % 7 === 0;

    let indicators = '';
    let statusText = '';

    if (isSunday) {
      indicators = `<span class="indicator-dot holiday"></span>`;
      statusText = `<span style="font-size:0.65rem; color:var(--text-muted);">Holiday</span>`;
    } else if (day === 2) {
      indicators = `
        <span class="indicator-dot present" title="Present"></span>
        <span class="indicator-dot present" title="Present"></span>
        <span class="indicator-dot absent" title="Absent"></span>
        <span class="indicator-dot present" title="Present"></span>
      `;
      statusText = `<span style="font-size:0.7rem; font-weight:700; color:var(--status-safe);">3 / 4 (75%)</span>`;
    } else if (day < 2) {
      indicators = `
        <span class="indicator-dot present"></span>
        <span class="indicator-dot present"></span>
        <span class="indicator-dot present"></span>
        <span class="indicator-dot present"></span>
      `;
      statusText = `<span style="font-size:0.7rem; font-weight:700; color:var(--status-safe);">4 / 4 (100%)</span>`;
    } else {
      indicators = `<span style="font-size:0.65rem; color:var(--text-muted);">Upcoming</span>`;
    }

    html += `
      <div class="calendar-cell ${isToday ? 'today' : ''}" onclick="openDayDetail(${day}, '${monthNames[month]}', ${year})">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span class="cell-date-num">${day}</span>
          ${isToday ? '<span class="badge badge-info" style="font-size:0.55rem; padding:1px 4px;">TODAY</span>' : ''}
        </div>
        <div class="cell-status-indicators">${indicators}</div>
        <div>${statusText}</div>
      </div>
    `;
  }

  container.innerHTML = html;
  if (window.lucide) lucide.createIcons();
}

function openDayDetail(day, month, year) {
  const modal = document.getElementById('day-detail-modal');
  const title = document.getElementById('modal-date-title');
  const body = document.getElementById('modal-classes-list');

  if (title) title.textContent = `${day} ${month} ${year}`;
  if (body) {
    if (day === 2) {
      body.innerHTML = `
        <div style="display:flex; flex-direction:column; gap:0.75rem;">
          <div class="glass-card" style="padding:0.75rem; display:flex; justify-content:space-between; align-items:center;">
            <div>
              <strong>09:00 — Java Programming</strong>
              <div style="font-size:0.75rem; color:var(--text-muted);">Lab 3 • Dr. K. Sharma</div>
            </div>
            <span class="badge badge-safe">PRESENT</span>
          </div>
          <div class="glass-card" style="padding:0.75rem; display:flex; justify-content:space-between; align-items:center;">
            <div>
              <strong>10:15 — DBMS</strong>
              <div style="font-size:0.75rem; color:var(--text-muted);">Hall B • Prof. Priya V</div>
            </div>
            <span class="badge badge-danger">ABSENT</span>
          </div>
          <div class="glass-card" style="padding:0.75rem; display:flex; justify-content:space-between; align-items:center;">
            <div>
              <strong>11:30 — Mathematics - III</strong>
              <div style="font-size:0.75rem; color:var(--text-muted);">LH 102 • Prof. R. Raman</div>
            </div>
            <span class="badge badge-safe">PRESENT</span>
          </div>
          <div class="glass-card" style="padding:0.75rem; display:flex; justify-content:space-between; align-items:center;">
            <div>
              <strong>14:00 — Operating Systems</strong>
              <div style="font-size:0.75rem; color:var(--text-muted);">Lab 1 • Dr. S. Nair</div>
            </div>
            <span class="badge badge-safe">PRESENT</span>
          </div>
        </div>
      `;
    } else {
      body.innerHTML = `<p style="color:var(--text-muted); text-align:center; padding:1.5rem;">No historical records or classes scheduled for this date.</p>`;
    }
  }

  if (modal) modal.style.display = 'flex';
}

function closeDayDetail() {
  const modal = document.getElementById('day-detail-modal');
  if (modal) modal.style.display = 'none';
}
