import React, { useState, useRef, useEffect, memo } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import ReactMarkdown from "react-markdown";
import { renderAsync } from "docx-preview";

// ============================================================================
// 1. LOCAL DOCX VIEWER COMPONENT
// ============================================================================
const LocalDocxViewer = memo(({ fileUrl }) => {
  const viewerRef = useRef(null);

  useEffect(() => {
    if (!fileUrl || !viewerRef.current) return;

    fetch(fileUrl)
      .then((res) => {
        if (!res.ok) throw new Error("Could not fetch local document resource file.");
        return res.blob();
      })
      .then((blob) => {
        if (viewerRef.current) {
          viewerRef.current.innerHTML = "";
          renderAsync(blob, viewerRef.current, null, {
            inWrapper: true,
            className: "docx-page",
            ignoreWidth: false,
          });
        }
      })
      .catch((err) => {
        console.error("Error parsing local docx binary container:", err);
      });
  }, [fileUrl]);

  return (
    <div
      ref={viewerRef}
      style={{
        height: "100%",
        width: "100%",
        overflowY: "auto",
        backgroundColor: "#646464",
        padding: "30px 20px",
        boxSizing: "border-box",
      }}
    />
  );
});

// ============================================================================
// 2. POWERPOINT PRESENTATION SLIDE CARDS (Fixed Single-Word Blank Slide Bug)
// ============================================================================
const PresentationSlideDeck = memo(({ rawText }) => {
  const lines = (rawText || "").split("\n").map((l) => l.trim()).filter(Boolean);
  const slides = [];
  let currentSlide = { title: "", points: [] };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const isExplicitSlideHeader = /^Slide\s*\d+/i.test(line);

    if (isExplicitSlideHeader) {
      if (currentSlide.title || currentSlide.points.length > 0) {
        slides.push(currentSlide);
      }
      currentSlide = { title: line, points: [] };
    } else if (!currentSlide.title) {
      currentSlide.title = line;
    } else {
      currentSlide.points.push(line.replace(/^[•\-\*]\s*/, ""));
      // Group bullet points into readable slide chunks (max 5 points per card)
      if (currentSlide.points.length >= 5) {
        slides.push(currentSlide);
        currentSlide = { title: "", points: [] };
      }
    }
  }

  if (currentSlide.title || currentSlide.points.length > 0) {
    slides.push(currentSlide);
  }

  const finalSlides = slides.length > 0 ? slides : [{ title: "Presentation Content", points: lines }];

  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        overflowY: "auto",
        backgroundColor: "#2e323b",
        padding: "40px 20px",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "40px",
      }}
    >
      {finalSlides.map((slide, sIdx) => (
        <div
          key={sIdx}
          style={{
            width: "100%",
            maxWidth: "850px",
            minHeight: "420px",
            backgroundColor: "#ffffff",
            borderRadius: "8px",
            boxShadow: "0 20px 35px rgba(0, 0, 0, 0.4)",
            padding: "40px 50px",
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            position: "relative",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "6px",
              backgroundColor: "#2563eb",
              borderRadius: "8px 8px 0 0",
            }}
          />

          <div>
            {slide.title && (
              <h2
                style={{
                  fontSize: "22px",
                  fontWeight: "700",
                  color: "#0f172a",
                  margin: "0 0 20px 0",
                  paddingBottom: "12px",
                  borderBottom: "2px solid #f1f5f9",
                  fontFamily: "'Segoe UI', Roboto, sans-serif",
                }}
              >
                {slide.title}
              </h2>
            )}

            <ul style={{ margin: 0, paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
              {slide.points.map((pt, pIdx) => (
                <li
                  key={pIdx}
                  style={{
                    fontSize: "15px",
                    color: "#334155",
                    lineHeight: "1.6",
                    fontFamily: "'Segoe UI', Roboto, sans-serif",
                  }}
                >
                  {pt}
                </li>
              ))}
            </ul>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              paddingTop: "16px",
              marginTop: "20px",
              borderTop: "1px solid #f8fafc",
              color: "#94a3b8",
              fontSize: "12px",
              fontWeight: "600",
            }}
          >
            <span>SmartStudy Presentation Viewer</span>
            <span>Slide {sIdx + 1} of {finalSlides.length}</span>
          </div>
        </div>
      ))}
    </div>
  );
});

