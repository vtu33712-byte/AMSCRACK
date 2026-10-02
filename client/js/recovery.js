/**
 * AttendAI — Bunk & Recovery Calculator Engine + Future Simulator
 * Tagline: Track. Predict. Improve.
 */

document.addEventListener('DOMContentLoaded', () => {
  initSubjectSelector();
  runCalculations();
});

function initSubjectSelector() {
  const selector = document.getElementById('calc-subject-select');
  if (!selector) return;

  const urlParams = new URLSearchParams(window.location.search);
  const targetId = parseInt(urlParams.get('subjectId'));

  const subjects = window.AttendAI.state.subjects;
  selector.innerHTML = `
    <option value="overall">Overall Attendance (All Subjects Combined)</option>
    ${subjects.map(s => `<option value="${s.id}" ${targetId === s.id ? 'selected' : ''}>${s.name} (${s.code})</option>`).join('')}
  `;

  selector.addEventListener('change', () => {
    runCalculations();
  });
}

function runCalculations() {
  const selector = document.getElementById('calc-subject-select');
  const targetPctInput = document.getElementById('calc-target-pct');
  const targetPct = parseFloat(targetPctInput ? targetPctInput.value : 75) || 75;

  const selectedVal = selector ? selector.value : 'overall';
  let present = 0;
  let conducted = 0;
  let subjectName = "Overall Attendance";

  if (selectedVal === 'overall') {
    const stats = window.AttendAI.getOverallStats();
    present = stats.present;
    conducted = stats.conducted;
  } else {
    const sub = window.AttendAI.state.subjects.find(s => s.id === parseInt(selectedVal));
    if (sub) {
      present = sub.present;
      conducted = sub.conducted;
      subjectName = sub.name;
    }
  }

  const currentPct = window.AttendAI.calculatePercentage(present, conducted);
  const safeBunks = window.AttendAI.calculateSafeBunks(present, conducted, targetPct);
  const recoveryReq = window.AttendAI.calculateRecoveryRequired(present, conducted, targetPct);

  // Update Summary DOM
  document.getElementById('calc-subject-label').textContent = subjectName;
  document.getElementById('calc-current-pct').textContent = `${currentPct.toFixed(2)}%`;
  document.getElementById('calc-present-conducted').textContent = `${present} / ${conducted} classes`;

  const statusBadge = document.getElementById('calc-status-badge');
  if (statusBadge) {
    if (currentPct >= targetPct) {
      statusBadge.textContent = 'SAFE';
      statusBadge.className = 'badge badge-safe';
    } else {
      statusBadge.textContent = 'RECOVERY NEEDED';
      statusBadge.className = 'badge badge-danger';
    }
  }

  // Update Bunk & Recovery Panels
  const bunkResultElem = document.getElementById('calc-bunk-result');
  if (bunkResultElem) {
    if (currentPct >= targetPct) {
      bunkResultElem.innerHTML = `
        <div style="font-size:2.2rem; font-weight:800; color:var(--status-safe);">${safeBunks} Classes</div>
        <p style="color:var(--text-secondary); margin-top:0.35rem;">
          You can safely miss up to <strong>${safeBunks}</strong> consecutive classes without dropping below ${targetPct}%.
        </p>
        <div style="font-size:0.8rem; color:var(--text-muted); margin-top:0.5rem;">
          After ${safeBunks} misses: <strong>${(window.AttendAI.calculatePercentage(present, conducted + safeBunks)).toFixed(2)}%</strong> (Safe)<br>
          After ${safeBunks + 1} misses: <strong>${(window.AttendAI.calculatePercentage(present, conducted + safeBunks + 1)).toFixed(2)}%</strong> (Falls below target)
        </div>
      `;
    } else {
      bunkResultElem.innerHTML = `
        <div style="font-size:1.5rem; font-weight:700; color:var(--status-danger);">0 Classes (Buffer Depleted)</div>
        <p style="color:var(--text-secondary); margin-top:0.35rem;">
          Attendance is currently below target (${currentPct.toFixed(2)}% &lt; ${targetPct}%). Any further miss will aggravate the recovery requirement.
        </p>
      `;
    }
  }

  const recoveryResultElem = document.getElementById('calc-recovery-result');
  if (recoveryResultElem) {
    if (currentPct < targetPct) {
      const recoveredPct = window.AttendAI.calculatePercentage(present + recoveryReq, conducted + recoveryReq);
      recoveryResultElem.innerHTML = `
        <div style="font-size:2.2rem; font-weight:800; color:var(--status-danger);">${recoveryReq} Classes</div>
        <p style="color:var(--text-secondary); margin-top:0.35rem;">
          You must attend <strong>${recoveryReq} consecutive classes</strong> to restore your attendance back to ${targetPct}%.
        </p>
        <div style="font-size:0.8rem; color:var(--text-muted); margin-top:0.5rem;">
          After ${recoveryReq} attended: <strong>${recoveredPct.toFixed(2)}%</strong> (Recovery Reached)
        </div>
      `;
    } else {
      recoveryResultElem.innerHTML = `
        <div style="font-size:1.5rem; font-weight:700; color:var(--status-safe);">0 Classes (Already Compliant)</div>
        <p style="color:var(--text-secondary); margin-top:0.35rem;">
          You are already comfortably at or above the minimum required threshold of ${targetPct}%.
        </p>
      `;
    }
  }

  // Generate Future Projections Table
  generateProjectionsTable(present, conducted, targetPct);
}

function generateProjectionsTable(present, conducted, targetPct) {
  const tbody = document.getElementById('projections-table-body');
  if (!tbody) return;

  const scenarios = [
    { label: "Current Record", addP: 0, addT: 0 },
    { label: "Attend next 1 class", addP: 1, addT: 1 },
    { label: "Attend next 3 classes", addP: 3, addT: 3 },
    { label: "Attend next 5 classes", addP: 5, addT: 5 },
    { label: "Attend next 10 classes", addP: 10, addT: 10 },
    { label: "Miss next 1 class", addP: 0, addT: 1 },
    { label: "Miss next 2 classes", addP: 0, addT: 2 },
    { label: "Miss next 3 classes", addP: 0, addT: 3 },
    { label: "Miss next 5 classes", addP: 0, addT: 5 }
  ];

  tbody.innerHTML = scenarios.map(sc => {
    const simP = present + sc.addP;
    const simT = conducted + sc.addT;
    const simPct = window.AttendAI.calculatePercentage(simP, simT);
    const isSafe = simPct >= targetPct;

    return `
      <tr>
        <td><strong>${sc.label}</strong></td>
        <td>${simP} / ${simT}</td>
        <td><strong style="color: ${isSafe ? 'var(--status-safe)' : 'var(--status-danger)'}">${simPct.toFixed(2)}%</strong></td>
        <td>
          <span class="badge ${isSafe ? 'badge-safe' : 'badge-danger'}">
            ${isSafe ? 'Safe' : 'Below Cutoff'}
          </span>
        </td>
      </tr>
    `;
  }).join('');
}
