/**
 * AttendAI — First-Time Student Setup Wizard
 * Steps:
 * 1. Personal Info
 * 2. Academic Info
 * 3. Attendance Rule
 * 4. Subjects
 * 5. Timetable
 * 6. Existing Attendance
 */

let currentWizardStep = 1;
const totalWizardSteps = 6;

document.addEventListener('DOMContentLoaded', () => {
  updateWizardUI();
});

function nextStep() {
  if (currentWizardStep < totalWizardSteps) {
    currentWizardStep++;
    updateWizardUI();
  } else {
    // Finish setup
    showToast('Setup completed successfully! Redirecting to dashboard...', 'success');
    setTimeout(() => {
      window.location.href = 'dashboard.html';
    }, 1200);
  }
}

function prevStep() {
  if (currentWizardStep > 1) {
    currentWizardStep--;
    updateWizardUI();
  }
}

function updateWizardUI() {
  for (let i = 1; i <= totalWizardSteps; i++) {
    const stepEl = document.getElementById(`wizard-step-${i}`);
    const indicatorEl = document.getElementById(`step-indicator-${i}`);

    if (stepEl) {
      stepEl.style.display = (i === currentWizardStep) ? 'block' : 'none';
    }

    if (indicatorEl) {
      if (i < currentWizardStep) {
        indicatorEl.className = 'wizard-indicator-step completed';
      } else if (i === currentWizardStep) {
        indicatorEl.className = 'wizard-indicator-step active';
      } else {
        indicatorEl.className = 'wizard-indicator-step';
      }
    }
  }

  const prevBtn = document.getElementById('wizard-prev-btn');
  const nextBtn = document.getElementById('wizard-next-btn');

  if (prevBtn) {
    prevBtn.style.visibility = currentWizardStep === 1 ? 'hidden' : 'visible';
  }

  if (nextBtn) {
    nextBtn.textContent = currentWizardStep === totalWizardSteps ? 'Complete Setup 🚀' : 'Next Step →';
  }
}

function addSubjectRow() {
  const container = document.getElementById('wizard-subject-list');
  if (!container) return;

  const div = document.createElement('div');
  div.className = 'form-group';
  div.style.display = 'grid';
  div.style.gridTemplateColumns = '2fr 1fr 2fr 40px';
  div.style.gap = '0.5rem';
  div.style.alignItems = 'center';

  div.innerHTML = `
    <input type="text" class="form-input" placeholder="Subject Name (e.g. Cloud Computing)" required>
    <input type="text" class="form-input" placeholder="Code (e.g. CS305)" required>
    <input type="text" class="form-input" placeholder="Faculty (Optional)">
    <button type="button" class="btn btn-danger btn-icon-only" onclick="this.parentElement.remove()">✕</button>
  `;

  container.appendChild(div);
}
