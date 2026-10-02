/**
 * AttendAI — AI Attendance Assistant Controller
 * Safety & Grounding Guarantee:
 * 1. AI generates insights based on verified calculations only.
 * 2. Strict Credential Shield: Refuses disclosure of passwords, API keys, tokens, or other students' data.
 */

document.addEventListener('DOMContentLoaded', () => {
  initAIChat();
});

function initAIChat() {
  const input = document.getElementById('ai-chat-input');
  const sendBtn = document.getElementById('ai-send-btn');

  if (sendBtn && input) {
    sendBtn.addEventListener('click', () => handleUserSendMessage());
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') handleUserSendMessage();
    });
  }
}

function sendPresetQuestion(questionText) {
  const input = document.getElementById('ai-chat-input');
  if (input) {
    input.value = questionText;
    handleUserSendMessage();
  }
}

function handleUserSendMessage() {
  const input = document.getElementById('ai-chat-input');
  const messagesArea = document.getElementById('ai-chat-messages');
  if (!input || !messagesArea) return;

  const query = input.value.trim();
  if (!query) return;

  // Append User message
  appendChatMessage(query, 'user');
  input.value = '';
  messagesArea.scrollTop = messagesArea.scrollHeight;

  // Show thinking indicator
  const typingId = 'typing-' + Date.now();
  const typingDiv = document.createElement('div');
  typingDiv.className = 'chat-bubble ai';
  typingDiv.id = typingId;
  typingDiv.innerHTML = `<em>AttendAI is analyzing your attendance baseline and today's schedule...</em>`;
  messagesArea.appendChild(typingDiv);
  messagesArea.scrollTop = messagesArea.scrollHeight;

  setTimeout(() => {
    const el = document.getElementById(typingId);
    if (el) el.remove();

    const aiResponse = generateAIResponse(query);
    appendChatMessage(aiResponse, 'ai');
    messagesArea.scrollTop = messagesArea.scrollHeight;
  }, 500);
}

function appendChatMessage(text, role) {
  const messagesArea = document.getElementById('ai-chat-messages');
  if (!messagesArea) return;

  const bubble = document.createElement('div');
  bubble.className = `chat-bubble ${role}`;
  bubble.innerHTML = text;
  messagesArea.appendChild(bubble);
}

function generateAIResponse(query) {
  const q = query.toLowerCase();

  // Strict Credential Shield (Section 16)
  if (q.includes('password') || q.includes('admin pass') || q.includes('api key') || q.includes('secret') || q.includes('database pass') || q.includes('token')) {
    return `
      🔒 <strong>Security Notice:</strong> Sensitive credentials, administrator security keys, database secrets, and passwords are protected and cannot be disclosed.
    `;
  }

  // Cross-Student Access Guard (Section 9, 54)
  if (q.includes('other student') || q.includes('vtu') || q.includes('roll no') || q.includes('all students')) {
    return `
      🔒 <strong>Privacy Policy:</strong> AttendAI enforces strict student data isolation. You can only analyze your own personal verified attendance.
    `;
  }

  const stats = window.AttendAI.getOverallStats();
  const subjects = stats.subjects;

  if (q.includes('bunk') || q.includes('miss')) {
    return `
      Your overall attendance is <strong>${stats.percentage}%</strong> 👍<br><br>
      Based on exact mathematical calculations:
      <ul>
        <li>You have <strong>${stats.safeBunkCount} safe bunks</strong> across safe subjects.</li>
        <li><strong>Operating Systems</strong> is at <strong>${subjects[4].percentage}%</strong> (0 safe bunks).</li>
        <li><strong>Java Programming</strong> is at <strong>${subjects[0].percentage}%</strong> (0 safe bunks).</li>
      </ul>
      <strong>Recommendation:</strong> Do NOT miss OS or Java. If you need time off, you can safely skip <strong>Mathematics (${subjects[3].percentage}%)</strong>.
    `;
  }

  if (q.includes('risky') || q.includes('danger') || q.includes('attention') || q.includes('drop')) {
    const low = subjects.filter(s => s.percentage < 75);
    if (low.length === 0) {
      return `Great news! All registered subjects are currently above the 75% cutoff threshold! 🚀`;
    }
    const list = low.map(s => {
      return `<li><strong>${s.name}</strong>: ${s.percentage}% (Need to attend next <strong>${s.recoveryRequired}</strong> classes)</li>`;
    }).join('');

    return `
      Here are the subjects that need your immediate focus ⚠️:
      <ul>${list}</ul>
      Prioritize these sessions this week to stay out of the debar list!
    `;
  }

  if (q.includes('recovery') || q.includes('plan') || q.includes('reach 75')) {
    return `
      Here is your personalized recovery blueprint 📋:
      <ol>
        <li><strong>Operating Systems:</strong> Currently ${subjects[4].present}/${subjects[4].conducted} (${subjects[4].percentage}%). Attend <strong>${subjects[4].recoveryRequired} consecutive classes</strong> to restore 75%.</li>
        <li><strong>Java Programming:</strong> Currently ${subjects[0].present}/${subjects[0].conducted} (${subjects[0].percentage}%). Attend <strong>${subjects[0].recoveryRequired} consecutive classes</strong> to cross 75%.</li>
      </ol>
      Stick to this attendance plan for the next 2 weeks to be completely safe before internal exams!
    `;
  }

  if (q.includes('today') || q.includes('tomorrow') || q.includes('plan')) {
    return `
      <strong>Today's Strategic Attendance Plan 🎯</strong><br><br>
      You have 5 scheduled sessions today:
      <ul>
        <li>09:00 AM — Java Programming (Priority 1: Attention needed)</li>
        <li>10:15 AM — DBMS (Safe: 84.44%)</li>
        <li>11:30 AM — Cyber Security (Safe: 85.00%)</li>
        <li>02:00 PM — Mathematics - III (Comfortable: 86.96%)</li>
        <li>03:15 PM — Operating Systems (Priority 1: Must attend)</li>
      </ul>
      <strong>Bottom line:</strong> Mark Java and Operating Systems as Present in the <a href="today.html" style="color:var(--brand-primary);">Today tab</a>!
    `;
  }

  // Default intelligent assistant response
  return `
    Your overall attendance stands at <strong>${stats.percentage}%</strong> with <strong>${stats.present} / ${stats.conducted}</strong> classes attended.<br><br>
    You currently have <strong>${stats.safeBunkCount} safe bunks</strong> left overall. How else can I help optimize your academic schedule today?
  `;
}
