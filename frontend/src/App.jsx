import { useState } from 'react'

function App() {
  const [file, setFile] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  
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
    
    // This fires once the browser finishes reading the file locally
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
          console.log('Updated Workspace:', data.workspace);
        } else {
          setStatusMessage(`❌ Error: ${data.message || 'Upload failed'}`);
        }
      } catch (error) {
        setStatusMessage('❌ Network error: Could not reach the server.');
        console.error(error);
      }
    };

    // Read the file as plain text string
    reader.readAsText(file);
  };

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif' }}>
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
    </div>
  );
}

export default App
