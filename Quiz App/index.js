const startScreen = document.querySelector('.start-screen');
    const quizContainer = document.querySelector('.quiz-container');
    const scoreContainer = document.querySelector('.score-container');
    const questionEl = document.getElementById("question");
    const answerButtons = document.getElementById("answer-buttons");
    const nextBtn = document.getElementById("next-btn");
    const finalScoreEl = document.getElementById("final-score");
    const highScoreEl = document.getElementById("high-score");
    const progressBar = document.getElementById("progress");
    const timerDisplay = document.getElementById("time");
    const timerContainer = document.getElementById("timer");

    let questions = [];
    let currentQuestionIndex = 0;
    let score = 0;
    let timer;
    let timeLeft = 15;

    document.getElementById('start-btn').addEventListener('click', startQuiz);
    nextBtn.addEventListener("click", () => {
      clearInterval(timer); 
      currentQuestionIndex++;
      if (currentQuestionIndex < questions.length) {
        showQuestion();
      } else {
        showScore();
      }
    });

    function startQuiz() {
      startScreen.style.display = 'none';
      quizContainer.style.display = 'block';
      score = 0;
      currentQuestionIndex = 0;
      fetchQuestions();
    }

    function fetchQuestions() {
      fetch("https://opentdb.com/api.php?amount=10&category=18&difficulty=medium&type=multiple")
        .then(res => res.json())
        .then(data => {
          questions = data.results.map(q => ({
            question: decodeHTMLEntities(q.question),
            answers: shuffle([...q.incorrect_answers.map(a => ({ text: decodeHTMLEntities(a), correct: false })), { text: decodeHTMLEntities(q.correct_answer), correct: true }])
          }));
          showQuestion();
        });
    }

    function showQuestion() {
      resetState();
      startTimer();
      let currentQuestion = questions[currentQuestionIndex];
      questionEl.innerText = currentQuestion.question;
      currentQuestion.answers.forEach(answer => {
        const button = document.createElement("button");
        button.innerText = answer.text;
        button.classList.add("btn");
        if (answer.correct) {
          button.dataset.correct = true;
        }
        button.addEventListener("click", selectAnswer);
        answerButtons.appendChild(button);
      });
      updateProgressBar();
    }

    function resetState() {
      nextBtn.style.display = "none";
      while (answerButtons.firstChild) {
        answerButtons.removeChild(answerButtons.firstChild);
      }
    }

    function selectAnswer(e) {
      const selectedBtn = e.target;
      const isCorrect = selectedBtn.dataset.correct === "true";
      Array.from(answerButtons.children).forEach(button => {
        button.disabled = true;
        if (button.dataset.correct === "true") {
          button.classList.add("correct");
        } else {
          button.classList.add("wrong");
        }
      });
      if (isCorrect) score++;
      clearInterval(timer);
      nextBtn.style.display = "block";
    }

    function showScore() {
      quizContainer.style.display = "none";
      scoreContainer.style.display = "block";
      finalScoreEl.innerText = `You scored ${score} out of ${questions.length}`;
      const highScore = Math.max(score, localStorage.getItem("highScore") || 0);
      localStorage.setItem("highScore", highScore);
      highScoreEl.innerText = highScore;
    }

    function updateProgressBar() {
      const progressPercent = ((currentQuestionIndex + 1) / questions.length) * 100;
      progressBar.style.width = progressPercent + "%";
    }

    function startTimer() {
      timeLeft = 15;
      timerDisplay.innerText = timeLeft;
      timer = setInterval(() => {
        timeLeft--;
        timerDisplay.innerText = timeLeft;
        if (timeLeft === 0) {
          clearInterval(timer);
          selectAnswer({ target: {} });
        }
      }, 1000);
    }

    function shuffle(array) {
      return array.sort(() => Math.random() - 0.5);
    }

    function decodeHTMLEntities(text) {
      var txt = document.createElement("textarea");
      txt.innerHTML = text;
      return txt.value;
    }