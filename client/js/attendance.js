/**
 * AttendAI — Subject-wise Attendance Controller
 * Displays transparent Baseline + Live Events Breakdown (Sections 4, 11, 41, 59)
 */

document.addEventListener('DOMContentLoaded', () => {
  renderSubjectCards();
});

function renderSubjectCards() {
  const container = document.getElementById('subjects-container');
  if (!container) return;

  const baselines = window.AttendAI.state.baselines;

  container.innerHTML = baselines.map(b => {
    const sub = window.AttendAI.getSubjectStats(b.subjectId);
    if (!sub) return '';

    let statusBadge = '';
    let fillClass = 'safe';
    let bunkText = '';

    if (sub.percentage >= sub.minReq) {
      statusBadge = `<span class="badge badge-safe"><i data-lucide="check-circle" style="width:12px;height:12px;"></i> SAFE</span>`;
      fillClass = 'safe';
      bunkText = `<span class="bunk-pill safe">🛡️ ${sub.safeBunkCount} Safe Bunks</span>`;
    } else {
      statusBadge = `<span class="badge badge-danger"><i data-lucide="alert-triangle" style="width:12px;height:12px;"></i> ATTENTION</span>`;
      fillClass = 'danger';
      bunkText = `<span class="bunk-pill recovery">⚡ Must Attend ${sub.recoveryRequired} Next Classes</span>`;
    }

    return `
      <div class="glass-card subject-card">
        <div class="subject-card-header">
          <div>
            <div class="subject-code-tag">${sub.code}</div>
            <div class="subject-title">${sub.name}</div>
            <div class="subject-faculty">${sub.faculty}</div>
          </div>
          ${statusBadge}
        </div>

        <div class="subject-meter-group">
          <div class="subject-meter-info">
            <span style="font-weight:700; font-size:1.35rem;">${sub.percentage}%</span>
            <span style="color:var(--text-muted);">Cutoff: ${sub.minReq}%</span>
          </div>
          <div class="progress-bar-track">
            <div class="progress-bar-fill ${fillClass}" style="width: ${Math.min(100, sub.percentage)}%;"></div>
          </div>
        </div>

        <!-- Baseline vs Live Breakdown (Section 59) -->
        <div style="background:var(--bg-secondary); border-radius:var(--radius-md); padding:0.75rem; margin-bottom:1rem; font-size:0.8rem; border:1px solid var(--border-glass);">
          <div style="display:flex; justify-content:space-between; margin-bottom:0.25rem;">
            <span style="color:var(--text-muted);">College Baseline:</span>
            <strong>${sub.baselinePresent} / ${sub.baselineConducted}</strong>
          </div>
          <div style="display:flex; justify-content:space-between; margin-bottom:0.25rem;">
            <span style="color:var(--text-muted);">Live App Confirmations:</span>
            <strong style="color:var(--brand-primary);">+${sub.liveEventsCount} sessions</strong>
          </div>
          <div style="display:flex; justify-content:space-between; border-top:1px solid var(--border-glass); padding-top:0.35rem; margin-top:0.35rem;">
            <span style="font-weight:600;">Current Total:</span>
            <strong style="color:var(--status-safe);">${sub.present} / ${sub.conducted}</strong>
          </div>
        </div>

        <div class="subject-card-footer">
          ${bunkText}
          <button class="btn btn-secondary btn-sm" onclick="openSubjectDetail(${sub.id})">Simulate</button>
        </div>
      </div>
    `;
  }).join('');

  if (window.lucide) lucide.createIcons();
}

function openSubjectDetail(subId) {
  window.location.href = `recovery.html?subjectId=${subId}`;
}
