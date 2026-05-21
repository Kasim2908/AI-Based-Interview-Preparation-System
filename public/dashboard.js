const data = {
  "software developer": {
    technical: [
      "What is the difference between let, const, and var in JavaScript?",
      "Explain OOP concepts with a real-world example.",
      "How does REST API work in web applications?",
      "What are promises and async/await in JavaScript?",
      "Explain the difference between SQL and NoSQL databases."
    ],
    behavioral: [
      "Tell me about a time you solved a difficult bug.",
      "How do you handle feedback from a team lead?",
      "Why do you want to work as a software developer?",
      "Describe a situation where you had to meet a tight deadline.",
      "How do you approach learning new technologies?"
    ],
    problemSolving: [
      "How would you design a URL shortener?",
      "How do you optimize a slow application?",
      "How do you debug a production issue?",
      "Design a real-time chat application architecture.",
      "How would you handle authentication and authorization in an API?"
    ]
  },
  "devops engineer": {
    technical: [
      "What is CI/CD and why is it important?",
      "Explain the difference between Docker and Kubernetes.",
      "What is Terraform used for?",
      "How do you set up monitoring and logging in production?",
      "Explain the difference between vertical and horizontal scaling."
    ],
    behavioral: [
      "Tell me about a time you handled a deployment failure.",
      "How do you work with developers and testers?",
      "Why do you want to become a DevOps engineer?",
      "Describe your experience with incident management.",
      "How do you approach infrastructure security?"
    ],
    problemSolving: [
      "How would you reduce deployment downtime?",
      "How do you monitor a production application?",
      "How do you secure a CI/CD pipeline?",
      "Design a disaster recovery plan for a critical service.",
      "How would you implement auto-scaling for a web application?"
    ]
  },
  "data analyst": {
    technical: [
      "What is the difference between correlation and causation?",
      "How do you clean and prepare messy data?",
      "Explain SQL joins with examples.",
      "What are common statistical tests and when to use them?",
      "How do you handle missing or outlier data?"
    ],
    behavioral: [
      "Tell me about a dashboard you built.",
      "How do you explain insights to non-technical people?",
      "Why do you want to work in data analytics?",
      "Describe a time you discovered a critical data issue.",
      "How do you approach data validation and quality checks?"
    ],
    problemSolving: [
      "How would you find the cause of a sales drop?",
      "How do you detect anomalies in data?",
      "How do you choose the right chart for a report?",
      "Design a data pipeline for real-time analytics.",
      "How would you analyze customer churn patterns?"
    ]
  },
  "web developer": {
    technical: [
      "What happens when a user enters a URL in the browser?",
      "Explain the DOM and how JavaScript interacts with it.",
      "What is the difference between flexbox and grid?",
      "How do you optimize images and assets for web performance?",
      "Explain CORS and how to handle cross-origin requests."
    ],
    behavioral: [
      "Tell me about a responsive website you built.",
      "How do you handle a design change late in the project?",
      "Why do you want to work as a web developer?",
      "Describe your experience with version control and collaboration.",
      "How do you approach accessibility in web development?"
    ],
    problemSolving: [
      "How do you improve website performance?",
      "How do you make a website mobile friendly?",
      "How do you fix layout issues across browsers?",
      "Design a modern e-commerce website architecture.",
      "How would you implement real-time notifications in a web app?"
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
const askAIBtn = document.getElementById("askAIBtn");
const qaModal = document.getElementById("qaModal");
const qaOverlay = document.getElementById("qaOverlay");
const closeQAModal = document.getElementById("closeQAModal");
const qaInput = document.getElementById("qaInput");
const askBtn = document.getElementById("askBtn");
const qaHistory = document.getElementById("qaHistory");

const welcomeText = document.getElementById("welcomeText");
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

function capitalize(text) {
  return text
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
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
  localStorage.setItem("ai-interview-theme", isLight ? "light" : "dark");
}

function buildRoleButtons() {
  roleGrid.innerHTML = "";
  Object.keys(data).forEach((role) => {
    const btn = document.createElement("button");
    btn.className = "chip";
    btn.textContent = capitalize(role);
    btn.dataset.role = role;
    btn.addEventListener("click", () => {
      selectedRole = role;
      selectedCategory = "technical";
      currentQuestionIndex = 0;
      renderButtons();
      if (started) {
        setQuestions();
        loadQuestion();
      }
    });
    roleGrid.appendChild(btn);
  });
}

function buildCategoryButtons() {
  categoryGrid.innerHTML = "";
  ["technical", "behavioral", "problemSolving"].forEach((cat) => {
    const btn = document.createElement("button");
    btn.className = "chip";
    btn.textContent = cat === "problemSolving" ? "Problem Solving" : capitalize(cat);
    btn.dataset.category = cat;
    btn.addEventListener("click", () => {
      selectedCategory = cat;
      currentQuestionIndex = 0;
      renderButtons();
      if (started) {
        setQuestions();
        loadQuestion();
      }
    });
    categoryGrid.appendChild(btn);
  });
}

function renderButtons() {
  document.querySelectorAll("#roleGrid .chip").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.role === selectedRole);
  });

  document.querySelectorAll("#categoryGrid .chip").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.category === selectedCategory);
  });

  roleLabel.textContent = `Role: ${capitalize(selectedRole)} | Category: ${
    selectedCategory === "problemSolving" ? "Problem Solving" : capitalize(selectedCategory)
  }`;
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
  timerText.style.color = timerSeconds <= 15 ? "#ef4444" : "inherit";

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
  answerInput.disabled = false;
  answerInput.placeholder = "Type your answer here...";
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
  renderButtons();
  loadQuestion();
  scoreText.textContent = score;
}

