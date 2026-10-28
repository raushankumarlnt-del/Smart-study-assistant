/**
 * SmartStudy AI · Academic Copilot
 * B.Tech 1st Year Emerging Technology Lab
 */

// ==========================================
// 1. TAB ROUTING & NAVIGATION
// ==========================================
const tabButtons = document.querySelectorAll('.tab-btn');
const tabPanels = document.querySelectorAll('.tab-panel');

tabButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    tabButtons.forEach(b => b.classList.remove('active'));
    tabPanels.forEach(p => p.classList.remove('active'));

    btn.classList.add('active');
    const tabId = btn.getAttribute('data-tab');
    document.getElementById(tabId).classList.add('active');
  });
});

// ==========================================
// 2. NOTES SUMMARIZER MODULE
// ==========================================
const notesInput = document.getElementById('notes-input');
const inputStats = document.getElementById('input-stats');
const summarizeBtn = document.getElementById('summarize-btn');
const summaryOutput = document.getElementById('summary-output');
const loadSampleBtn = document.getElementById('load-sample-btn');
const copySummaryBtn = document.getElementById('copy-summary-btn');
const sendToQuizBtn = document.getElementById('send-to-quiz-btn');
const summaryLength = document.getElementById('summary-length');
const summaryFormat = document.getElementById('summary-format');

const reducedStat = document.getElementById('reduced-stat');
const readingTimeStat = document.getElementById('reading-time-stat');

// Live Word & Char Counter
notesInput.addEventListener('input', () => {
  const text = notesInput.value.trim();
  const words = text ? text.split(/\s+/).length : 0;
  const chars = text.length;
  inputStats.textContent = `${words} words · ${chars} chars`;
});

// Sample Emerging Tech Notes
const SAMPLE_NOTES = `Artificial Intelligence (AI) and Machine Learning (ML) are transforming modern computing. Supervised learning algorithms rely on labeled datasets to train predictive models, whereas unsupervised learning seeks underlying patterns without preexisting tags. Deep learning uses multi-layered Artificial Neural Networks inspired by the biological human brain to solve complex non-linear problems. In contrast, Edge Computing processes data near the source of generation rather than relying solely on centralized cloud data centers, drastically decreasing network latency. Cloud computing offers high scalability, fault tolerance, and shared resources on demand. When implementing these architectures in software, memory efficiency and algorithmic time complexity (like Big-O notation) remain fundamental engineering constraints.`;

loadSampleBtn.addEventListener('click', () => {
  notesInput.value = SAMPLE_NOTES;
  notesInput.dispatchEvent(new Event('input'));
});

// Extractive NLP Summarization Engine (Frequency & Keyword Weighting)
function generateSmartSummary(text, density = 'medium', format = 'bullets') {
  if (!text || text.trim().length === 0) return null;

  // Split into individual sentences
  const sentences = text
    .replace(/([.?!])\s*(?=[A-Z])/g, "$1|")
    .split("|")
    .map(s => s.trim())
    .filter(s => s.length > 15);

  if (sentences.length <= 2) return sentences;

  // Standard Stop Words Removal
  const stopWords = new Set([
    "the", "is", "at", "which", "on", "and", "a", "an", "in", "to", "of", "for", 
    "with", "as", "by", "that", "this", "it", "are", "from", "be", "or", "was"
  ]);

  // Compute Word Frequencies
  const wordFreq = {};
  const words = text.toLowerCase().match(/\b[a-z]{3,}\b/g) || [];

  words.forEach(word => {
    if (!stopWords.has(word)) {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    }
  });

  // Sentence Scoring: Term Frequency + Keyword Boosters
  const highValueKeywords = ["important", "neural", "learning", "latency", "algorithm", "cloud", "model", "efficiency"];
  const scoredSentences = sentences.map((sentence, index) => {
    const sWords = sentence.toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
    let score = 0;

    sWords.forEach(w => {
      if (wordFreq[w]) score += wordFreq[w];
      if (highValueKeywords.includes(w)) score += 3;
    });

    // Position bonus for opening sentences
    if (index === 0) score *= 1.3;

    return { sentence, score, index };
  });

  // Calculate sentence target count based on density
  let ratio = 0.5;
  if (density === 'short') ratio = 0.3;
  if (density === 'detailed') ratio = 0.7;

  let targetCount = Math.max(2, Math.round(sentences.length * ratio));

  // Sort by highest score, select top, then re-sort to maintain chronological flow
  const selected = scoredSentences
    .sort((a, b) => b.score - a.score)
    .slice(0, targetCount)
    .sort((a, b) => a.index - b.index)
    .map(item => item.sentence);

  return selected;
}

