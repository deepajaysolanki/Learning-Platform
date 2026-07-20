import React, { useState } from 'react';
import '../styles/AudioPanel.css'; // 🟢 Import external CSS stylesheet

const AudioPanel = ({ notebookId }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [script, setScript] = useState(null);

  const generateAndPlayAudio = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('https://vibestudy-backend-o61q.onrender.com/generate-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notebookId }),
      });

      if (!response.ok) throw new Error("Failed to fetch script");

      const data = await response.json();
      setScript(data.script);
      
      // Start playing the audio
      playAudio(data.script);
    } catch (error) {
      console.error("Error:", error);
      alert("Could not generate audio.");
    } finally {
      setIsLoading(false);
    }
  };

  const playAudio = (text) => {
    window.speechSynthesis.cancel(); // Stop any currently playing audio
    const utterance = new SpeechSynthesisUtterance(text);
    
    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopAudio = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
  };

  return (
    <div className="ap-container">
      <div className="ap-header">
        <h2>🎧 Audio Overview</h2>
        <p className="ap-subtitle">Listen to a podcast-style summary</p>
      </div>

      <div className="ap-player-card">
        {!script && !isLoading && (
          <button className="ap-btn-main" onClick={generateAndPlayAudio}>
            Generate Audio Summary
          </button>
        )}

        {isLoading && (
          <div className="ap-loading-state">
            <div className="spinner">⏳ Generating your audio script...</div>
          </div>
        )}

        {script && !isLoading && (
          <div className="ap-controls">
            {isPlaying ? (
              <button className="ap-btn-stop" onClick={stopAudio}>
                ⏹ Stop Playback
              </button>
            ) : (
              <button className="ap-btn-play" onClick={() => playAudio(script)}>
                ▶️ Replay Audio
              </button>
            )}
            
            <div className="ap-script-box">
              <strong>Script:</strong>
              <p>{script}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AudioPanel;