async function analyzeAnswer(answer) {
  const trimmed = answer.trim();
  if (!trimmed) {
    feedbackBox.textContent = "Please provide an answer.";
    return;
  }

  feedbackBox.textContent = "🤖 Analyzing your answer with AI...";

  try {
    const response = await fetch('/api/feedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question: currentQuestions[currentQuestionIndex],
        answer: trimmed,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to get feedback.');
    }

    const data = await response.json();
    const feedbackText = data.feedback;

    // Parse scores from feedback
    const clarityMatch = feedbackText.match(/Clarity:\s*(\d+)\/10/);
    const confidenceMatch = feedbackText.match(/Confidence:\s*(\d+)\/10/);
    const relevanceMatch = feedbackText.match(/Relevance:\s*(\d+)\/10/);
    const technicalMatch = feedbackText.match(/Technical Correctness:\s*(\d+)\/10/);

    const clarity = clarityMatch ? parseInt(clarityMatch[1], 10) : 5;
    const confidence = confidenceMatch ? parseInt(confidenceMatch[1], 10) : 5;
    const relevance = relevanceMatch ? parseInt(relevanceMatch[1], 10) : 5;
    const technical = technicalMatch ? parseInt(technicalMatch[1], 10) : 5;

    clarityScore.textContent = `${clarity}/10`;
    confidenceScore.textContent = `${confidence}/10`;
    keywordScore.textContent = `${relevance}/10`;

    // Update score display with better formatting
    feedbackBox.innerHTML = `
      <div style="line-height: 1.8; font-size: 0.95rem;">
        <strong>📊 Performance Analysis:</strong><br>
        ${feedbackText.replace(/\n/g, '<br>')}
      </div>
    `;

    const avgScore = Math.round((clarity + confidence + relevance + technical) / 4);
    score = Math.min(100, score + avgScore);
    scoreText.textContent = score;
    saveScoreHistory(true);
  } catch (error) {
    feedbackBox.textContent = "❌ Failed to get AI feedback. Please try again.";
    console.error(error);
  }
}

async function saveScoreHistory(answerSubmitted) {
  if (!answerSubmitted) return;

  const historyItem = {
    role: capitalize(selectedRole),
    category: selectedCategory === "problemSolving" ? "Problem Solving" : capitalize(selectedCategory),
    score,
    date: new Date().toISOString()
  };

  try {
    await fetch('/api/history', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(historyItem),
    });
    renderHistory();
  } catch (error) {
    console.error('Failed to save history:', error);
  }
}