// Handle Summarize Action
summarizeBtn.addEventListener('click', () => {
  const text = notesInput.value.trim();
  if (!text) {
    alert("Please enter or paste notes first!");
    return;
  }

  const density = summaryLength.value;
  const format = summaryFormat.value;
  const summarySentences = generateSmartSummary(text, density, format);

  if (!summarySentences || summarySentences.length === 0) {
    summaryOutput.innerHTML = `<p class="placeholder">Text too brief to summarize meaningfully.</p>`;
    return;
  }

  // Render output
  summaryOutput.classList.remove('placeholder');
  if (format === 'bullets') {
    summaryOutput.innerHTML = summarySentences
      .map(s => `<div class="summary-bullet">${s}</div>`)
      .join('');
  } else {
    summaryOutput.innerHTML = `<p>${summarySentences.join(' ')}</p>`;
  }

  // Compute Metrics
  const originalWords = text.split(/\s+/).length;
  const summaryWords = summarySentences.join(' ').split(/\s+/).length;
  const reductionPercent = Math.max(5, Math.round(((originalWords - summaryWords) / originalWords) * 100));
  const readTimeMin = Math.ceil(summaryWords / 180);

  reducedStat.textContent = `${reductionPercent}%`;
  readingTimeStat.textContent = `${readTimeMin} min`;
});

// Copy Summary
copySummaryBtn.addEventListener('click', () => {
  const content = summaryOutput.innerText;
  if (!content || summaryOutput.classList.contains('placeholder')) {
    alert("Nothing to copy yet!");
    return;
  }
  navigator.clipboard.writeText(content).then(() => {
    copySummaryBtn.textContent = "✓ Copied!";
    setTimeout(() => copySummaryBtn.textContent = "📋 Copy", 2000);
  });
});

// Bridge: Send to Quiz Tab
sendToQuizBtn.addEventListener('click', () => {
  const text = notesInput.value.trim();
  if (!text) {
    alert("Please enter notes first!");
    return;
  }
  // Switch to quiz tab
  document.querySelector('.tab-btn[data-tab="quiz"]').click();
  generateQuizFromText(text);
});


// ==========================================
// 3. QUIZ GENERATOR ENGINE
// ==========================================
const quizContainer = document.getElementById('quiz-container');
const quizMeta = document.getElementById('quiz-meta');
const currentScoreEl = document.getElementById('current-score');
const totalQuestionsEl = document.getElementById('total-questions');
const quizProgressBar = document.getElementById('quiz-progress-bar');
const quizResultBanner = document.getElementById('quiz-result');
const quizFinalText = document.getElementById('quiz-final-text');
const retryQuizBtn = document.getElementById('retry-quiz-btn');
const loadSampleQuizBtn = document.getElementById('load-sample-quiz-btn');
const buildQuizBtn = document.getElementById('build-quiz-btn');

let currentQuizQuestions = [];
let userScore = 0;
let answeredCount = 0;

// Curated Fallback Emerging Tech Quiz (B.Tech 1st Year Syllabus)
const SAMPLE_ET_QUIZ = [
  {
    question: "Which computing paradigm processes workloads near the local data source rather than over centralized clouds?",
    options: ["Edge Computing", "Mainframe Computing", "Quantum Annealing", "Batch Processing"],
    correctIndex: 0,
    explanation: "Edge Computing places compute nodes geographically closer to devices to eliminate network round-trip latency."
  },
  {
    question: "In Machine Learning, what type of learning algorithm relies completely on labeled input-output ground truth?",
    options: ["Unsupervised Learning", "Supervised Learning", "Reinforcement Learning", "Heuristic Search"],
    correctIndex: 1,
    explanation: "Supervised learning algorithms map inputs to labeled targets via iterative cost function optimization."
  },
  {
    question: "Artificial Neural Networks (ANNs) are conceptually modeled after which biological system?",
    options: ["Human Respiratory System", "DNA Double Helix", "Human Brain & Synaptic Pathways", "Silicon Semiconductors"],
    correctIndex: 2,
    explanation: "ANNs draw structural inspiration from biological neurons firing electrical impulses through synapses."
  },
  {
    question: "Which metric describes algorithmic scaling performance with respect to input memory and runtime?",
    options: ["Ohm's Constant", "Big-O Notation", "Baud Rate", "Nyquist Limit"],
    correctIndex: 1,
    explanation: "Big-O notation specifies asymptotic upper-bounds for time and auxiliary space complexity in computer science."
  }
];

