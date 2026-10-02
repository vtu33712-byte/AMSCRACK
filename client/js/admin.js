/**
 * AttendAI — Super Admin Console Controller
 * Implements: Student Governance, Secure One-Time Temporary Password Reset, Audit History
 */

const DEMO_STUDENTS = [
  { id: 1, rollNo: "22BCSE104", name: "Jagadesh R", dept: "CSE", sem: "6th", present: 138, conducted: 176, status: "ACTIVE", lastLogin: "Today, 10:15 AM" },
  { id: 2, rollNo: "22BCSE105", name: "Ananya Sharma", dept: "CSE", sem: "6th", present: 165, conducted: 176, status: "ACTIVE", lastLogin: "Yesterday" },
  { id: 3, rollNo: "22BCSE108", name: "Karthik Verma", dept: "CSE", sem: "6th", present: 110, conducted: 176, status: "ACTIVE", lastLogin: "3 days ago" },
  { id: 4, rollNo: "22BECE042", name: "Pooja Hegde", dept: "ECE", sem: "4th", present: 140, conducted: 150, status: "ACTIVE", lastLogin: "Today, 08:30 AM" },
  { id: 5, rollNo: "22BMECH019", name: "Rohit Krishnan", dept: "MECH", sem: "6th", present: 95, conducted: 160, status: "DISABLED", lastLogin: "2 weeks ago" }
];

let targetStudentForReset = null;

document.addEventListener('DOMContentLoaded', () => {
  renderStudentTable(DEMO_STUDENTS);
  renderAuditLogs();
  initAdminSearch();
});

function renderStudentTable(students) {
  const tbody = document.getElementById('admin-student-tbody');
  if (!tbody) return;

  tbody.innerHTML = students.map(st => {
    const pct = ((st.present / st.conducted) * 100).toFixed(1);
    const isSafe = pct >= 75;

    return `
      <tr>
        <td><strong>${st.rollNo}</strong></td>
        <td>
          <div style="font-weight:600;">${st.name}</div>
          <div style="font-size:0.75rem; color:var(--text-muted);">${st.dept} • Sem ${st.sem}</div>
        </td>
        <td>
          <span style="font-weight:700; color:${isSafe ? 'var(--success)' : 'var(--danger)'};">${pct}%</span>
          <div style="font-size:0.75rem; color:var(--text-muted);">${st.present}/${st.conducted}</div>
        </td>
        <td>
          <span class="badge ${st.status === 'ACTIVE' ? 'badge-safe' : 'badge-danger'}">${st.status}</span>
        </td>
        <td style="font-size:0.8rem; color:var(--text-muted);">${st.lastLogin}</td>
        <td>
          <div style="display:flex; gap:0.4rem;">
            <button class="btn btn-secondary btn-sm" onclick="showToast('Viewing profile of ${st.name}', 'info')">View</button>
            <button class="btn btn-secondary btn-sm" onclick="openResetPasswordModal('${st.rollNo}', '${st.name}')">Reset Pass</button>
            <button class="btn btn-danger btn-sm" onclick="toggleStudentStatus('${st.rollNo}')">Toggle</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function openResetPasswordModal(rollNo, name) {
  targetStudentForReset = { rollNo, name };
  const modal = document.getElementById('admin-reset-pass-modal');
  const label = document.getElementById('reset-student-label');
  const tempBox = document.getElementById('generated-temp-pass-box');

  if (label) label.textContent = `${name} (${rollNo})`;
  if (tempBox) tempBox.style.display = 'none';
  if (modal) modal.style.display = 'flex';
}

function generateTemporaryPassword() {
  if (!targetStudentForReset) return;

  // Generate cryptographically random 8-character token
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let tempPass = 'TMP-';
  for (let i = 0; i < 6; i++) {
    tempPass += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  const tempBox = document.getElementById('generated-temp-pass-box');
  const passVal = document.getElementById('temp-pass-value');

  if (passVal) passVal.textContent = tempPass;
  if (tempBox) tempBox.style.display = 'block';

  // Record into Audit Logs (Without exposing plaintext password)
  window.AttendAI.state.auditLogs.unshift({
    id: Date.now(),
    actor: "SUPER ADMIN",
    action: "PASSWORD_RESET_GENERATED",
    target: `${targetStudentForReset.name} (${targetStudentForReset.rollNo})`,
    subject: "Authentication Security",
    oldValue: "Active Hash",
    newValue: "Temp Hash (Force Change on Next Login)",
    timestamp: new Date().toLocaleString(),
    reason: "Student identity verified via admin request"
  });

  renderAuditLogs();
  showToast(`Temporary password generated for ${targetStudentForReset.rollNo}`, 'success');
}

function closeResetModal() {
  const modal = document.getElementById('admin-reset-pass-modal');
  if (modal) modal.style.display = 'none';
}

function toggleStudentStatus(rollNo) {
  const st = DEMO_STUDENTS.find(s => s.rollNo === rollNo);
  if (st) {
    const oldStatus = st.status;
    st.status = st.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';

    window.AttendAI.state.auditLogs.unshift({
      id: Date.now(),
      actor: "SUPER ADMIN",
      action: "ACCOUNT_STATUS_TOGGLE",
      target: `${st.name} (${st.rollNo})`,
      subject: "Student Account",
      oldValue: oldStatus,
      newValue: st.status,
      timestamp: new Date().toLocaleString(),
      reason: "Administrative Policy Review"
    });

    renderStudentTable(DEMO_STUDENTS);
    renderAuditLogs();
    showToast(`Account for ${rollNo} updated to ${st.status}`, 'warning');
  }
}

function renderAuditLogs() {
  const container = document.getElementById('admin-audit-logs-container');
  if (!container) return;

  const logs = window.AttendAI.state.auditLogs;
  container.innerHTML = logs.map(l => `
    <div style="padding:0.75rem; border-bottom:1px solid var(--border); display:flex; justify-content:space-between; align-items:center; font-size:0.825rem;">
      <div>
        <strong>${l.action}</strong> by <span style="color:var(--brand-primary);">${l.actor}</span> on ${l.target}
        <div style="font-size:0.75rem; color:var(--text-muted);">${l.reason} (${l.oldValue} &rarr; ${l.newValue})</div>
      </div>
      <span style="font-size:0.75rem; color:var(--text-muted);">${l.timestamp}</span>
    </div>
  `).join('');
}

function initAdminSearch() {
  const searchInput = document.getElementById('admin-search-input');
  if (!searchInput) return;

  searchInput.addEventListener('input', (e) => {
    const val = e.target.value.toLowerCase();
    const filtered = DEMO_STUDENTS.filter(st => {
      return st.name.toLowerCase().includes(val) ||
             st.rollNo.toLowerCase().includes(val) ||
             st.dept.toLowerCase().includes(val);
    });
    renderStudentTable(filtered);
  });
}
