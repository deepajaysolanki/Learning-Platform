import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { gsap } from "gsap";

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
    const normalizedOptions = options.map((option) => normalizeText(option).toUpperCase());
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
        `http://localhost:3000/notebook/${id}/quiz`,
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
    if (quiz.length > 0) {
      gsap.fromTo(
        ".quiz-question-card",
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, stagger: 0.1, duration: 0.5 },
      );
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
      } else if (correctIndex < 0 && selected === normalizeText(q.answerOption)) {
        currentScore += 1;
      } else if (correctIndex >= 0 && selected === normalizeText(q.options?.[correctIndex])) {
        currentScore += 1;
      }
    });

    setScore(currentScore);
    setIsSubmitted(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div
      style={{
        padding: "40px",
        maxWidth: "800px",
        margin: "0 auto",
        fontFamily: "sans-serif",
      }}
    >
      <button
        onClick={() => navigate(-1)}
        style={{
          padding: "8px 16px",
          cursor: "pointer",
          borderRadius: "8px",
          border: "1px solid #cbd5e1",
          backgroundColor: "white",
        }}
      >
        ← Back to Notebook
      </button>

      {quiz.length === 0 && !loading && (
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <h2>Ready to test yourself?</h2>
          <button
            onClick={generateQuiz}
            style={{
              padding: "12px 24px",
              backgroundColor: "#6366f1",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            Start 10-Question Quiz
          </button>
        </div>
      )}

      {loading && (
        <div style={{ textAlign: "center", margin: "60px 0" }}>
          ⏳ Generating questions...
        </div>
      )}

      <div
        ref={quizContainerRef}
        style={{ display: "flex", flexDirection: "column", gap: "24px" }}
      >
        {quiz.map((q, index) => (
          <div
            key={index}
            className="quiz-question-card"
            style={{
              backgroundColor: "white",
              padding: "24px",
              borderRadius: "12px",
              border: "1px solid #e2e8f0",
            }}
          >
            <h3>
              {index + 1}. {q.question}
            </h3>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              {q.options.map((option, oIndex) => {
                const selectedValue = normalizeText(userAnswers[index]);
                const optionValue = normalizeText(option);
                const answerValue = normalizeText(q.answerOption);
                const correctIndex = getCorrectOptionIndex(q);
                const selectedIndex =
                  selectedValue.length === 1 && /[A-Z]/.test(selectedValue.toUpperCase())
                    ? selectedValue.toUpperCase().charCodeAt(0) - 65
                    : -1;
                const isSelected = selectedValue === optionValue || selectedIndex === oIndex;
                const isCorrect =
                  correctIndex >= 0
                    ? oIndex === correctIndex
                    : answerValue === optionValue || answerValue === String(oIndex + 1);

                let bgColor = "#f8fafc";
                let borderColor = "#cbd5e1";

                if (isSubmitted) {
                  if (isCorrect) {
                    bgColor = "#dcfce7";
                    borderColor = "#22c55e";
                  } else if (isSelected) {
                    bgColor = "#fee2e2";
                    borderColor = "#ef4444";
                  }
                } else if (isSelected) {
                  bgColor = "#eef2ff";
                  borderColor = "#6366f1";
                }

                return (
                  <button
                    key={oIndex}
                    onClick={() => handleOptionSelect(index, option)}
                    disabled={isSubmitted}
                    style={{
                      padding: "16px",
                      textAlign: "left",
                      backgroundColor: bgColor,
                      border: `2px solid ${borderColor}`,
                      borderRadius: "8px",
                      cursor: isSubmitted ? "default" : "pointer",
                    }}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {quiz.length > 0 && !isSubmitted && (
          <button
            onClick={calculateScore}
            style={{
              padding: "16px",
              backgroundColor: "#16a34a",
              color: "white",
              border: "none",
              borderRadius: "8px",
            }}
          >
            Submit Answers
          </button>
        )}

        {quiz.length > 0 && isSubmitted && (
          <div
            style={{
              padding: "20px",
              borderRadius: "12px",
              backgroundColor: "#f8fafc",
              border: "1px solid #e2e8f0",
            }}
          >
            <h3 style={{ marginTop: 0 }}>Quiz Result</h3>
            <p style={{ fontSize: "18px", fontWeight: 600 }}>
              You scored {score} out of {quiz.length}
            </p>
            <p style={{ color: "#475569" }}>
              {score === quiz.length
                ? "Perfect score!"
                : score > 0
                  ? "Nice work. Review the highlighted answers and try again."
                  : "No correct answers this time. Review the explanations and try again."}
            </p>
            <button
              onClick={generateQuiz}
              style={{
                padding: "10px 16px",
                backgroundColor: "#6366f1",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              Try Another Quiz
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