// Heuristic Quiz Extraction from Raw Text
function generateQuizFromText(rawText) {
  const sentences = rawText
    .replace(/([.?!])\s*(?=[A-Z])/g, "$1|")
    .split("|")
    .map(s => s.trim())
    .filter(s => s.length > 25);

  if (sentences.length < 3) {
    renderQuiz(SAMPLE_ET_QUIZ);
    return;
  }

  // Create cloze/concept questions dynamically
  const generatedQuestions = [];
  const keyTerms = ["Machine Learning", "Neural Networks", "Edge Computing", "Cloud", "Latency", "Algorithm", "Complexity"];

  sentences.slice(0, 4).forEach((sentence, idx) => {
    // Pick candidate word to turn into blank
    const words = sentence.split(" ");
    let targetWord = words.find(w => w.length > 6 && !w.includes(",")) || words[Math.floor(words.length / 2)];
    const cleanWord = targetWord.replace(/[^a-zA-Z]/g, "");

    const blankedSentence = sentence.replace(cleanWord, "__________");

    generatedQuestions.push({
      question: `Fill in the blank: "${blankedSentence}"`,
      options: [
        cleanWord,
        `De-centralized ${cleanWord}`,
        "Dynamic Allocation",
        "Linear Regression"
      ].sort(() => Math.random() - 0.5),
      correctIndex: 0, // will be located dynamically below
      answerWord: cleanWord,
      explanation: `Original context: "${sentence}"`
    });
  });

  // Fix correct indices after shuffling options
  generatedQuestions.forEach(q => {
    q.correctIndex = q.options.indexOf(q.answerWord);
  });

  renderQuiz(generatedQuestions);
}

function renderQuiz(questions) {
  currentQuizQuestions = questions;
  userScore = 0;
  answeredCount = 0;

  quizResultBanner.classList.add('hidden');
  quizMeta.classList.remove('hidden');
  currentScoreEl.textContent = userScore;
  totalQuestionsEl.textContent = questions.length;
  quizProgressBar.style.width = '0%';

  quizContainer.innerHTML = questions.map((q, qIndex) => `
    <div class="question-card" id="q-card-${qIndex}">
      <div class="question-text"><b>Q${qIndex + 1}.</b> ${q.question}</div>
      <div class="options-grid">
        ${q.options.map((opt, optIndex) => `
          <button class="option-btn" onclick="handleOptionSelect(${qIndex},${optIndex})">
            <span>${String.fromCharCode(65 + optIndex)}.</span>${opt}
          </button>
        `).join('')}
      </div>
      <div id="explanation-${qIndex}" class="explanation-box" style="display: none;">
        💡 <b>Explanation:</b> ${q.explanation}
      </div>
    </div>
  `).join('');
}

// Global window hook for inline onclick events
window.handleOptionSelect = function(qIndex, selectedOptionIndex) {
  const question = currentQuizQuestions[qIndex];
  const card = document.getElementById(`q-card-${qIndex}`);
  const buttons = card.querySelectorAll('.option-btn');
  const explanationBox = document.getElementById(`explanation-${qIndex}`);

  // Disable all options in this card
  buttons.forEach(btn => btn.disabled = true);

  // Check correctness
  if (selectedOptionIndex === question.correctIndex) {
    buttons[selectedOptionIndex].classList.add('correct');
    userScore++;
  } else {
    buttons[selectedOptionIndex].classList.add('wrong');
    buttons[question.correctIndex].classList.add('correct');
  }

  explanationBox.style.display = 'block';

  answeredCount++;
  currentScoreEl.textContent = userScore;
  quizProgressBar.style.width = `${(answeredCount / currentQuizQuestions.length) * 100}%`;

  if (answeredCount === currentQuizQuestions.length) {
    showQuizCompletion();
  }
};

