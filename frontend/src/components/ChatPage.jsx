import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import ReactMarkdown from "react-markdown";

export default function ChatPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [notebook, setNotebook] = useState(location.state?.notebook || null);
  const [fullTextLoaded, setFullTextLoaded] = useState(false);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Fixed Ref for scrolling
  const chatContainerRef = useRef(null);

  // Fetch the full notebook data (with documents) when the page loads
  useEffect(() => {
    const fetchFullNotebook = async () => {
      try {
        const response = await fetch(`http://localhost:3000/notebook/${id}`);
        const data = await response.json();

        if (response.ok) {
          setNotebook(data.notebook);
          setFullTextLoaded(true);

          // Initialize AI chat once we have the notebook title
          setMessages([
            {
              role: "ai",
              text: `Hi! I'm ready to help you study "${data.notebook.title}". Ask me anything!`,
            },
          ]);
        }
      } catch (error) {
        console.error("Failed to load full notebook text", error);
      }
    };

    fetchFullNotebook();
  }, [id]);

  // Auto-scroll ONLY the chat container
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
    setMessages((prev) => [...prev, { role: "user", text: userText }]);
    setInput("");
    setIsLoading(true);

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
      setIsLoading(false);
    }
  };

  // Helper component to cleanly render specific layouts based on file extensions
  const DocumentRenderer = ({ doc }) => {
    const fileName = doc.fileName ? doc.fileName.toLowerCase() : "";
    const fileType = doc.fileType ? doc.fileType.toLowerCase() : "";

    // 1. PDF Native Handler
    if (fileName.endsWith(".pdf") || fileType.includes("pdf")) {
      return (
        <div
          style={{
            width: "100%",
            height: "650px",
            border: "1px solid #cbd5e1",
            borderRadius: "8px",
            overflow: "hidden",
            marginTop: "12px",
          }}
        >
          <iframe
            src={doc.fileUrl}
            title={doc.fileName}
            width="100%"
            height="100%"
            frameBorder="0"
          />
        </div>
      );
    }

    // 2. 📊 PowerPoint Presentation (Native CSS Layout - No Iframes!)
    if (fileName.endsWith(".pptx") || fileName.endsWith(".ppt")) {
      // Split the raw text string into individual lines, ignoring empty spaces
      const lines = doc.rawText
        ? doc.rawText.split("\n").filter((line) => line.trim().length > 0)
        : [];

      return (
        <div style={{ marginTop: "12px" }}>
          <div
            className="google-slides-preview"
            style={{ maxHeight: "650px", overflowY: "auto" }}
          >
            <div className="slide-container">
              {lines.map((line, idx) => {
                const trimmed = line.trim();

                // Heuristic: Short, uppercase lines or pure numbers act as Slide Titles
                const isHeader =
                  trimmed.length < 60 &&
                  (trimmed === trimmed.toUpperCase() ||
                    /^[0-9]+$/.test(trimmed));

                if (isHeader) {
                  return (
                    <h2 className="slide-title" key={idx}>
                      {trimmed}
                    </h2>
                  );
                }

                return (
                  <p className="slide-bullet" key={idx}>
                    <span className="bullet-icon">▪</span> {trimmed}
                  </p>
                );
              })}
            </div>
          </div>

          {/* Custom CSS specifically for PowerPoint outlines */}
          <style>{`
            .google-slides-preview {
              padding: 20px;
              background-color: #f1f5f9;
              border-radius: 8px;
              border: 1px solid #cbd5e1;
            }
            .slide-container {
              background-color: #ffffff;
              padding: 40px;
              border-radius: 8px;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
              border: 1px solid #e2e8f0;
            }
            .slide-title {
              font-size: 22px;
              color: #1a73e8;
              margin-top: 32px;
              margin-bottom: 16px;
              font-weight: 600;
              border-bottom: 2px solid #e8eaed;
              padding-bottom: 8px;
              font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            }
            .slide-title:first-child {
              margin-top: 0;
            }
            .slide-bullet {
              font-size: 16px;
              color: #334155;
              line-height: 1.8;
              margin: 0 0 12px 16px;
              display: flex;
              gap: 12px;
              font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            }
            .bullet-icon {
              color: #6366f1;
              font-size: 18px;
              line-height: 1.2;
            }
          `}</style>

          <div style={{ marginTop: "20px", textAlign: "right" }}>
            <a
              href={doc.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: "14px",
                color: "#6366f1",
                textDecoration: "none",
                fontWeight: "600",
              }}
            >
              📥 Download Original Presentation
            </a>
          </div>
        </div>
      );
    }

    // 3. 📝 Word Document (.docx) HTML Template (The one that works!)
    if (fileName.endsWith(".docx") || fileName.endsWith(".doc")) {
      return (
        <div style={{ marginTop: "12px" }}>
          <div
            className="google-doc-preview"
            style={{
              maxHeight: "650px",
              overflowY: "auto",
              padding: "40px",
              backgroundColor: "#ffffff",
              borderRadius: "8px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
              fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
              lineHeight: "1.7",
              color: "#202124",
            }}
            dangerouslySetInnerHTML={{ __html: doc.rawText }}
          />

          <style>{`
          .google-doc-preview h1 { font-size: 24px; color: #1a73e8; margin-top: 24px; margin-bottom: 12px; font-weight: 600; border-bottom: 1px solid #e8eaed; padding-bottom: 6px; }
          .google-doc-preview h2 { font-size: 20px; color: #202124; margin-top: 20px; margin-bottom: 10px; font-weight: 600; }
          .google-doc-preview p { margin: 0 0 12px 0; font-size: 15px; }
          .google-doc-preview strong { color: #000000; font-weight: 700; }
          .google-doc-preview ul { margin: 0 0 16px 24px; }
          .google-doc-preview li { margin-bottom: 6px; font-size: 15px; }
          .google-doc-preview table { width: 100%; border-collapse: collapse; margin: 16px 0; }
          .google-doc-preview td, .google-doc-preview th { padding: 10px; border: 1px solid #e2e8f0; }
        `}</style>

          <div style={{ marginTop: "20px", textAlign: "right" }}>
            <a
              href={doc.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: "14px",
                color: "#6366f1",
                textDecoration: "none",
                fontWeight: "600",
              }}
            >
              📥 Download Original Source File
            </a>
          </div>
        </div>
      );
    }

    // 4. Smart Plain Text (.txt) & Generic Fallback Reader
    if (fileName.endsWith(".txt") || fileName.endsWith(".TXT")) {
      // This uses Regex to find hidden lists and paragraphs inside giant blocks of text!

      let rawText = doc.rawText || "[No readable text extracted]";

      // Inject line breaks before numbers (e.g., " 1. ") and hyphens (e.g., " - ") so they separate naturally
      rawText = rawText.replace(/(\s(?=\d+\.\s))/g, "\n\n");
      rawText = rawText.replace(/(\s(?=-\s))/g, "\n");

      // Split the text into lines now that we forced line breaks
      const textLines = rawText
        .split("\n")
        .filter((line) => line.trim().length > 0);

      return (
        <div style={{ marginTop: "12px" }}>
          <div
            style={{
              maxHeight: "650px",
              overflowY: "auto",
              padding: "40px",
              backgroundColor: "#ffffff",
              borderRadius: "8px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
              fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
            }}
          >
            {textLines.map((line, idx) => {
              const trimmed = line.trim();

              // 1. Format "Subject:" or header titles (Blue, large, underlined)
              if (trimmed.toLowerCase().startsWith("subject:")) {
                return (
                  <h2
                    key={idx}
                    style={{
                      fontSize: "22px",
                      color: "#1a73e8",
                      borderBottom: "2px solid #e8eaed",
                      paddingBottom: "10px",
                      marginTop: 0,
                      marginBottom: "20px",
                    }}
                  >
                    {trimmed}
                  </h2>
                );
              }

              // 2. Format numbered lists like "1. Client-Server Architecture" (Bold, dark)
              if (/^\d+\.\s/.test(trimmed)) {
                return (
                  <h3
                    key={idx}
                    style={{
                      fontSize: "18px",
                      color: "#0f172a",
                      marginTop: "24px",
                      marginBottom: "10px",
                      fontWeight: "600",
                    }}
                  >
                    {trimmed}
                  </h3>
                );
              }

              // 3. Format bullet points like "- The Client (Front-end): ..." (Indented with a custom dot)
              if (trimmed.startsWith("- ")) {
                return (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      gap: "10px",
                      margin: "0 0 10px 16px",
                      color: "#334155",
                      fontSize: "15px",
                      lineHeight: "1.6",
                    }}
                  >
                    <span style={{ color: "#6366f1", fontWeight: "bold" }}>
                      •
                    </span>
                    {/* Remove the original hyphen and render the text */}
                    <span>{trimmed.substring(2)}</span>
                  </div>
                );
              }

              // 4. Standard paragraph text for everything else
              return (
                <p
                  key={idx}
                  style={{
                    fontSize: "16px",
                    color: "#334155",
                    lineHeight: "1.8",
                    margin: "0 0 12px 0",
                  }}
                >
                  {trimmed}
                </p>
              );
            })}
          </div>

          <div style={{ marginTop: "20px", textAlign: "right" }}>
            <a
              href={doc.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: "14px",
                color: "#6366f1",
                textDecoration: "none",
                fontWeight: "600",
              }}
            >
              📥 Download Original Text File
            </a>
          </div>
        </div>
      );
    }
  };
  if (!notebook && !fullTextLoaded) {
    return (
      <div
        style={{
          padding: "40px",
          textAlign: "center",
          fontFamily: "sans-serif",
        }}
      >
        Loading Study Mode...
      </div>
    );
  }

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
        {/* LEFT SIDE: The Document */}
        <div style={{ flex: 1, padding: "40px", overflowY: "auto" }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              padding: "8px 16px",
              marginBottom: "24px",
              cursor: "pointer",
              borderRadius: "8px",
              border: "1px solid #cbd5e1",
              backgroundColor: "white",
              fontWeight: "bold",
            }}
          >
            ← Back
          </button>

          <h1
            style={{
              fontSize: "2.5rem",
              marginBottom: "10px",
              color: "#0f172a",
            }}
          >
            {notebook.title}
          </h1>
          <p style={{ color: "#64748b", marginBottom: "30px" }}>
            Created by {notebook.author} •{" "}
            {notebook.documents?.length || notebook.sources || 0} Sources
          </p>

          <div
            style={{
              backgroundColor: "white",
              padding: "32px",
              borderRadius: "12px",
              boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
              border: "1px solid #e2e8f0",
            }}
          >
            <h3
              style={{
                borderBottom: "2px solid #eef2ff",
                paddingBottom: "10px",
                marginBottom: "20px",
                color: "#334155",
              }}
            >
              Study Material
            </h3>

            {!fullTextLoaded ? (
              <p style={{ color: "#64748b", fontStyle: "italic" }}>
                Loading document text...
              </p>
            ) : notebook.documents && notebook.documents.length > 0 ? (
              notebook.documents.map((doc, index) => (
                <div key={index} style={{ marginBottom: "32px" }}>
                  <h4
                    style={{
                      color: "#64748b",
                      marginBottom: "4px",
                      fontSize: "14px",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    {doc.fileName.toLowerCase().endsWith(".pptx") ? "📊" : "📄"}{" "}
                    {doc.fileName}
                  </h4>
                  {/* Dynamic conditional render engine */}
                  <DocumentRenderer doc={doc} />
                </div>
              ))
            ) : (
              <div style={{ color: "#334155" }}>
                <p
                  style={{
                    color: "#64748b",
                    fontStyle: "italic",
                    marginBottom: "16px",
                  }}
                >
                  No raw document text available. Showing AI Summary instead:
                </p>
                <p
                  style={{
                    whiteSpace: "pre-wrap",
                    lineHeight: "1.8",
                    fontSize: "16px",
                  }}
                >
                  {notebook.summary || notebook.aiSummary}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT SIDE: The AI Chat */}
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
          <div
            style={{
              padding: "16px 20px",
              borderBottom: "1px solid #e2e8f0",
              backgroundColor: "#f8fafc",
            }}
          >
            <h3 style={{ margin: 0, fontSize: "16px", color: "#0f172a" }}>
              AI Tutor
            </h3>
          </div>

          <div
            ref={chatContainerRef}
            style={{
              flex: 1,
              padding: "20px",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: msg.role === "ai" ? "flex-start" : "flex-end",
                }}
              >
                <div
                  style={{
                    backgroundColor: msg.role === "ai" ? "#f8fafc" : "#6366f1",
                    color: msg.role === "ai" ? "#334155" : "#ffffff",
                    padding: "16px",
                    borderRadius:
                      msg.role === "ai"
                        ? "12px 12px 12px 4px"
                        : "12px 12px 4px 12px",
                    maxWidth: "90%",
                    fontSize: "15px",
                    lineHeight: "1.6",
                    border: msg.role === "ai" ? "1px solid #e2e8f0" : "none",
                    wordBreak: "break-word",
                  }}
                >
                  {msg.role === "ai" ? (
                    <ReactMarkdown
                      components={{
                        p: ({ node, ...props }) => (
                          <p style={{ margin: "0 0 10px 0" }} {...props} />
                        ),
                        ul: ({ node, ...props }) => (
                          <ul style={{ margin: "0 0 10px 20px" }} {...props} />
                        ),
                        ol: ({ node, ...props }) => (
                          <ol style={{ margin: "0 0 10px 20px" }} {...props} />
                        ),
                        h3: ({ node, ...props }) => (
                          <h3
                            style={{
                              margin: "15px 0 10px 0",
                              fontSize: "18px",
                            }}
                            {...props}
                          />
                        ),
                        h4: ({ node, ...props }) => (
                          <h4
                            style={{
                              margin: "15px 0 10px 0",
                              fontSize: "16px",
                            }}
                            {...props}
                          />
                        ),
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

            {isLoading && (
              <div style={{ display: "flex", justifyContent: "flex-start" }}>
                <div
                  style={{
                    backgroundColor: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    padding: "12px 16px",
                    borderRadius: "12px 12px 12px 4px",
                    color: "#64748b",
                    fontSize: "14px",
                    fontStyle: "italic",
                  }}
                >
                  Thinking...
                </div>
              </div>
            )}
          </div>

          <form
            onSubmit={handleSend}
            style={{
              display: "flex",
              padding: "16px",
              borderTop: "1px solid #e2e8f0",
              backgroundColor: "#ffffff",
              gap: "10px",
            }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question..."
              style={{
                flex: 1,
                padding: "10px 16px",
                borderRadius: "24px",
                border: "1px solid #cbd5e1",
                outline: "none",
                fontSize: "14px",
              }}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              style={{
                padding: "8px 16px",
                backgroundColor: "#6366f1",
                color: "white",
                border: "none",
                borderRadius: "24px",
                cursor: "pointer",
                fontWeight: "600",
              }}
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