async function renderHistory() {
  try {
    const response = await fetch('/api/history');
    const history = await response.json();
    historyList.innerHTML = "";

    if (!history.length) {
      historyList.innerHTML = `<div class="history-item"><strong>No history yet</strong><small>Complete an answer to save your score.</small></div>`;
      return;
    }

    history.forEach((item) => {
      const div = document.createElement("div");
      div.className = "history-item";
      div.innerHTML = `
        <strong>${item.role} • ${item.category}</strong>
        <small>${new Date(item.date).toLocaleString()}</small>
        <span>Score: <b>${item.score}</b></span>
      `;
      historyList.appendChild(div);
    });
  } catch (error) {
    console.error('Failed to render history:', error);
  }
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
    // Interview completed - show performance report
    started = false;
    questionText.textContent = "🎉 Interview Completed!";
    questionCount.textContent = "All questions completed";
    progressFill.style.width = "100%";
    
    const performanceReport = `
      <div style="background: var(--accent); background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(34, 197, 94, 0.05)); border: 2px solid var(--accent); border-radius: 16px; padding: 20px; margin-bottom: 20px;">
        <h3 style="color: var(--accent); margin: 0 0 16px 0; font-size: 1.3rem;">📈 Performance Report</h3>
        <p style="color: var(--text); margin: 8px 0;"><strong>Final Score:</strong> <span style="color: var(--primary); font-size: 1.1rem; font-weight: bold;">${score}/100</span></p>
        <p style="color: var(--text); margin: 8px 0;"><strong>Role:</strong> ${capitalize(selectedRole)}</p>
        <p style="color: var(--text); margin: 8px 0;"><strong>Category:</strong> ${selectedCategory === "problemSolving" ? "Problem Solving" : capitalize(selectedCategory)}</p>
        <hr style="border: none; border-top: 1px solid var(--panel-border); opacity: 0.5; margin: 16px 0;">
        <p style="color: var(--text); margin: 12px 0;"><strong>📝 Summary:</strong></p>
        <p style="color: var(--text); line-height: 1.6; margin: 8px 0;">You completed ${currentQuestions.length} questions in this session. Your overall performance demonstrates understanding of key concepts. Continue practicing different categories to improve your interview skills.</p>
        <p style="color: var(--muted); font-size: 0.9rem; margin-top: 16px;"><strong>💡 Next Steps:</strong></p>
        <ul style="margin: 8px 0; padding-left: 20px; color: var(--text); font-size: 0.95rem;">
          <li style="margin: 6px 0;">Try different question categories to broaden your knowledge</li>
          <li style="margin: 6px 0;">Practice role-specific interviews for your target job</li>
          <li style="margin: 6px 0;">Review your score history to track improvement</li>
          <li style="margin: 6px 0;">Focus on answers with lower scores for improvement</li>
        </ul>
      </div>
      <div style="background: var(--ghost); border: 1px solid var(--panel-border); border-radius: 12px; padding: 16px; color: var(--muted); text-align: center; font-size: 0.95rem;">
        Click <strong>'Start Interview'</strong> to practice more questions or select a different category.
      </div>
    `;
    
    feedbackBox.innerHTML = performanceReport;
    answerInput.value = "";
    answerInput.disabled = true;
    answerInput.placeholder = "Interview completed. Start a new session to continue.";
    
    // Save final history
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
  questionCount.textContent = "Question 1 of 15";
  progressFill.style.width = "0%";
  answerInput.value = "";  answerInput.disabled = false;
  answerInput.placeholder = "Type your answer here...";  feedbackBox.textContent = "Your feedback will appear here after you submit an answer.";
  clarityScore.textContent = "0/10";
  confidenceScore.textContent = "0/10";
  keywordScore.textContent = "0/10";
  audioPlayer.classList.add("hidden");
  audioPlayer.src = "";
  if (isRecording) stopRecording();
}

function startRecording() {
  try {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      feedbackBox.textContent = "❌ Speech recognition not supported. Use Chrome, Edge, or Safari.";
      return;
    }

    // Stop any existing recording
    if (window.speechRecognition) {
      try {
        window.speechRecognition.abort();
      } catch (e) {
        console.log("Error aborting previous recognition:", e);
      }
      window.speechRecognition = null;
    }

    const SpeechRecognitionAPI = window.webkitSpeechRecognition || window.SpeechRecognition;
    const recognition = new SpeechRecognitionAPI();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    let hasStarted = false;

    recognition.onstart = () => {
      hasStarted = true;
      isRecording = true;
      recordBtn.textContent = "⏹ Stop Recording";
      feedbackBox.textContent = "🎤 Listening... Speak your answer. Click Stop Recording when done.";
      console.log("Recording started");
    };

    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }
      if (answerInput) {
        answerInput.value = (finalTranscript + interimTranscript).trim();
      }
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      if (event.error === 'no-speech') {
        if (isRecording && hasStarted) {
          feedbackBox.textContent = "⏸️ Silence detected. Speak more or click Stop Recording.";
        }
      } else if (event.error === 'network') {
        feedbackBox.textContent = "❌ Network error. Check your connection.";
      } else if (event.error === 'permission-denied' || event.error === 'not-allowed') {
        feedbackBox.textContent = "❌ Microphone permission denied. Enable microphone in browser settings.";
        isRecording = false;
      } else {
        feedbackBox.textContent = `❌ Error: ${event.error}. Try again.`;
      }
    };

    recognition.onend = () => {
      console.log("Recognition ended. isRecording:", isRecording, "hasStarted:", hasStarted);
      if (isRecording) {
        if (!hasStarted) {
          // Failed to start due to permission or other error
          // Don't override the error message - it was already set in onerror
          recordBtn.textContent = "🎙 Start Recording";
          isRecording = false;
        } else {
          // Pause detected during recording, auto-restart
          feedbackBox.textContent = "⏸️ Restarting... Keep speaking or click Stop.";
          setTimeout(() => {
            if (isRecording && window.speechRecognition === recognition) {
              try {
                recognition.start();
              } catch (e) {
                console.log("Error restarting:", e);
                startRecording();
              }
            }
          }, 300);
        }
      } else {
        recordBtn.textContent = "🎙 Start Recording";
        if (!feedbackBox.textContent.includes("❌")) {
          // Only show "Recording stopped" if there's no error message
          feedbackBox.textContent = "✅ Recording stopped.";
        }
      }
    };

    console.log("Starting speech recognition...");
    recognition.start();
    window.speechRecognition = recognition;
  } catch (error) {
    feedbackBox.textContent = "❌ Error: " + error.message;
    console.error("Recording error:", error);
    isRecording = false;
  }
}

