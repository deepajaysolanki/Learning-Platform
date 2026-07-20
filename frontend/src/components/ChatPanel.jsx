import React, { useState, useRef, useEffect } from "react";
import "../styles/ChatPanel.css"; // 🟢 Import external CSS file

export default function ChatPanel({ notebook }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Initialize chat
  useEffect(() => {
    if (notebook) {
      setMessages([
        {
          role: "ai",
          text: `Hi! I'm ready to help you study "${notebook.title}". Ask me anything!`,
        },
      ]);
      setInput("");
    }
  }, [notebook]);

  // Auto-scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input;
    setMessages((prev) => [...prev, { role: "user", text: userText }]);
    setInput("");
    setIsLoading(true);

    try {
      const token = localStorage.getItem("studyAppToken");
      const response = await fetch(
        `https://vibestudy-backend-o61q.onrender.com/notebook/${notebook.id}/chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ message: userText }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessages((prev) => [...prev, { role: "ai", text: data.reply }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "ai", text: "Error: Could not get an answer." },
        ]);
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "Network error occurred." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="cp-container">
      <div className="cp-header">
        <h3 className="cp-header-title">AI Tutor</h3>
      </div>

      <div className="cp-chat-box">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`cp-msg-wrapper ${msg.role === "ai" ? "ai" : "user"}`}
          >
            <div
              className={`cp-msg-bubble ${msg.role === "ai" ? "ai" : "user"}`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="cp-msg-wrapper ai">
            <div className="cp-msg-bubble ai cp-thinking-text">Thinking...</div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <form onSubmit={handleSend} className="cp-input-area">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question..."
          className="cp-input"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="cp-send-btn"
        >
          Send
        </button>
      </form>
    </div>
  );
}