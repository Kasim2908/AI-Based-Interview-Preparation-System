const data = {
  "software developer": {
    technical: [
      "What is the difference between let, const, and var in JavaScript?",
      "Explain OOP concepts with a real-world example.",
      "How does REST API work in web applications?"
    ],
    behavioral: [
      "Tell me about a time you solved a difficult bug.",
      "How do you handle feedback from a team lead?",
      "Why do you want to work as a software developer?"
    ],
    problemSolving: [
      "How would you design a URL shortener?",
      "How do you optimize a slow application?",
      "How do you debug a production issue?"
    ]
  },
  "devops engineer": {
    technical: [
      "What is CI/CD and why is it important?",
      "Explain the difference between Docker and Kubernetes.",
      "What is Terraform used for?"
    ],
    behavioral: [
      "Tell me about a time you handled a deployment failure.",
      "How do you work with developers and testers?",
      "Why do you want to become a DevOps engineer?"
    ],
    problemSolving: [
      "How would you reduce deployment downtime?",
      "How do you monitor a production application?",
      "How do you secure a CI/CD pipeline?"
    ]
  },
  "data analyst": {
    technical: [
      "What is the difference between correlation and causation?",
      "How do you clean and prepare messy data?",
      "Explain SQL joins with examples."
    ],
    behavioral: [
      "Tell me about a dashboard you built.",
      "How do you explain insights to non-technical people?",
      "Why do you want to work in data analytics?"
    ],
    problemSolving: [
      "How would you find the cause of a sales drop?",
      "How do you detect anomalies in data?",
      "How do you choose the right chart for a report?"
    ]
  },
  "web developer": {
    technical: [
      "What happens when a user enters a URL in the browser?",
      "Explain the DOM and how JavaScript interacts with it.",
      "What is the difference between flexbox and grid?"
    ],
    behavioral: [
      "Tell me about a responsive website you built.",
      "How do you handle a design change late in the project?",
      "Why do you want to work as a web developer?"
    ],
    problemSolving: [
      "How do you improve website performance?",
      "How do you make a website mobile friendly?",
      "How do you fix layout issues across browsers?"
    ]
  }
};

const roleKeywords = {
  "software developer": ["code", "function", "object", "api", "debug", "algorithm", "logic"],
  "devops engineer": ["docker", "kubernetes", "terraform", "ci/cd", "deploy", "pipeline", "monitor"],
  "data analyst": ["sql", "data", "dashboard", "analysis", "report", "visualization", "chart"],
  "web developer": ["html", "css", "javascript", "responsive", "dom", "frontend", "browser"]
};

const roleGrid = document.getElementById("roleGrid");
const categoryGrid = document.getElementById("categoryGrid");
const startBtn = document.getElementById("startBtn");
const submitBtn = document.getElementById("submitBtn");
const nextBtn = document.getElementById("nextBtn");
const resetBtn = document.getElementById("resetBtn");
const recordBtn = document.getElementById("recordBtn");
const clearHistoryBtn = document.getElementById("clearHistoryBtn");
const themeToggle = document.getElementById("themeToggle");
const beginNowBtn = document.getElementById("beginNowBtn");

const roleLabel = document.getElementById("roleLabel");
const questionText = document.getElementById("questionText");
const questionCount = document.getElementById("questionCount");
const progressFill = document.getElementById("progressFill");
const answerInput = document.getElementById("answerInput");
const feedbackBox = document.getElementById("feedbackBox");
const scoreText = document.getElementById("scoreText");
const timerText = document.getElementById("timerText");
const historyList = document.getElementById("historyList");
const audioPlayer = document.getElementById("audioPlayer");

const clarityScore = document.getElementById("clarityScore");
const confidenceScore = document.getElementById("confidenceScore");
const keywordScore = document.getElementById("keywordScore");

let selectedRole = "software developer";
let selectedCategory = "technical";
let currentQuestionIndex = 0;
let started = false;
let score = 0;
let timerSeconds = 90;
let timerInterval = null;
let currentQuestions = [];

let mediaRecorder = null;
let audioChunks = [];
let isRecording = false;

function saveTheme(theme) {
  localStorage.setItem("ai-interview-theme", theme);
}

function loadTheme() {
  const saved = localStorage.getItem("ai-interview-theme");
  if (saved === "light") {
    document.body.classList.add("light");
    themeToggle.textContent = "☀️";
  } else {
    document.body.classList.remove("light");
    themeToggle.textContent = "🌙";
  }
}

function toggleTheme() {
  document.body.classList.toggle("light");
  const isLight = document.body.classList.contains("light");
  themeToggle.textContent = isLight ? "☀️" : "🌙";
  saveTheme(isLight ? "light" : "dark");
}