function showQuizCompletion() {
  quizResultBanner.classList.remove('hidden');
  const percent = Math.round((userScore / currentQuizQuestions.length) * 100);
  
  if (percent >= 75) {
    quizFinalText.textContent = `Excellent! ${userScore}/${currentQuizQuestions.length} (${percent}%). Exam Ready! 🔥`;
  } else {
    quizFinalText.textContent = `Scored ${userScore}/${currentQuizQuestions.length} (${percent}%). Revise notes and try again! 📚`;
  }
}

retryQuizBtn.addEventListener('click', () => renderQuiz(currentQuizQuestions));
loadSampleQuizBtn.addEventListener('click', () => renderQuiz(SAMPLE_ET_QUIZ));
buildQuizBtn.addEventListener('click', () => {
  const text = notesInput.value.trim();
  if (!text) {
    alert("Please paste your lecture notes in the Summarizer tab first!");
    return;
  }
  generateQuizFromText(text);
});


// ==========================================
// 4. STUDY PLANNER (LOCALSTORAGE BACKED)
// ==========================================
const taskForm = document.getElementById('task-form');
const taskTitle = document.getElementById('task-title');
const taskSubject = document.getElementById('task-subject');
const taskPriority = document.getElementById('task-priority');
const taskDeadline = document.getElementById('task-deadline');
const taskList = document.getElementById('task-list');
const completionPercentage = document.getElementById('completion-percentage');
const tasksProgressBar = document.getElementById('tasks-progress-bar');
const filterPills = document.querySelectorAll('.filter-pill');

let tasks = JSON.parse(localStorage.getItem('smartstudy_tasks')) || [
  {
    id: 1,
    title: "Revise Unit 1: AI & Neural Nets",
    subject: "Emerging Tech",
    priority: "high",
    deadline: "2026-11-05",
    completed: false
  },
  {
    id: 2,
    title: "C Pointer Arithmetic & Memory Allocation",
    subject: "Programming Lab",
    priority: "medium",
    deadline: "2026-11-10",
    completed: true
  }
];

let activeFilter = 'all';

function saveAndRenderTasks() {
  localStorage.setItem('smartstudy_tasks', JSON.stringify(tasks));
  renderTasks();
}

function renderTasks() {
  taskList.innerHTML = '';

  const filteredTasks = tasks.filter(t => {
    if (activeFilter === 'pending') return !t.completed;
    if (activeFilter === 'done') return t.completed;
    return true;
  });

  if (filteredTasks.length === 0) {
    taskList.innerHTML = `<li style="text-align: center; color: var(--text-dim); padding: 1.5rem 0;">No tasks found in this view.</li>`;
  } else {
    filteredTasks.forEach(task => {
      const li = document.createElement('li');
      li.className = `task-item ${task.completed ? 'completed' : ''}`;
      
      const priorityEmoji = task.priority === 'high' ? '🔴' : task.priority === 'medium' ? '🟡' : '🟢';

      li.innerHTML = `
        <div class="task-left">
          <input type="checkbox" class="task-check" ${task.completed ? 'checked' : ''} onchange="toggleTask(${task.id})">
          <div class="task-text">
            <h4>${task.title}</h4>
            <div class="task-meta">
              <span>📚 ${task.subject}</span>
              <span>${priorityEmoji} ${task.priority.toUpperCase()}</span>
              <span>📅 ${task.deadline}</span>
            </div>
          </div>
        </div>
        <button class="delete-task-btn" title="Delete Task" onclick="deleteTask(${task.id})">&times;</button>
      `;
      taskList.appendChild(li);
    });
  }

  // Update progress tracking
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

  completionPercentage.textContent = `${percent}%`;
  tasksProgressBar.style.width = `${percent}%`;
}

// Add New Task
taskForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const newTask = {
    id: Date.now(),
    title: taskTitle.value.trim(),
    subject: taskSubject.value.trim(),
    priority: taskPriority.value,
    deadline: taskDeadline.value,
    completed: false
  };

  tasks.unshift(newTask);
  saveAndRenderTasks();
  taskForm.reset();
});

// Window helper functions for task events
window.toggleTask = function(id) {
  tasks = tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
  saveAndRenderTasks();
};

window.deleteTask = function(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveAndRenderTasks();
};

// Filter Buttons
filterPills.forEach(pill => {
  pill.addEventListener('click', () => {
    filterPills.forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
    activeFilter = pill.getAttribute('data-filter');
    renderTasks();
  });
});

// Initial boot
renderTasks();
