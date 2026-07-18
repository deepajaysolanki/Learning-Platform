import React, { useState } from 'react';

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
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>🎧 Audio Overview</h2>
        <p style={styles.subtitle}>Listen to a podcast-style summary</p>
      </div>

      <div style={styles.playerCard}>
        {!script && !isLoading && (
          <button style={styles.mainButton} onClick={generateAndPlayAudio}>
            Generate Audio Summary
          </button>
        )}

        {isLoading && (
          <div style={styles.loadingState}>
            <div className="spinner">⏳ Generating your audio script...</div>
          </div>
        )}

        {script && !isLoading && (
          <div style={styles.controls}>
            {isPlaying ? (
              <button style={styles.stopButton} onClick={stopAudio}>
                ⏹ Stop Playback
              </button>
            ) : (
              <button style={styles.playButton} onClick={() => playAudio(script)}>
                ▶️ Replay Audio
              </button>
            )}
            
            <div style={styles.scriptBox}>
              <strong>Script:</strong>
              <p>{script}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Simple inline styles to match your clean UI
const styles = {
  container: { display: 'flex', flexDirection: 'column', height: '100%', padding: '20px' },
  header: { borderBottom: '1px solid #eee', paddingBottom: '15px', marginBottom: '20px' },
  subtitle: { color: '#666', fontSize: '14px', margin: 0 },
  playerCard: { backgroundColor: '#f9fafb', borderRadius: '12px', padding: '20px', textAlign: 'center', border: '1px solid #e5e7eb' },
  mainButton: { backgroundColor: '#2563eb', color: 'white', padding: '12px 24px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold', width: '100%' },
  stopButton: { backgroundColor: '#dc2626', color: 'white', padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold' },
  playButton: { backgroundColor: '#16a34a', color: 'white', padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold' },
  scriptBox: { marginTop: '20px', textAlign: 'left', backgroundColor: 'white', padding: '15px', borderRadius: '8px', border: '1px solid #e5e7eb', maxHeight: '400px', overflowY: 'auto', fontSize: '14px', lineHeight: '1.6' }
};

export default AudioPanel;