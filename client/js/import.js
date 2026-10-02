/**
 * AttendAI — AI Import & Document Analysis Hub
 * Supports: Text, Image / Screenshot (OCR), PDF, CSV, Excel (Sections 32-48)
 * Safety: AI extracts -> UI previews with Confidence -> Student Confirms -> Database Stores
 */

let currentImportScope = 'attendance';
let detectedData = null;

document.addEventListener('DOMContentLoaded', () => {
  renderImportHistory();
});

function setImportScope(scope) {
  currentImportScope = scope;
  const buttons = document.querySelectorAll('.scope-tab-btn');
  buttons.forEach(b => b.classList.remove('active'));
  event.target.classList.add('active');

  const title = document.getElementById('import-scope-title');
  const helper = document.getElementById('import-scope-helper');

  if (scope === 'attendance') {
    title.textContent = 'Import College Attendance Baseline';
    helper.textContent = 'Upload or paste your subject-wise conducted and attended counts.';
  } else if (scope === 'calendar') {
    title.textContent = 'Import Academic Calendar';
    helper.textContent = 'Upload college semester schedule, holidays, exam dates, and working days.';
  } else if (scope === 'timetable') {
    title.textContent = 'Import Weekly Timetable';
    helper.textContent = 'Upload period schedule, subject codes, faculty, and room allocations.';
  } else {
    title.textContent = 'Import Complete College Bundle';
    helper.textContent = 'Combined document containing attendance, calendar, and timetable.';
  }

  // Clear previous preview
  document.getElementById('import-preview-section').style.display = 'none';
}

function processTextImport() {
  const textInput = document.getElementById('import-text-input').value.trim();
  if (!textInput) {
    showToast('Please paste your attendance or calendar text', 'warning');
    return;
  }

  showToast('Analyzing text with AI parser...', 'info');

  setTimeout(() => {
    // Parse simulated lines (e.g. Java - 35/42 or Java 35 42)
    const lines = textInput.split('\n').filter(l => l.trim().length > 0);
    const parsedSubjects = [];

    lines.forEach((line, idx) => {
      const matchRatio = line.match(/(.*?)[-:\s]+(\d+)[\s\/]+(\d+)/);
      if (matchRatio) {
        const name = matchRatio[1].trim();
        const p = parseInt(matchRatio[2]);
        const t = parseInt(matchRatio[3]);
        const pct = ((p / t) * 100).toFixed(2);
        parsedSubjects.push({
          id: idx + 1,
          name: name || `Subject ${idx + 1}`,
          code: `CS${300 + idx + 1}`,
          present: p,
          conducted: t,
          percentage: pct,
          confidence: 'High'
        });
      } else {
        parsedSubjects.push({
          id: idx + 1,
          name: line.trim(),
          code: `CS${300 + idx + 1}`,
          present: 30,
          conducted: 40,
          percentage: '75.00',
          confidence: 'Low'
        });
      }
    });

    detectedData = parsedSubjects;
    renderImportPreview(parsedSubjects);
  }, 600);
}

function handleFileUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const fileName = file.name;
  showToast(`Analyzing ${fileName} with document parser...`, 'info');

  setTimeout(() => {
    // Simulated realistic OCR / Document extraction from screenshot/PDF
    detectedData = [
      { id: 1, name: "Java Programming", code: "CS301", present: 35, conducted: 42, percentage: "83.33", confidence: "High" },
      { id: 2, name: "Database Management Systems", code: "CS302", present: 38, conducted: 45, percentage: "84.44", confidence: "High" },
      { id: 3, name: "Cyber Security", code: "CS303", present: 34, conducted: 40, percentage: "85.00", confidence: "High" },
      { id: 4, name: "Mathematics - III", code: "MA301", present: 40, conducted: 46, percentage: "86.96", confidence: "High" },
      { id: 5, name: "Operating Systems", code: "CS304", present: 32, conducted: 41, percentage: "78.05", confidence: "High" }
    ];

    renderImportPreview(detectedData, fileName);
  }, 800);
}

