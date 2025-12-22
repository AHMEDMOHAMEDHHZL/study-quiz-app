// script.js – Enhanced Quiz Logic
let questions = [];
let current = 0;
let score = 0;

const encouragingMessages = [
  { en: "Amazing! Keep it up!", ar: "ممتاز! استمر في التقدم!" },
  { en: "You're doing great!", ar: "أنت تبلي بلاءً حسناً!" },
  { en: "Spot on! You're a pro!", ar: "إصابة دقيقة! أنت محترف!" },
  { en: "Well done, superstar!", ar: "أحسنت صنعاً يا بطل!" },
  { en: "Fantastic! Your hard work is paying off!", ar: "رائع! تعبك يؤتي ثماره!" },
  { en: "Correct! You've got this!", ar: "صحيح! أنت تستحق النجاح!" }
];

async function loadData() {
  try {
    const res = await fetch('data.json');
    const json = await res.json();
    // Combine questions and shuffle them for better studying
    questions = shuffle([...json.trueFalse, ...json.multipleChoice]);
    
    document.getElementById('total').textContent = questions.length;
    document.getElementById('current-index').textContent = current;
    renderQuestion();
  } catch (error) {
    console.error("Failed to load quiz data:", error);
    document.getElementById('quiz-container').innerHTML = `<div class='error'>Failed to load questions. Please check if data.json exists.</div>`;
  }
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[array[j]]] = [array[array[j]], array[i]];
  }
  return array;
}

function renderQuestion() {
  const q = questions[current];
  const container = document.getElementById('quiz-container');
  const explanationBox = document.getElementById('explanation-box');
  
  container.innerHTML = '';
  explanationBox.classList.remove('show');
  explanationBox.innerHTML = '';
  
  // Update progress bar
  const progress = (current / questions.length) * 100;
  document.getElementById('progress-bar').style.width = `${progress}%`;
  document.getElementById('current-index').textContent = current + 1;

  const qContainer = document.createElement('div');
  qContainer.className = 'question-container';
  
  const qEn = document.createElement('div');
  qEn.className = 'question-en';
  qEn.textContent = q.text;
  
  const qAr = document.createElement('div');
  qAr.className = 'question-ar';
  qAr.textContent = q.translationAr;
  
  qContainer.appendChild(qEn);
  qContainer.appendChild(qAr);
  container.appendChild(qContainer);

  const optionsGrid = document.createElement('div');
  optionsGrid.className = 'options-grid';
  
  q.options.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    
    // Check if Arabic option exists
    const optAr = (q.translationOptionsAr && q.translationOptionsAr[i]) ? q.translationOptionsAr[i] : '';
    
    btn.innerHTML = `
      <span>${opt}</span>
      <span class="option-label-ar">${optAr}</span>
    `;
    
    btn.onclick = () => checkAnswer(i, btn);
    optionsGrid.appendChild(btn);
  });
  
  container.appendChild(optionsGrid);
}

function checkAnswer(selectedIdx, clickedBtn) {
  const q = questions[current];
  const correctIdx = q.answerIndex;
  const buttons = document.querySelectorAll('.option-btn');
  const explanationBox = document.getElementById('explanation-box');
  
  buttons.forEach(b => b.disabled = true);
  
  if (selectedIdx === correctIdx) {
    score++;
    document.getElementById('score').textContent = score;
    clickedBtn.classList.add('correct');
    showFeedback(true);
    triggerConfetti(false);
  } else {
    clickedBtn.classList.add('wrong');
    buttons[correctIdx].classList.add('correct');
    showFeedback(false);
  }

  // Show explanation
  if (q.explanation) {
    explanationBox.innerHTML = `
      <div class="explanation-title">Educational Insight / معلومة إضافية</div>
      <div class="explanation-text">${q.explanation}</div>
      <div class="explanation-ar">${q.explanationAr || ''}</div>
    `;
    explanationBox.classList.add('show');
  }

  setTimeout(() => {
    current++;
    if (current < questions.length) {
      renderQuestion();
    } else {
      finishQuiz();
    }
  }, 6000); // Increased time to read explanation
}

// Search Functionality
function performSearch(term) {
  if (!term || term.length < 2) return;
  
  term = term.toLowerCase();
  const foundIdx = questions.findIndex(q => 
    (q.text && q.text.toLowerCase().includes(term)) ||
    (q.translationAr && q.translationAr.toLowerCase().includes(term)) ||
    (q.explanation && q.explanation.toLowerCase().includes(term)) ||
    (q.explanationAr && q.explanationAr.toLowerCase().includes(term))
  );

  if (foundIdx !== -1) {
    current = foundIdx;
    renderQuestion();
    
    // Highlight search input briefly
    const searchInput = document.getElementById('quiz-search');
    searchInput.style.borderColor = '#00c3ff';
    setTimeout(() => searchInput.style.borderColor = 'rgba(255, 255, 255, 0.2)', 1000);
  }
}

const searchInput = document.getElementById('quiz-search');
if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        performSearch(e.target.value);
    });
    
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            performSearch(e.target.value);
            e.preventDefault(); // Prevent form submission if search input is inside a form
        }
    });
}

function showFeedback(isCorrect) {
  const feedbackEl = document.getElementById('feedback-message');
  if (isCorrect) {
    const msg = encouragingMessages[Math.floor(Math.random() * encouragingMessages.length)];
    feedbackEl.innerHTML = `${msg.en} <br> ${msg.ar}`;
    feedbackEl.style.color = 'var(--success)';
  } else {
    feedbackEl.innerHTML = "Keep going! You'll get it next time. <br> استمر! ستصيب في المرة القادمة.";
    feedbackEl.style.color = 'var(--danger)';
  }
  feedbackEl.classList.add('show');
  setTimeout(() => feedbackEl.classList.remove('show'), 1200);
}

function triggerConfetti(isFinal) {
  const duration = isFinal ? 5 * 1000 : 1;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

  function randomInRange(min, max) {
    return Math.random() * (max - min) + min;
  }

  const interval = setInterval(function() {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);
    // since particles fall down, start a bit higher than random
    confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
    confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
  }, 250);
}

function finishQuiz() {
  document.getElementById('progress-bar').style.width = '100%';
  const container = document.getElementById('quiz-container');
  const percent = Math.round((score / questions.length) * 100);
  
  let resultMsg = "";
  if (percent >= 90) resultMsg = "Legendary! You're ready for the exam. <br> أداء أسطوري! أنت مستعد للامتحان.";
  else if (percent >= 70) resultMsg = "Great work! Just a little more review. <br> عمل رائع! فقط القليل من المراجعة.";
  else resultMsg = "Keep practicing! You can do better. <br> استمر في التدريب! يمكنك فعل الأفضل.";

  container.innerHTML = `
    <div class="finish-card">
      <div style="font-size: 4rem; margin-bottom: 1rem;">🎓</div>
      <h2>Quiz Completed!</h2>
      <p style="font-size: 1.5rem; margin-bottom: 1rem;">Your Score: <strong>${score} / ${questions.length}</strong> (${percent}%)</p>
      <p style="color: var(--text-muted); font-size: 1.1rem;">${resultMsg}</p>
      <button class="restart-btn" onclick="location.reload()">Try Again / إعادة المحاولة</button>
    </div>
  `;
  
  if (percent >= 70) triggerConfetti(true);
}

loadData();