function stopRecording() {
  isRecording = false;
  if (window.speechRecognition) {
    window.speechRecognition.abort();
    window.speechRecognition = null;
  }
  recordBtn.textContent = "🎙 Start Recording";
  feedbackBox.textContent = "✅ Recording stopped.";
}

if (recordBtn) {
  recordBtn.addEventListener("click", () => {
    if (!isRecording) startRecording();
    else stopRecording();
  });
}

// Q&A Modal Functionality
let qaHistoryData = [];

function openQAModal() {
  qaModal.classList.remove("hidden");
  qaOverlay.classList.remove("hidden");
  qaInput.focus();
}

function closeQAModalFunc() {
  qaModal.classList.add("hidden");
  qaOverlay.classList.add("hidden");
  qaInput.value = "";
}

async function askAI(question) {
  if (!question.trim()) return;

  try {
    const response = await fetch("/api/ask", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ question }),
    });

    if (!response.ok) throw new Error("Failed to get AI response");

    const data = await response.json();
    const aiAnswer = data.answer;

    // Add to history
    qaHistoryData.push({ question, answer: aiAnswer });
    renderQAHistory();

    // Clear input
    qaInput.value = "";
  } catch (error) {
    console.error("Error asking AI:", error);
    qaHistory.innerHTML = `<div class="qa-item"><div class="qa-answer" style="color: var(--danger);">❌ Error: Could not get response from AI. Please try again.</div></div>`;
  }
}

function renderQAHistory() {
  if (qaHistoryData.length === 0) {
    qaHistory.innerHTML = `<div style="text-align: center; color: var(--muted); padding: 20px;">
      <p>Your Q&A history will appear here</p>
    </div>`;
    return;
  }

  qaHistory.innerHTML = qaHistoryData
    .slice()
    .reverse()
    .map(
      (item) => `
    <div class="qa-item">
      <div class="qa-question">Q: ${item.question}</div>
      <div class="qa-answer">${item.answer}</div>
    </div>
  `
    )
    .join("");
}

if (askAIBtn) askAIBtn.addEventListener("click", openQAModal);
if (closeQAModal) closeQAModal.addEventListener("click", closeQAModalFunc);
if (qaOverlay) qaOverlay.addEventListener("click", closeQAModalFunc);
if (askBtn)
  askBtn.addEventListener("click", () => {
    const question = qaInput.value.trim();
    if (question) askAI(question);
  });
if (qaInput)
  qaInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      const question = qaInput.value.trim();
      if (question) askAI(question);
    }
  });

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

const logoutBtn = document.getElementById("logoutBtn");

function handleLogout() {
  localStorage.removeItem("isLoggedIn");
  localStorage.removeItem("studentEmail");
  localStorage.removeItem("studentProfile");
  window.location.href = "signup.html";
}

if (logoutBtn) {
  logoutBtn.addEventListener("click", handleLogout);
}

window.addEventListener("load", () => {
  const profile = localStorage.getItem("studentProfile");
  const isLoggedIn = localStorage.getItem("isLoggedIn");

  if (isLoggedIn !== "true") {
    window.location.href = "signup.html";
    return;
  }

  if (!profile) {
    window.location.href = "profile.html";
    return;
  }

  const student = JSON.parse(profile);
  welcomeText.textContent = `Welcome, ${student.fullName || "Student"}!`;
  loadTheme();
  buildRoleButtons();
  buildCategoryButtons();
  renderButtons();
  renderHistory();
});