// ============================================================================
// 3. PAPER DOCUMENT CANVAS RENDERER (.txt) - FULL-WIDTH CLEAN READER
// ============================================================================
const PaperTextViewer = memo(({ rawText }) => {
  const content = rawText || "[No text found]";

  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        overflowY: "auto",
        backgroundColor: "#ffffff", // Pure white full-screen background
        padding: "40px 60px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto", // Center text column gracefully
          fontFamily: "'Inter', system-ui, -apple-system, sans-serif", // Clean modern sans-serif font
          color: "#0f172a",
          lineHeight: "1.8",
          fontSize: "15px",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
      >
        {content}
      </div>
    </div>
  );
});
// ============================================================================
// 4. ISOLATED MASTER DOCUMENT ROUTER (Guaranteed No Automatic Downloads)
// ============================================================================
const DocumentRenderer = memo(({ doc }) => {
  if (!doc) return null;

  const fileName = doc.fileName ? doc.fileName.toLowerCase() : "";
  const fileType = doc.fileType ? doc.fileType.toLowerCase() : "";

  // 1. Word Document (.docx / .doc)
  if (fileName.endsWith(".docx") || fileName.endsWith(".doc")) {
    return <LocalDocxViewer fileUrl={doc.fileUrl} />;
  }

  // 2. PowerPoint (.pptx / .ppt)
  // Force PowerPoint files directly into the React Presentation Slide Deck
  if (
    fileName.endsWith(".pptx") ||
    fileName.endsWith(".ppt") ||
    fileType.includes("presentation") ||
    fileType.includes("powerpoint")
  ) {
    return <PresentationSlideDeck rawText={doc.rawText} />;
  }

  // 3. Native PDF Mode ONLY
  if (fileName.endsWith(".pdf") || fileType.includes("pdf")) {
    return (
      <iframe
        src={doc.fileUrl}
        title={doc.fileName}
        width="100%"
        height="100%"
        frameBorder="0"
        style={{ display: "block" }}
      />
    );
  }

  // 4. Fallback Plain Text (.txt or others)
  return <PaperTextViewer rawText={doc.rawText} />;
});

