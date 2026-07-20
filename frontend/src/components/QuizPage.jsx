import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { Helmet } from "react-helmet-async";
import "../styles/QuizPage.css"; // 🟢 Import external stylesheet

// Turn off null target warnings safely
gsap.config({ nullTargetWarn: false });

export default function QuizPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const quizContainerRef = useRef(null);

  const [quiz, setQuiz] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userAnswers, setUserAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const normalizeText = (value) => String(value ?? "").trim();

  const getCorrectOptionIndex = (question) => {
    const options = Array.isArray(question?.options) ? question.options : [];
    const normalizedOptions = options.map((option) =>
      normalizeText(option).toUpperCase(),
    );
    const answerValue = normalizeText(question?.answerOption).toUpperCase();

    if (answerValue.length === 1 && /[A-Z]/.test(answerValue)) {
      const index = answerValue.charCodeAt(0) - 65;
      return index >= 0 && index < normalizedOptions.length ? index : -1;
    }

    const directMatch = normalizedOptions.indexOf(answerValue);
    if (directMatch >= 0) return directMatch;

    return -1;
  };

  const generateQuiz = async () => {
    setLoading(true);
    setQuiz([]);
    setIsSubmitted(false);
    setUserAnswers({});
    setScore(0);

    try {
      const response = await fetch(
        `https://vibestudy-backend-o61q.onrender.com/notebook/${id}/quiz`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ notebookId: id }),
        },
      );
      const data = await response.json();
      if (Array.isArray(data.quiz) && data.quiz.length > 0) {
        setQuiz(data.quiz);
      } else {
        alert(data.error || "Could not parse quiz. Try again!");
      }
    } catch (error) {
      console.error(error);
      alert("Failed to generate quiz.");
    } finally {
      setLoading(false);
    }
  };

  // GSAP Animation for smooth entry
  useEffect(() => {
    if (quiz.length > 0 && quizContainerRef.current) {
      const cards = quizContainerRef.current.querySelectorAll(
        ".quiz-question-card",
      );
      if (cards.length > 0) {
        gsap.fromTo(
          cards,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, stagger: 0.1, duration: 0.5, ease: "power2.out" },
        );
      }
    }
  }, [quiz]);

  const handleOptionSelect = (qIndex, option) => {
    if (isSubmitted) return;
    setUserAnswers({ ...userAnswers, [qIndex]: option });
  };

  const calculateScore = () => {
    let currentScore = 0;

    quiz.forEach((q, index) => {
      const selected = normalizeText(userAnswers[index]);
      const correctIndex = getCorrectOptionIndex(q);
      const selectedIndex =
        selected.length === 1 && /[A-Z]/.test(selected.toUpperCase())
          ? selected.toUpperCase().charCodeAt(0) - 65
          : -1;

      if (correctIndex >= 0 && selectedIndex === correctIndex) {
        currentScore += 1;
      } else if (
        correctIndex < 0 &&
        selected === normalizeText(q.answerOption)
      ) {
        currentScore += 1;
      } else if (
        correctIndex >= 0 &&
        selected === normalizeText(q.options?.[correctIndex])
      ) {
        currentScore += 1;
      }
    });

    setScore(currentScore);
    setIsSubmitted(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <Helmet>
        <title>VibeStudy - Play Quiz</title>
        <meta charSet="utf-8" />
      </Helmet>
      <div className="quiz-page-wrapper">
        <div className="quiz-container">
          <div className="quiz-top-bar">
            <button className="btn-quiz-back" onClick={() => navigate(-1)}>
              ← Back to Notebook
            </button>
          </div>

          {/* HERO WELCOME CARD */}
          {quiz.length === 0 && !loading && (
            <div className="quiz-welcome-card">
              <div className="quiz-welcome-icon">🎯</div>
              <h2>Ready to test your knowledge?</h2>
              <p>
                Generate a customized 10-question multiple-choice quiz based on
                your notebook contents.
              </p>
              <button className="btn-start-quiz" onClick={generateQuiz}>
                Start Quiz
              </button>
            </div>
          )}

          {/* LOADING STATE */}
          {loading && (
            <div className="quiz-loading-box">
              <div className="loading-spinner-text">
                ⏳ Generating tailored questions...
              </div>
            </div>
          )}

          {/* RESULTS BANNER */}
          {quiz.length > 0 && isSubmitted && (
            <div className="quiz-results-card">
              <h3 className="results-header-text">Quiz Complete!</h3>
              <div className="score-display-box">
                <span className="score-num">{score}</span>
                <span className="score-total">/ {quiz.length}</span>
              </div>
              <p className="results-feedback">
                {score === quiz.length
                  ? "🎉 Perfect score! Mastered!"
                  : score > 0
                    ? "👍 Good attempt! Review highlighted answers below."
                    : "📚 Review the material and give it another shot!"}
              </p>
              <button className="btn-start-quiz" onClick={generateQuiz}>
                Try Another Quiz
              </button>
            </div>
          )}

          {/* QUESTIONS LIST */}
          <div ref={quizContainerRef} className="questions-list">
            {quiz.map((q, index) => (
              <div key={index} className="quiz-question-card">
                <div className="question-header">
                  <span className="q-number-badge">Q{index + 1}</span>
                  <h3 className="question-text">{q.question}</h3>
                </div>

                <div className="options-grid">
                  {q.options.map((option, oIndex) => {
                    const selectedValue = normalizeText(userAnswers[index]);
                    const optionValue = normalizeText(option);
                    const answerValue = normalizeText(q.answerOption);
                    const correctIndex = getCorrectOptionIndex(q);
                    const selectedIndex =
                      selectedValue.length === 1 &&
                      /[A-Z]/.test(selectedValue.toUpperCase())
                        ? selectedValue.toUpperCase().charCodeAt(0) - 65
                        : -1;
                    const isSelected =
                      selectedValue === optionValue || selectedIndex === oIndex;
                    const isCorrect =
                      correctIndex >= 0
                        ? oIndex === correctIndex
                        : answerValue === optionValue ||
                          answerValue === String(oIndex + 1);

                    let optionClass = "option-btn";
                    if (isSubmitted) {
                      if (isCorrect) optionClass += " correct";
                      else if (isSelected) optionClass += " wrong";
                    } else if (isSelected) {
                      optionClass += " selected";
                    }

                    const optionLetter = String.fromCharCode(65 + oIndex);

                    return (
                      <button
                        key={oIndex}
                        className={optionClass}
                        onClick={() => handleOptionSelect(index, option)}
                        disabled={isSubmitted}
                      >
                        <span className="option-letter-badge">
                          {optionLetter}
                        </span>
                        <span>{option}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {quiz.length > 0 && !isSubmitted && (
              <button className="btn-submit-quiz" onClick={calculateScore}>
                Submit Answers
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