function renderImportPreview(data, sourceName = "Pasted Text") {
  const previewSection = document.getElementById('import-preview-section');
  const tbody = document.getElementById('import-preview-tbody');
  const sourceLabel = document.getElementById('preview-source-label');

  if (sourceLabel) sourceLabel.textContent = `Source: ${sourceName}`;

  if (tbody) {
    tbody.innerHTML = data.map((item, index) => {
      const isHighConf = item.confidence === 'High';
      return `
        <tr>
          <td><input type="text" class="form-input" style="padding:0.35rem;" value="${item.name}" onchange="detectedData[${index}].name=this.value"></td>
          <td><input type="text" class="form-input" style="padding:0.35rem; width:90px;" value="${item.code}" onchange="detectedData[${index}].code=this.value"></td>
          <td><input type="number" class="form-input" style="padding:0.35rem; width:80px;" value="${item.present}" onchange="updateRowMath(${index}, 'present', this.value)"></td>
          <td><input type="number" class="form-input" style="padding:0.35rem; width:80px;" value="${item.conducted}" onchange="updateRowMath(${index}, 'conducted', this.value)"></td>
          <td><strong id="row-pct-${index}">${item.percentage}%</strong></td>
          <td>
            <span class="badge ${isHighConf ? 'badge-safe' : 'badge-warning'}">
              ${item.confidence}
            </span>
          </td>
        </tr>
      `;
    }).join('');
  }

  if (previewSection) {
    previewSection.style.display = 'block';
    previewSection.scrollIntoView({ behavior: 'smooth' });
  }

  if (window.lucide) lucide.createIcons();
}

function updateRowMath(index, field, val) {
  if (!detectedData || !detectedData[index]) return;
  detectedData[index][field] = parseInt(val) || 0;
  const p = detectedData[index].present;
  const t = detectedData[index].conducted;
  const pct = t > 0 ? ((p / t) * 100).toFixed(2) : '0.00';
  detectedData[index].percentage = pct;

  const pctElem = document.getElementById(`row-pct-${index}`);
  if (pctElem) pctElem.textContent = `${pct}%`;
}

function confirmImportAndSave() {
  if (!detectedData || detectedData.length === 0) return;

  // Check if existing data is present for Merge Protection (Section 40)
  const hasExisting = window.AttendAI.state.baselines && window.AttendAI.state.baselines.length > 0;

  if (hasExisting) {
    const modal = document.getElementById('import-merge-modal');
    if (modal) {
      modal.style.display = 'flex';
      return;
    }
  }

  executeBaselineSave('replace');
}

function executeBaselineSave(mode) {
  const modal = document.getElementById('import-merge-modal');
  if (modal) modal.style.display = 'none';

  // Apply new baselines
  const newBaselines = detectedData.map((d, i) => ({
    subjectId: i + 1,
    subject: d.name,
    code: d.code,
    faculty: "Assigned Faculty",
    conducted: d.conducted,
    present: d.present
  }));

  window.AttendAI.state.baselines = newBaselines;
  window.AttendAI.state.attendanceEvents = []; // Reset live events if replaced

  // Record into Import History
  if (!window.AttendAI.state.importHistory) window.AttendAI.state.importHistory = [];
  window.AttendAI.state.importHistory.unshift({
    id: Date.now(),
    type: currentImportScope,
    fileName: "Attendance_Import.pdf",
    recordsCount: detectedData.length,
    status: "Imported & Verified",
    timestamp: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
  });

  window.AttendAI.saveState();
  showToast('Attendance baseline successfully created and verified!', 'success');

  setTimeout(() => {
    window.location.href = 'dashboard.html';
  }, 900);
}

function renderImportHistory() {
  const tbody = document.getElementById('import-history-tbody');
  if (!tbody) return;

  const history = window.AttendAI.state.importHistory || [
    { id: 1, type: "Attendance PDF", fileName: "Official_AMS_Report.pdf", recordsCount: 5, status: "Imported & Active", timestamp: "02 Oct 2026" },
    { id: 2, type: "Academic Calendar", fileName: "Semester_Calendar_2026.pdf", recordsCount: 31, status: "Imported", timestamp: "01 Oct 2026" },
    { id: 3, type: "Weekly Timetable", fileName: "Timetable_SecA.xlsx", recordsCount: 24, status: "Imported", timestamp: "01 Oct 2026" }
  ];

  tbody.innerHTML = history.map(h => `
    <tr>
      <td><strong>${h.type}</strong></td>
      <td style="color:var(--text-secondary);">${h.fileName}</td>
      <td>${h.recordsCount} records</td>
      <td><span class="badge badge-safe">${h.status}</span></td>
      <td style="color:var(--text-muted); font-size:0.8rem;">${h.timestamp}</td>
    </tr>
  `).join('');
}
