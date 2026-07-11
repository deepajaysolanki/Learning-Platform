import React, { useState, useRef, useEffect } from "react";

export default function ChatPanel({ notebook }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Initialize chat
  useEffect(() => {
    if (notebook) {
      setMessages([
        { role: "ai", text: `Hi! I'm ready to help you study "${notebook.title}". Ask me anything!` }
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
      const response = await fetch(`http://localhost:3000/notebook/${notebook.id}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ message: userText })
      });

      const data = await response.json();
      
      if (response.ok) {
        setMessages((prev) => [...prev, { role: "ai", text: data.reply }]);
      } else {
        setMessages((prev) => [...prev, { role: "ai", text: "Error: Could not get an answer." }]);
      }
    } catch (error) {
      setMessages((prev) => [...prev, { role: "ai", text: "Network error occurred." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={{ margin: 0, fontSize: '16px', color: '#0f172a' }}>AI Tutor</h3>
      </div>

      <div style={styles.chatBox}>
        {messages.map((msg, i) => (
          <div key={i} style={msg.role === "ai" ? styles.aiMsgWrapper : styles.userMsgWrapper}>
            <div style={msg.role === "ai" ? styles.aiMsg : styles.userMsg}>
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div style={styles.aiMsgWrapper}>
            <div style={styles.aiMsg}>Thinking...</div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <form onSubmit={handleSend} style={styles.inputArea}>
        <input 
          type="text" 
          value={input} 
          onChange={(e) => setInput(e.target.value)} 
          placeholder="Ask a question..." 
          style={styles.input}
        />
        <button type="submit" disabled={isLoading || !input.trim()} style={styles.sendBtn}>
          Send
        </button>
      </form>
    </div>
  );
}

const styles = {
  container: { display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#ffffff' },
  header: { padding: '16px 20px', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc' },
  chatBox: { flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' },
  aiMsgWrapper: { display: 'flex', justifyContent: 'flex-start' },
  userMsgWrapper: { display: 'flex', justifyContent: 'flex-end' },
  aiMsg: { backgroundColor: '#f1f5f9', padding: '12px 16px', borderRadius: '12px 12px 12px 4px', maxWidth: '85%', color: '#334155', fontSize: '14px', lineHeight: '1.5' },
  userMsg: { backgroundColor: '#6366f1', color: '#ffffff', padding: '12px 16px', borderRadius: '12px 12px 4px 12px', maxWidth: '85%', fontSize: '14px', lineHeight: '1.5' },
  inputArea: { display: 'flex', padding: '16px', borderTop: '1px solid #e2e8f0', backgroundColor: '#ffffff', gap: '10px' },
  input: { flex: 1, padding: '10px 16px', borderRadius: '24px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px' },
  sendBtn: { padding: '8px 16px', backgroundColor: '#6366f1', color: 'white', border: 'none', borderRadius: '24px', cursor: 'pointer', fontWeight: '600' }
};