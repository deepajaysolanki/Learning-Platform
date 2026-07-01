import { useState } from 'react'

function App() {
  const [file, setFile] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  
  // --- STATE FOR CHAT FEATURE ---
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [uploadedText, setUploadedText] = useState(''); // Stores text locally to display it

  // Use your actual workspace ID here
  const workspaceId = "6a3ee32364417dea804d3965"; 

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = () => {
    if (!file) {
      setStatusMessage('Please select a file first.');
      return;
    }

    const reader = new FileReader();
    
    reader.onload = async (e) => {
      const textContent = e.target.result;

      try {
        setStatusMessage('Uploading...');
        
        const response = await fetch(`http://localhost:3000/${workspaceId}/upload`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: textContent,
            filename: file.name
          }),
        });

        const data = await response.json();

        if (response.ok) {
          setStatusMessage(`✅ Success: ${data.message}`);
          setUploadedText(textContent); // Save the text to show on screen
          console.log('Updated Workspace:', data.workspace);
        } else {
          setStatusMessage(`❌ Error: ${data.message || 'Upload failed'}`);
        }
      } catch (error) {
        setStatusMessage('❌ Network error: Could not reach the server.');
        console.error(error);
      }
    };

    reader.readAsText(file);
  };

  // --- TALK TO BACKEND ASK ROUTE ---
  const handleAskAI = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    setAiLoading(true);
    setAnswer(''); 

    try {
      const response = await fetch(`http://localhost:3000/api/workspaces/${workspaceId}/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: question }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setAnswer(data.answer);
      } else {
        setAnswer(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error(error);
      setAnswer('Could not reach the server for AI response.');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
      <h2>AI Workspace — Source Upload</h2>
      
      <div style={{ margin: '20px 0' }}>
        <input type="file" accept=".txt" onChange={handleFileChange} />
      </div>

      <button 
        onClick={handleUpload}
        style={{
          padding: '10px 20px',
          backgroundColor: '#0070f3',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        Upload and Parse File
      </button>

      {statusMessage && (
        <p style={{ marginTop: '20px', fontWeight: 'bold' }}>{statusMessage}</p>
      )}

      {/* --- CONDITIONAL DASHBOARD VISIBLE ONLY AFTER UPLOAD --- */}
      {uploadedText && (
        <div style={{ display: 'flex', gap: '30px', marginTop: '40px', borderTop: '2px solid #eee', paddingTop: '30px' }}>
          
          {/* Document Viewer Column */}
          <div style={{ flex: 1, backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px', maxHeight: '400px', overflowY: 'auto' }}>
            <h3>Document Preview ({file?.name})</h3>
            <p style={{ whiteSpace: 'pre-wrap', fontSize: '14px', lineHeight: '1.6', color: '#333' }}>
              {uploadedText}
            </p>
          </div>

          {/* AI Chat Column */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <h3>Study Assistant</h3>
            
            <div style={{ flex: 1, backgroundColor: '#fff', border: '1px solid #ddd', padding: '15px', borderRadius: '8px', minHeight: '150px' }}>
              {aiLoading && <p style={{ color: '#666' }}>Thinking...</p>}
              {answer && (
                <div>
                  <strong>AI Response:</strong>
                  <p style={{ whiteSpace: 'pre-wrap', marginTop: '10px', fontSize: '15px' }}>{answer}</p>
                </div>
              )}
              {!aiLoading && !answer && <p style={{ color: '#aaa' }}>Type a question below to test the AI.</p>}
            </div>

            <form onSubmit={handleAskAI} style={{ display: 'flex', gap: '10px' }}>
              <input 
                type="text" 
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask something about this text..." 
                disabled={aiLoading}
                style={{ flex: 1, padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
              />
              <button 
                type="submit" 
                disabled={aiLoading}
                style={{ padding: '10px 20px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
              >
                {aiLoading ? 'Asking...' : 'Ask'}
              </button>
            </form>
          </div>

        </div>
      )}
    </div>
  );
}

export default App