function capitalize(text) {
  return text
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function buildRoleButtons() {
  if (!roleGrid) return;
  roleGrid.innerHTML = "";
  Object.keys(data).forEach(role => {
    const btn = document.createElement("button");
    btn.className = "chip";
    btn.textContent = capitalize(role);
    btn.dataset.role = role;
    btn.addEventListener("click", () => {
      selectedRole = role;
      selectedCategory = "technical";
      currentQuestionIndex = 0;
      renderRoleAndCategoryButtons();
      if (started) {
        setQuestions();
        loadQuestion();
      }
    });
    roleGrid.appendChild(btn);
  });
}

function buildCategoryButtons() {
  if (!categoryGrid) return;
  categoryGrid.innerHTML = "";
  ["technical", "behavioral", "problemSolving"].forEach(cat => {
    const btn = document.createElement("button");
    btn.className = "chip";
    btn.textContent = cat === "problemSolving" ? "Problem Solving" : capitalize(cat);
    btn.dataset.category = cat;
    btn.addEventListener("click", () => {
      selectedCategory = cat;
      currentQuestionIndex = 0;
      renderRoleAndCategoryButtons();
      if (started) {
        setQuestions();
        loadQuestion();
      }
    });
    categoryGrid.appendChild(btn);
  });
}

function renderRoleAndCategoryButtons() {
  document.querySelectorAll("#roleGrid .chip").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.role === selectedRole);
  });

  document.querySelectorAll("#categoryGrid .chip").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.category === selectedCategory);
  });

  if (roleLabel) {
    roleLabel.textContent = `Role: ${capitalize(selectedRole)} | Category: ${
      selectedCategory === "problemSolving" ? "Problem Solving" : capitalize(selectedCategory)
    }`;
  }
}

