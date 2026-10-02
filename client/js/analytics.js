/**
 * AttendAI — Analytics & Visual Intelligence Controller
 */

document.addEventListener('DOMContentLoaded', () => {
  initAnalyticsCharts();
});

function initAnalyticsCharts() {
  const trendCtx = document.getElementById('chart-attendance-trend');
  const subjectCtx = document.getElementById('chart-subject-comparison');
  const distributionCtx = document.getElementById('chart-attendance-distribution');

  if (typeof Chart === 'undefined') {
    console.warn('Chart.js library not loaded yet');
    return;
  }

  // Set Chart.js Defaults for Dark Mode Compatibility
  Chart.defaults.color = '#94a3b8';
  Chart.defaults.borderColor = 'rgba(255, 255, 255, 0.08)';
  Chart.defaults.font.family = "'Inter', sans-serif";

  // 1. Attendance Trend Over Recent Weeks
  if (trendCtx) {
    new Chart(trendCtx, {
      type: 'line',
      data: {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7 (Current)'],
        datasets: [
          {
            label: 'Your Attendance (%)',
            data: [82.5, 80.0, 76.2, 74.8, 77.1, 76.8, 78.41],
            borderColor: '#6366f1',
            backgroundColor: 'rgba(99, 102, 241, 0.15)',
            fill: true,
            tension: 0.35,
            pointBackgroundColor: '#6366f1',
            pointRadius: 5
          },
          {
            label: 'Minimum Requirement (75%)',
            data: [75, 75, 75, 75, 75, 75, 75],
            borderColor: '#ef4444',
            borderDash: [5, 5],
            pointRadius: 0,
            fill: false
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top' },
          tooltip: {
            callbacks: {
              label: (ctx) => `${ctx.dataset.label}: ${ctx.raw}%`
            }
          }
        },
        scales: {
          y: { min: 50, max: 100, ticks: { callback: v => `${v}%` } }
        }
      }
    });
  }

  // 2. Subject-wise Comparison Bar Chart
  if (subjectCtx) {
    const subjects = window.AttendAI.state.subjects;
    const labels = subjects.map(s => s.code);
    const percentages = subjects.map(s => {
      return Number(window.AttendAI.calculatePercentage(s.present, s.conducted).toFixed(1));
    });

    const backgroundColors = percentages.map(p => p >= 75 ? 'rgba(16, 185, 129, 0.7)' : 'rgba(239, 68, 68, 0.7)');

    new Chart(subjectCtx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Attendance %',
          data: percentages,
          backgroundColor: backgroundColors,
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => `${ctx.raw}% Attendance`
            }
          }
        },
        scales: {
          y: { min: 0, max: 100, ticks: { callback: v => `${v}%` } }
        }
      }
    });
  }

  // 3. Present vs Absent Breakdown Doughnut
  if (distributionCtx) {
    const stats = window.AttendAI.getOverallStats();
    new Chart(distributionCtx, {
      type: 'doughnut',
      data: {
        labels: ['Present', 'Absent', 'OD / Approved'],
        datasets: [{
          data: [stats.present, stats.absent, 8],
          backgroundColor: ['#10b981', '#ef4444', '#0ea5e9'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom' }
        },
        cutout: '70%'
      }
    });
  }
}