// ============================================================================
// MAIN CHATPAGE EXPORT ENTRY
// ============================================================================
export default function ChatPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [notebook, setNotebook] = useState(location.state?.notebook || null);
  const [fullTextLoaded, setFullTextLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState("chat");

  const [activeDocIndex, setActiveDocIndex] = useState(0);

  // Global Input State
  const [input, setInput] = useState("");

  // Chat State
  const [messages, setMessages] = useState([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatContainerRef = useRef(null);

  // Audio State
  const [audioScript, setAudioScript] = useState(null);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // Video State
  const [videos, setVideos] = useState([]);
  const [isVideoLoading, setIsVideoLoading] = useState(false);

  useEffect(() => {
    const fetchFullNotebook = async () => {
      try {
        const response = await fetch(`http://localhost:3000/notebook/${id}`);
        const data = await response.json();

        if (response.ok) {
          setNotebook(data.notebook);
          setFullTextLoaded(true);

          setMessages([
            {
              role: "ai",
              text: `Hi! I'm ready to help you study "${data.notebook.title}". Ask me a question, or switch to the Audio/Video tabs to explore more!`,
            },
          ]);
        }
      } catch (error) {
        console.error("Failed to load full notebook text", error);
      }
    };

    fetchFullNotebook();
  }, [id]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !notebook) return;

    const userText = input;
    setInput("");

    if (activeTab === "chat") {
      await handleChatSubmit(userText);
    } else if (activeTab === "audio") {
      await handleAudioSubmit(userText);
    } else if (activeTab === "video") {
      await handleVideoSearch(userText);
    }
  };

  const handleChatSubmit = async (userText) => {
    setMessages((prev) => [...prev, { role: "user", text: userText }]);
    setIsChatLoading(true);

    try {
      const token = localStorage.getItem("studyAppToken");
      const notebookId = notebook._id || notebook.id || id;

      const response = await fetch(
        `http://localhost:3000/notebook/${notebookId}/chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ message: userText }),
        },
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
      setIsChatLoading(false);
    }
  };

  const handleAudioSubmit = async (userText = null) => {
    setIsAudioLoading(true);
    window.speechSynthesis.cancel();
    setIsPlaying(false);

    try {
      const notebookId = notebook._id || notebook.id || id;

      const response = await fetch("http://localhost:3000/generate-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notebookId, customPrompt: userText }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      setAudioScript(data.script);
      playBrowserAudio(data.script);
    } catch (error) {
      console.error("Audio generation failed:", error);
      alert("Could not generate custom audio overview.");
    } finally {
      setIsAudioLoading(false);
    }
  };

  const handleVideoSearch = async (userText = null) => {
    setIsVideoLoading(true);
    try {
      const queryText = userText ? userText : notebook.title;

      const response = await fetch("http://localhost:3000/get-videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: queryText }),
      });
      const data = await response.json();
      setVideos(data.videos || []);
    } catch (err) {
      alert("Video search failed.");
    } finally {
      setIsVideoLoading(false);
    }
  };

  const playBrowserAudio = (text) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);

    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    const voices = window.speechSynthesis.getVoices();
    utterance.voice = voices.find((v) => v.lang === "en-US") || voices[0];

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopAudio = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
  };

  if (!notebook && !fullTextLoaded) {
    return (
      <div style={{ padding: "40px", textAlign: "center", fontFamily: "sans-serif" }}>
        Loading Study Mode...
      </div>
    );
  }

  const activeDocument =
    notebook?.documents && notebook.documents.length > 0
      ? notebook.documents[activeDocIndex]
      : null;

  return (
    <>
      <Helmet>
        <title>Study Mode - {notebook?.title || "Notebook"}</title>
      </Helmet>

      <div
        style={{
          display: "flex",
          height: "100vh",
          width: "100vw",
          overflow: "hidden",
          backgroundColor: "#f8fafc",
          fontFamily: "sans-serif",
        }}
      >
        {/* LEFT WORKSPACE CANVAS CONTAINER */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", padding: "16px 24px" }}>
          
          {/* Top Control Bar Deck */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "14px", flexShrink: 0 }}>
            <button
              onClick={() => navigate(-1)}
              style={{
                padding: "8px 16px",
                cursor: "pointer",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                backgroundColor: "white",
                fontWeight: "bold",
                fontSize: "13px",
              }}
            >
              ← Back
            </button>

            {/* Document Drawer Selection Tabs */}
            {notebook?.documents && notebook.documents.length > 0 && (
              <div style={{ display: "flex", gap: "6px", overflowX: "auto", flex: 1 }}>
                {notebook.documents.map((doc, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveDocIndex(idx)}
                    style={{
                      padding: "8px 14px",
                      borderRadius: "8px",
                      border: activeDocIndex === idx ? "1px solid #6366f1" : "1px solid #e2e8f0",
                      backgroundColor: activeDocIndex === idx ? "#eff6ff" : "white",
                      color: activeDocIndex === idx ? "#2563eb" : "#475569",
                      fontWeight: "600",
                      fontSize: "13px",
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {doc.fileName.toLowerCase().endsWith(".pptx") ? "📊" : "📄"} {doc.fileName.toUpperCase()}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Canvas Viewport Frame */}
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
              border: "1px solid #e2e8f0",
              flex: 1,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {activeDocument ? (
              <DocumentRenderer doc={activeDocument} />
            ) : (
              <div style={{ padding: "40px", color: "#334155", overflowY: "auto" }}>
                <p style={{ color: "#64748b", fontStyle: "italic", marginBottom: "16px" }}>
                  No active source file loaded. Showing core summary:
                </p>
                <p style={{ whiteSpace: "pre-wrap", lineHeight: "1.8", fontSize: "16px" }}>
                  {notebook.summary || notebook.aiSummary}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT SIDE: UTILITY CONTROL PANELS */}
        <div
          style={{
            width: "450px",
            flexShrink: 0,
            borderLeft: "1px solid #e2e8f0",
            backgroundColor: "white",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Nav Selectors */}
          <div
            style={{
              display: "flex",
              borderBottom: "1px solid #e2e8f0",
              backgroundColor: "#f8fafc",
            }}
          >
            <button
              onClick={() => setActiveTab("chat")}
              style={{
                flex: 1,
                padding: "16px 0",
                border: "none",
                backgroundColor: activeTab === "chat" ? "white" : "transparent",
                color: activeTab === "chat" ? "#6366f1" : "#64748b",
                borderBottom: activeTab === "chat" ? "2px solid #6366f1" : "2px solid transparent",
                fontWeight: activeTab === "chat" ? "bold" : "normal",
                cursor: "pointer",
                fontSize: "14px",
              }}
            >
              💬 Text Chat
            </button>

            <button
              onClick={() => setActiveTab("audio")}
              style={{
                flex: 1,
                padding: "16px 0",
                border: "none",
                backgroundColor: activeTab === "audio" ? "white" : "transparent",
                color: activeTab === "audio" ? "#6366f1" : "#64748b",
                borderBottom: activeTab === "audio" ? "2px solid #6366f1" : "2px solid transparent",
                fontWeight: activeTab === "audio" ? "bold" : "normal",
                cursor: "pointer",
                fontSize: "14px",
              }}
            >
              🎧 Audio Lesson
            </button>

            <button
              onClick={() => setActiveTab("video")}
              style={{
                flex: 1,
                padding: "16px 0",
                border: "none",
                backgroundColor: activeTab === "video" ? "white" : "transparent",
                color: activeTab === "video" ? "#6366f1" : "#64748b",
                borderBottom: activeTab === "video" ? "2px solid #6366f1" : "2px solid transparent",
                fontWeight: activeTab === "video" ? "bold" : "normal",
                cursor: "pointer",
                fontSize: "14px",
              }}
            >
              🎥 Video Lessons
            </button>
          </div>

          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>
            
            {/* TAB 1: AI TUTOR CONVERSATION PANEL */}
            {activeTab === "chat" && (
              <>
                <div style={{ padding: "16px 20px", borderBottom: "1px solid #e2e8f0", backgroundColor: "#f8fafc" }}>
                  <h3 style={{ margin: 0, fontSize: "16px", color: "#0f172a" }}>AI Tutor</h3>
                </div>

                <div ref={chatContainerRef} style={{ flex: 1, padding: "20px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "16px" }}>
                  {messages.map((msg, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: msg.role === "ai" ? "flex-start" : "flex-end" }}>
                      <div style={{ backgroundColor: msg.role === "ai" ? "#f8fafc" : "#6366f1", color: msg.role === "ai" ? "#334155" : "#ffffff", padding: "16px", borderRadius: msg.role === "ai" ? "12px 12px 12px 4px" : "12px 12px 4px 12px", maxWidth: "90%", fontSize: "15px", lineHeight: "1.6", border: msg.role === "ai" ? "1px solid #e2e8f0" : "none", wordBreak: "break-word" }}>
                        {msg.role === "ai" ? (
                          <ReactMarkdown
                            components={{
                              p: ({ node, ...props }) => <p style={{ margin: "0 0 10px 0" }} {...props} />,
                              ul: ({ node, ...props }) => <ul style={{ margin: "0 0 10px 20px" }} {...props} />,
                              ol: ({ node, ...props }) => <ol style={{ margin: "0 0 10px 20px" }} {...props} />,
                              h3: ({ node, ...props }) => <h3 style={{ margin: "15px 0 10px 0", fontSize: "18px" }} {...props} />,
                              h4: ({ node, ...props }) => <h4 style={{ margin: "15px 0 10px 0", fontSize: "16px" }} {...props} />,
                            }}
                          >
                            {msg.text}
                          </ReactMarkdown>
                        ) : (
                          msg.text
                        )}
                      </div>
                    </div>
                  ))}

                  {isChatLoading && (
                    <div style={{ display: "flex", justifyContent: "flex-start" }}>
                      <div style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", padding: "12px 16px", borderRadius: "12px 12px 12px 4px", color: "#64748b", fontSize: "14px", fontStyle: "italic" }}>
                        Thinking...
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* TAB 2: AUDIO OVERVIEW */}
            {activeTab === "audio" && (
              <div style={{ flex: 1, padding: "20px", overflowY: "auto", textAlign: "center" }}>
                <h3 style={{ marginTop: "20px", color: "#0f172a" }}>🎧 Custom Audio Overview</h3>
                <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "30px" }}>Ask a question below, or generate a general summary!</p>

                {!audioScript && !isAudioLoading && (
                  <button onClick={() => handleAudioSubmit(null)} style={{ backgroundColor: "#2563eb", color: "white", padding: "12px 24px", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: "bold", width: "100%" }}>
                    Generate General Overview
                  </button>
                )}

                {isAudioLoading && <div style={{ margin: "40px 0", color: "#6366f1", fontWeight: "bold" }}>⏳ Generating your audio script...</div>}

                {audioScript && !isAudioLoading && (
                  <div style={{ textAlign: "left", marginTop: "20px" }}>
                    {isPlaying ? (
                      <button onClick={stopAudio} style={{ backgroundColor: "#dc2626", color: "white", padding: "10px 20px", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: "bold", width: "100%", marginBottom: "20px" }}>⏹ Stop Playback</button>
                    ) : (
                      <button onClick={() => playBrowserAudio(audioScript)} style={{ backgroundColor: "#16a34a", color: "white", padding: "10px 20px", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: "bold", width: "100%", marginBottom: "20px" }}>▶️ Replay Audio</button>
                    )}
                    <div style={{ backgroundColor: "#f8fafc", padding: "15px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "14px", lineHeight: "1.6", color: "#334155" }}>
                      <strong>Generated Script:</strong>
                      <p style={{ marginTop: "10px" }}>{audioScript}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: VIDEO SEARCH TRACKS */}
            {activeTab === "video" && (
              <div style={{ flex: 1, padding: "20px", overflowY: "auto" }}>
                <h3 style={{ marginTop: "10px", color: "#0f172a", textAlign: "center" }}>🎥 Recommended Lessons</h3>
                <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "30px", textAlign: "center" }}>Search a specific topic below, or click the button to find general videos!</p>

                {isVideoLoading ? (
                  <div style={{ margin: "40px 0", color: "#6366f1", fontWeight: "bold", textAlign: "center" }}>⏳ Searching YouTube...</div>
                ) : videos.length === 0 ? (
                  <button onClick={() => handleVideoSearch(null)} style={{ backgroundColor: "#ef4444", color: "white", padding: "12px 24px", border: "none", borderRadius: "8px", cursor: "pointer", width: "100%", fontWeight: "bold" }}>
                    Find Videos for "{notebook?.title}"
                  </button>
                ) : (
                  <div style={{ display: "grid", gap: "20px", marginTop: "10px" }}>
                    {videos.map((video) => {
                      const videoId = video.id?.videoId || video.id;
                      if (!videoId) return null;

                      return (
                        <div key={videoId} style={{ borderRadius: "8px", overflow: "hidden", border: "1px solid #e2e8f0" }}>
                          <iframe width="100%" height="220" src={`https://www.youtube.com/embed/${videoId}`} title="YouTube Video Player" frameBorder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowFullScreen style={{ display: "block" }} />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* GLOBAL INPUT BOX */}
          <form onSubmit={handleSend} style={{ display: "flex", padding: "16px", borderTop: "1px solid #e2e8f0", backgroundColor: "#ffffff", gap: "10px" }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={activeTab === "chat" ? "Ask a question..." : activeTab === "audio" ? "What should the audio focus on?" : "Search for a specific video topic..."}
              style={{ flex: 1, padding: "10px 16px", borderRadius: "24px", border: "1px solid #cbd5e1", outline: "none", fontSize: "14px" }}
            />
            <button type="submit" disabled={(activeTab === "chat" && isChatLoading) || (activeTab === "audio" && isAudioLoading) || (activeTab === "video" && isVideoLoading) || !input.trim()} style={{ padding: "8px 16px", backgroundColor: "#6366f1", color: "white", border: "none", borderRadius: "24px", cursor: "pointer", fontWeight: "600" }}>
              {activeTab === "video" ? "Search" : activeTab === "chat" ? "Send" : "Generate"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}