function setQuestions() {
  currentQuestions = data[selectedRole][selectedCategory];
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function updateTimer() {
  timerText.textContent = formatTime(timerSeconds);

  if (timerSeconds <= 15) {
    timerText.style.color = "#ef4444";
  } else {
    timerText.style.color = "inherit";
  }

  if (timerSeconds <= 0) {
    stopTimer();
    feedbackBox.textContent = "Time is up for this question. Moving to the next one.";
    nextQuestion();
  }
}

function startTimer() {
  stopTimer();
  timerSeconds = 90;
  updateTimer();
  timerInterval = setInterval(() => {
    timerSeconds -= 1;
    updateTimer();
  }, 1000);
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

function loadQuestion() {
  if (!currentQuestions.length) setQuestions();

  questionText.textContent = currentQuestions[currentQuestionIndex];
  questionCount.textContent = `Question ${currentQuestionIndex + 1} of ${currentQuestions.length}`;
  progressFill.style.width = `${(currentQuestionIndex / currentQuestions.length) * 100}%`;
  answerInput.value = "";
  feedbackBox.textContent = "Your feedback will appear here after you submit an answer.";
  clarityScore.textContent = "0/10";
  confidenceScore.textContent = "0/10";
  keywordScore.textContent = "0/10";
  startTimer();
}

function startInterview() {
  started = true;
  currentQuestionIndex = 0;
  score = 0;
  setQuestions();
  renderRoleAndCategoryButtons();
  loadQuestion();
  scoreText.textContent = score;
}

function analyzeAnswer(answer) {
  const trimmed = answer.trim();
  const wordCount = trimmed.split(/\s+/).filter(Boolean).length;
  const text = trimmed.toLowerCase();

  const clarity = Math.min(10, Math.floor(wordCount / 10) + 3);
  const confidence = Math.min(10, trimmed.length > 90 ? 8 : 5);

  let keyword = 0;
  roleKeywords[selectedRole].forEach(word => {
    if (text.includes(word)) keyword += 2;
  });
  keyword = Math.min(10, keyword);

  clarityScore.textContent = `${clarity}/10`;
  confidenceScore.textContent = `${confidence}/10`;
  keywordScore.textContent = `${keyword}/10`;

  const total = Math.round((clarity + confidence + keyword) / 3);
  score = Math.min(100, score + total);
  scoreText.textContent = score;

  let feedback = "";
  if (wordCount < 20) {
    feedback = "Your answer is too short. Add examples, structure, and more detail.";
  } else if (keyword >= 6) {
    feedback = "Strong answer. Good structure and relevant role-based keywords.";
  } else {
    feedback = "Good attempt. Add more technical terms and a real-world example.";
  }

  feedbackBox.textContent = feedback;
}

function saveScoreHistory(answerSubmitted) {
  if (!answerSubmitted) return;

  const history = JSON.parse(localStorage.getItem("ai-interview-history") || "[]");
  history.unshift({
    role: capitalize(selectedRole),
    category: selectedCategory === "problemSolving" ? "Problem Solving" : capitalize(selectedCategory),
    score,
    date: new Date().toLocaleString()
  });

  localStorage.setItem("ai-interview-history", JSON.stringify(history.slice(0, 8)));
  renderHistory();
}

function renderHistory() {
  const history = JSON.parse(localStorage.getItem("ai-interview-history") || "[]");
  historyList.innerHTML = "";

  if (!history.length) {
    historyList.innerHTML = `<div class="history-item"><strong>No history yet</strong><small>Complete an answer to save your score.</small></div>`;
    return;
  }

  history.forEach(item => {
    const div = document.createElement("div");
    div.className = "history-item";
    div.innerHTML = `
      <strong>${item.role} • ${item.category}</strong>
      <small>${item.date}</small>
      <span>Score: <b>${item.score}</b></span>
    `;
    historyList.appendChild(div);
  });
}

function submitAnswer() {
  if (!started) {
    feedbackBox.textContent = "Start the interview first.";
    return;
  }

  const answer = answerInput.value;
  if (!answer.trim()) {
    feedbackBox.textContent = "Please type an answer before submitting.";
    return;
  }

  analyzeAnswer(answer);
  saveScoreHistory(true);
}

function nextQuestion() {
  if (!started) return;

  stopTimer();

  if (currentQuestionIndex < currentQuestions.length - 1) {
    currentQuestionIndex += 1;
    loadQuestion();
  } else {
    questionText.textContent = "Interview completed. Great job!";
    questionCount.textContent = "All questions completed";
    progressFill.style.width = "100%";
    feedbackBox.textContent = "You finished this round. Check your score history and try another category.";
    answerInput.value = "";
    saveScoreHistory(true);
  }
}

function resetInterview() {
  started = false;
  currentQuestionIndex = 0;
  score = 0;
  timerSeconds = 90;
  stopTimer();
  scoreText.textContent = "0";
  timerText.textContent = "01:30";
  questionText.textContent = "Click “Start Interview” to begin.";
  questionCount.textContent = "Question 1 of 3";
  progressFill.style.width = "0%";
  answerInput.value = "";
  feedbackBox.textContent = "Your feedback will appear here after you submit an answer.";
  clarityScore.textContent = "0/10";
  confidenceScore.textContent = "0/10";
  keywordScore.textContent = "0/10";
  audioPlayer.classList.add("hidden");
  audioPlayer.src = "";
  if (isRecording) stopRecording();
}

async function startRecording() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    audioChunks = [];

    mediaRecorder.ondataavailable = e => {
      if (e.data.size > 0) audioChunks.push(e.data);
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(audioChunks, { type: "audio/webm" });
      const url = URL.createObjectURL(blob);
      audioPlayer.src = url;
      audioPlayer.classList.remove("hidden");
    };

    mediaRecorder.start();
    isRecording = true;
    recordBtn.textContent = "⏹ Stop Recording";
    feedbackBox.textContent = "Recording started. Speak your answer now.";
  } catch (error) {
    feedbackBox.textContent = "Microphone access denied or unavailable in this browser.";
  }
}

function stopRecording() {
  if (mediaRecorder && isRecording) {
    mediaRecorder.stop();
    mediaRecorder.stream.getTracks().forEach(track => track.stop());
    isRecording = false;
    recordBtn.textContent = "🎙 Start Recording";
  }
}

if (recordBtn) {
  recordBtn.addEventListener("click", () => {
    if (!isRecording) {
      startRecording();
    } else {
      stopRecording();
    }
  });
}

if (themeToggle) themeToggle.addEventListener("click", toggleTheme);
if (startBtn) startBtn.addEventListener("click", startInterview);
if (submitBtn) submitBtn.addEventListener("click", submitAnswer);
if (nextBtn) nextBtn.addEventListener("click", nextQuestion);
if (resetBtn) resetBtn.addEventListener("click", resetInterview);
if (clearHistoryBtn) {
  clearHistoryBtn.addEventListener("click", () => {
    localStorage.removeItem("ai-interview-history");
    renderHistory();
  });
}



window.addEventListener("load", () => {
  loadTheme();
  buildRoleButtons();
  buildCategoryButtons();
  renderRoleAndCategoryButtons();
  if (historyList) renderHistory();
});

if (themeToggle) {
  themeToggle.addEventListener("click", toggleTheme);
}