import React, { useState, useRef, useEffect, memo } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import ReactMarkdown from "react-markdown";
import { renderAsync } from "docx-preview";
import "../styles/ChatPage.css"; // 🟢 Import external stylesheet

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

  return <div ref={viewerRef} className="docx-viewer-wrapper" />;
});

// ============================================================================
// 2. POWERPOINT PRESENTATION SLIDE CARDS
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
    <div className="presentation-deck">
      {finalSlides.map((slide, sIdx) => (
        <div key={sIdx} className="slide-card">
          <div className="slide-accent-line" />

          <div>
            {slide.title && <h2 className="slide-title">{slide.title}</h2>}

            <ul className="slide-bullets">
              {slide.points.map((pt, pIdx) => (
                <li key={pIdx}>{pt}</li>
              ))}
            </ul>
          </div>

          <div className="slide-footer">
            <span>VibeStudy Presentation Viewer</span>
            <span>Slide {sIdx + 1} of {finalSlides.length}</span>
          </div>
        </div>
      ))}
    </div>
  );
});

// ============================================================================
// 3. PAPER DOCUMENT CANVAS RENDERER (.txt)
// ============================================================================
const PaperTextViewer = memo(({ rawText }) => {
  const content = rawText || "[No text found]";

  return (
    <div className="paper-text-wrapper">
      <div className="paper-text-content">{content}</div>
    </div>
  );
});

