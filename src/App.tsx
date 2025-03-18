import React, { useState, useEffect, useCallback } from "react";
import "./App.css"; 

// Get the current environment
const isDevelopment = import.meta.env.DEV;

// Update WebSocket URL based on environment
const SERVER_URL = isDevelopment 
  ? 'ws://localhost:8000'  // Development environment
  : 'wss://sharenow-v77d.onrender.com';  // Production environment

console.log('Environment:', isDevelopment ? 'Development' : 'Production');
console.log('Connecting to WebSocket server at:', SERVER_URL);

const App: React.FC = () => {
  const [textInput, setTextInput] = useState<string>("");
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [isExisting, setIsExisting] = useState<Boolean>(false);
  const [copied, setCopied] = useState(false);
  const [notification, setNotification] = useState<string>("");
  const [networkId, setNetworkId] = useState<string>("");
  const [needsUpdate, setNeedsUpdate] = useState(false);
  
  // Function to fetch latest text
  const fetchLatestText = useCallback(async () => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: "getLatest" }));
      setNeedsUpdate(false);
      setNotification("");
    }
  }, [ws]);

  useEffect(() => {
    const connectWebSocket = () => {
      const socket = new WebSocket(SERVER_URL);

      socket.onopen = () => {
        console.log('WebSocket connection established');
      };

      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      socket.onclose = () => {
        console.log('WebSocket connection closed');
        // Optional: Implement reconnection logic
        setTimeout(connectWebSocket, 3000);
      };

      socket.onmessage = (e) => {
        const data = JSON.parse(e.data);
        
        if(data.type === "init") {
          setTextInput(data.text);
          setIsExisting(data.text !== "");
          setNetworkId(data.networkId);
        } else if(data.type === "save" && !data.notification.includes("update")) {
          // Only update text for the sender
          setTextInput(data.text);
          setIsExisting(data.text !== "");
          setNotification(data.notification);
          setTimeout(() => setNotification(""), 5000);
        } else if(data.type === "notification") {
          // For other clients, show update notification
          setNotification(data.notification);
          setNeedsUpdate(true);
        } else if(data.type === "latestText") {
          // Handle response for latest text request
          setTextInput(data.text);
          setIsExisting(data.text !== "");
          setNotification("Text updated successfully!");
          setTimeout(() => setNotification(""), 3000);
        }
      }

      setWs(socket);
    };

    connectWebSocket();

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if(ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: "save", text: textInput }));
      setIsExisting(true);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(textInput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="container">
      {notification && (
        <div 
          className={`notification ${
            needsUpdate ? "warning" : 
            notification.includes("success") ? "success" : ""
          }`}
        >
          {notification}
          {needsUpdate && (
            <button 
              className="update-button"
              onClick={fetchLatestText}
            >
              Update Now
            </button>
          )}
        </div>
      )}
      <h1 className="title">ShareNow</h1>
      {networkId && (
        <p className="network-info">Connected to network: {networkId}</p>
      )}
      <form onSubmit={handleSubmit} className="form">
        <input 
          className="input"
          placeholder="Enter the text you want to share" 
          type="text" 
          value={textInput} 
          onChange={(e) => setTextInput(e.target.value)} 
        />

        <div className="button-group">
          {textInput !== "" && isExisting && (
            <button 
              type="button"
              className={`button copy-button ${copied ? 'copied' : ''}`}
              onClick={handleCopy}
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          )}
          <button type="submit" className="button save-button">
            Save
          </button>
        </div>
      </form>
    </div>
  );
}

export default App;