// ============================================================================
// 4. ISOLATED MASTER DOCUMENT ROUTER
// ============================================================================
const DocumentRenderer = memo(({ doc }) => {
  if (!doc) return null;

  const fileName = doc.fileName ? doc.fileName.toLowerCase() : "";
  const fileType = doc.fileType ? doc.fileType.toLowerCase() : "";

  if (fileName.endsWith(".docx") || fileName.endsWith(".doc")) {
    return <LocalDocxViewer fileUrl={doc.fileUrl} />;
  }

  if (
    fileName.endsWith(".pptx") ||
    fileName.endsWith(".ppt") ||
    fileType.includes("presentation") ||
    fileType.includes("powerpoint")
  ) {
    return <PresentationSlideDeck rawText={doc.rawText} />;
  }

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
        const response = await fetch(`https://vibestudy-backend-o61q.onrender.com/notebook/${id}`);
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
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
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
        `https://vibestudy-backend-o61q.onrender.com/notebook/${notebookId}/chat`,
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
      setIsChatLoading(false);
    }
  };

  const handleAudioSubmit = async (userText = null) => {
    setIsAudioLoading(true);
    window.speechSynthesis.cancel();
    setIsPlaying(false);

    try {
      const notebookId = notebook._id || notebook.id || id;

      const response = await fetch("https://vibestudy-backend-o61q.onrender.com/generate-script", {
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

      const response = await fetch("https://vibestudy-backend-o61q.onrender.com/get-videos", {
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
    return <div className="chatpage-loading">Loading Study Mode...</div>;
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

      <div className="chatpage-wrapper">
        {/* LEFT WORKSPACE CANVAS CONTAINER */}
        <div className="workspace-container">
          <div className="workspace-top-bar">
            <button className="btn-back" onClick={() => navigate(-1)}>
              ← Back
            </button>

            {notebook?.documents && notebook.documents.length > 0 && (
              <div className="doc-tabs-scroll">
                {notebook.documents.map((doc, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveDocIndex(idx)}
                    className={`doc-tab-btn ${activeDocIndex === idx ? "active" : ""}`}
                  >
                    {doc.fileName.toLowerCase().endsWith(".pptx") ? "📊" : "📄"} {doc.fileName.toUpperCase()}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="canvas-viewport">
            {activeDocument ? (
              <DocumentRenderer doc={activeDocument} />
            ) : (
              <div className="empty-doc-view">
                <p className="notice-text">
                  No active source file loaded. Showing core summary:
                </p>
                <p className="summary-body">
                  {notebook.summary || notebook.aiSummary}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT SIDE: UTILITY CONTROL PANELS */}
        <div className="utility-panel-sidebar">
          <div className="utility-tabs-header">
            <button
              onClick={() => setActiveTab("chat")}
              className={`tab-selector-btn ${activeTab === "chat" ? "active" : ""}`}
            >
              💬 Text Chat
            </button>

            <button
              onClick={() => setActiveTab("audio")}
              className={`tab-selector-btn ${activeTab === "audio" ? "active" : ""}`}
            >
              🎧 Audio Lesson
            </button>

            <button
              onClick={() => setActiveTab("video")}
              className={`tab-selector-btn ${activeTab === "video" ? "active" : ""}`}
            >
              🎥 Video Lessons
            </button>
          </div>

          <div className="utility-content-body">
            {/* TAB 1: AI TUTOR CONVERSATION PANEL */}
            {activeTab === "chat" && (
              <>
                <div className="panel-section-header">
                  <h3>AI Tutor</h3>
                </div>

                <div ref={chatContainerRef} className="chat-stream-container">
                  {messages.map((msg, i) => (
                    <div key={i} className={`chat-bubble-row ${msg.role}`}>
                      <div className={`chat-bubble ${msg.role}`}>
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
                    <div className="thinking-indicator">
                      <div className="thinking-bubble">Thinking...</div>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* TAB 2: AUDIO OVERVIEW */}
            {activeTab === "audio" && (
              <div className="tab-panel-scroll centered">
                <h3 className="panel-sub-title">🎧 Custom Audio Overview</h3>
                <p className="panel-sub-desc">
                  Ask a question below, or generate a general summary!
                </p>

                {!audioScript && !isAudioLoading && (
                  <button onClick={() => handleAudioSubmit(null)} className="btn-primary-action">
                    Generate General Overview
                  </button>
                )}

                {isAudioLoading && (
                  <div style={{ margin: "40px 0", color: "#6366f1", fontWeight: "bold" }}>
                    ⏳ Generating your audio script...
                  </div>
                )}

                {audioScript && !isAudioLoading && (
                  <div style={{ textAlign: "left", marginTop: "20px" }}>
                    {isPlaying ? (
                      <button onClick={stopAudio} className="btn-danger-action">
                        ⏹ Stop Playback
                      </button>
                    ) : (
                      <button onClick={() => playBrowserAudio(audioScript)} className="btn-success-action">
                        ▶️ Replay Audio
                      </button>
                    )}
                    <div className="script-box">
                      <strong>Generated Script:</strong>
                      <p>{audioScript}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: VIDEO SEARCH TRACKS */}
            {activeTab === "video" && (
              <div className="tab-panel-scroll">
                <h3 className="panel-sub-title" style={{ textAlign: "center" }}>
                  🎥 Recommended Lessons
                </h3>
                <p className="panel-sub-desc" style={{ textAlign: "center" }}>
                  Search a specific topic below, or click the button to find general videos!
                </p>

                {isVideoLoading ? (
                  <div style={{ margin: "40px 0", color: "#6366f1", fontWeight: "bold", textAlign: "center" }}>
                    ⏳ Searching YouTube...
                  </div>
                ) : videos.length === 0 ? (
                  <button onClick={() => handleVideoSearch(null)} className="btn-youtube-action">
                    Find Videos for "{notebook?.title}"
                  </button>
                ) : (
                  <div className="videos-grid">
                    {videos.map((video) => {
                      const videoId = video.id?.videoId || video.id;
                      if (!videoId) return null;

                      return (
                        <div key={videoId} className="video-card-embed">
                          <iframe
                            width="100%"
                            height="220"
                            src={`https://www.youtube.com/embed/${videoId}`}
                            title="YouTube Video Player"
                            frameBorder="0"
                            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            style={{ display: "block" }}
                          />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* GLOBAL INPUT BOX */}
          <form onSubmit={handleSend} className="global-input-form">
            <input
              type="text"
              className="global-text-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                activeTab === "chat"
                  ? "Ask a question..."
                  : activeTab === "audio"
                  ? "What should the audio focus on?"
                  : "Search for a specific video topic..."
              }
            />
            <button
              type="submit"
              className="btn-send-input"
              disabled={
                (activeTab === "chat" && isChatLoading) ||
                (activeTab === "audio" && isAudioLoading) ||
                (activeTab === "video" && isVideoLoading) ||
                !input.trim()
              }
            >
              {activeTab === "video" ? "Search" : activeTab === "chat" ? "Send" : "Generate"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}