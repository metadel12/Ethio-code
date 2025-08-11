import React, { useState, useRef, useEffect } from "react";
import "./whiteboard.css";

const Whiteboard = () => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState("#3b82f6");
  const [brushSize, setBrushSize] = useState(5);
  const [tool, setTool] = useState("pen");
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [textInput, setTextInput] = useState("");
  const [isTextMode, setIsTextMode] = useState(false);
  const [textPosition, setTextPosition] = useState({ x: 0, y: 0 });
  const [stencils, setStencils] = useState([]);
  const [activeStencil, setActiveStencil] = useState(null);
  const [chatMessages, setChatMessages] = useState([
    {
      user: "Interviewer",
      text: "Welcome to the system design interview!",
      time: "10:00 AM",
    },
    {
      user: "Candidate",
      text: "Thank you! I'm ready to begin.",
      time: "10:01 AM",
    },
  ]);
  const [newMessage, setNewMessage] = useState("");
  const [participants, setParticipants] = useState([
    { id: 1, name: "Alex Johnson", role: "Interviewer", online: true },
    { id: 2, name: "Taylor Smith", role: "Candidate", online: true },
  ]);
  const [showTemplates, setShowTemplates] = useState(false);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth * 0.7;
      canvas.height = window.innerHeight * 0.8;

      // Initial white background
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw initial grid
      drawGrid(ctx, canvas.width, canvas.height);
    };

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    return () => window.removeEventListener("resize", resizeCanvas);
  }, []);

  // Draw grid pattern
  const drawGrid = (ctx, width, height) => {
    ctx.strokeStyle = "#f0f0f0";
    ctx.lineWidth = 1;

    // Vertical lines
    for (let x = 0; x <= width; x += 20) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // Horizontal lines
    for (let y = 0; y <= height; y += 20) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  };

  // Start drawing
  const startDrawing = (e) => {
    if (isTextMode) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);
    setStartPos({ x, y });

    if (tool === "pen") {
      const ctx = canvas.getContext("2d");
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  };

  // Draw on canvas
  const draw = (e) => {
    if (!isDrawing || isTextMode) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const ctx = canvas.getContext("2d");

    ctx.lineWidth = brushSize;
    ctx.lineCap = "round";
    ctx.strokeStyle = color;

    if (tool === "pen") {
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  // Stop drawing
  const stopDrawing = (e) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const endX = e.clientX - rect.left;
    const endY = e.clientY - rect.top;
    const ctx = canvas.getContext("2d");

    if (tool !== "pen") {
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize;
      ctx.beginPath();

      if (tool === "rectangle") {
        ctx.rect(startPos.x, startPos.y, endX - startPos.x, endY - startPos.y);
      } else if (tool === "circle") {
        const radius = Math.sqrt(
          Math.pow(endX - startPos.x, 2) + Math.pow(endY - startPos.y, 2)
        );
        ctx.arc(startPos.x, startPos.y, radius, 0, Math.PI * 2);
      } else if (tool === "line") {
        ctx.moveTo(startPos.x, startPos.y);
        ctx.lineTo(endX, endY);
      }

      ctx.stroke();
    }

    setIsDrawing(false);
  };

  // Clear canvas
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawGrid(ctx, canvas.width, canvas.height);
    setStencils([]);
  };

  // Add text to canvas
  const addTextToCanvas = (e) => {
    if (!isTextMode) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setTextPosition({ x, y });

    // Show text input
    const textInput = document.getElementById("text-input");
    if (textInput) {
      textInput.style.display = "block";
      textInput.style.left = `${e.clientX}px`;
      textInput.style.top = `${e.clientY}px`;
      textInput.focus();
    }
  };

  // Insert text on canvas
  const insertText = () => {
    if (!textInput.trim()) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    ctx.font = `${brushSize * 3}px Arial`;
    ctx.fillStyle = color;
    ctx.fillText(textInput, textPosition.x, textPosition.y);

    // Hide text input
    const textInputElem = document.getElementById("text-input");
    if (textInputElem) {
      textInputElem.style.display = "none";
    }

    setTextInput("");
    setIsTextMode(false);
  };

  // Add stencil to canvas
  const addStencil = (stencilType) => {
    setActiveStencil({
      type: stencilType,
      position: { x: 100, y: 100 }, // Default position
      size: 80,
    });

    // Add to stencils array
    setStencils([
      ...stencils,
      {
        id: Date.now(),
        type: stencilType,
        position: { x: 100, y: 100 },
        size: 80,
      },
    ]);
  };

  // Send chat message
  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const now = new Date();
    const timeString = now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    setChatMessages([
      ...chatMessages,
      { user: "You", text: newMessage, time: timeString },
    ]);

    setNewMessage("");
  };

  // System design templates
  const systemTemplates = [
    {
      id: "ecommerce",
      name: "E-commerce System",
      description: "Design a scalable e-commerce platform",
    },
    {
      id: "social",
      name: "Social Media",
      description: "Design a social media platform",
    },
    {
      id: "ride",
      name: "Ride Sharing",
      description: "Design a ride-sharing service",
    },
    {
      id: "video",
      name: "Video Streaming",
      description: "Design a video streaming service",
    },
    {
      id: "payment",
      name: "Payment System",
      description: "Design a payment processing system",
    },
  ];

  return (
    <div className="whiteboard-container">
      {/* Header */}
      <header className="whiteboard-header">
        <div className="header-left">
          <h1>Coding Interview Whiteboard</h1>
          <p>Collaborate in real-time on system design problems</p>
        </div>
        <div className="header-right">
          <button
            className="template-btn"
            onClick={() => setShowTemplates(!showTemplates)}
          >
            {showTemplates ? "Hide Templates" : "Show Templates"}
          </button>
          <div className="participants">
            {participants.map((p) => (
              <div key={p.id} className="participant">
                <div
                  className={`status-dot ${p.online ? "online" : "offline"}`}
                ></div>
                <span>
                  {p.name} ({p.role})
                </span>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="whiteboard-content">
        {/* Templates Panel */}
        {showTemplates && (
          <div className="templates-panel">
            <h3>System Design Templates</h3>
            <div className="templates-grid">
              {systemTemplates.map((template) => (
                <div
                  key={template.id}
                  className="template-card"
                  onClick={() => addStencil(template.id)}
                >
                  <div className="template-icon">
                    {template.id === "ecommerce" && "🛒"}
                    {template.id === "social" && "👥"}
                    {template.id === "ride" && "🚗"}
                    {template.id === "video" && "🎬"}
                    {template.id === "payment" && "💳"}
                  </div>
                  <h4>{template.name}</h4>
                  <p>{template.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Whiteboard Area */}
        <div className="whiteboard-area">
          {/* Toolbar */}
          <div className="toolbar">
            <div className="tool-section">
              <h4>Tools</h4>
              <div className="tool-group">
                <button
                  onClick={() => setTool("pen")}
                  className={`tool-btn ${tool === "pen" ? "active" : ""}`}
                  title="Pen"
                >
                  <i className="icon-pen"></i>
                </button>
                <button
                  onClick={() => setTool("rectangle")}
                  className={`tool-btn ${tool === "rectangle" ? "active" : ""}`}
                  title="Rectangle"
                >
                  <i className="icon-rectangle"></i>
                </button>
                <button
                  onClick={() => setTool("circle")}
                  className={`tool-btn ${tool === "circle" ? "active" : ""}`}
                  title="Circle"
                >
                  <i className="icon-circle"></i>
                </button>
                <button
                  onClick={() => setTool("line")}
                  className={`tool-btn ${tool === "line" ? "active" : ""}`}
                  title="Line"
                >
                  <i className="icon-line"></i>
                </button>
                <button
                  onClick={() => setIsTextMode(!isTextMode)}
                  className={`tool-btn ${isTextMode ? "active" : ""}`}
                  title="Text"
                >
                  <i className="icon-text"></i>
                </button>
                <button
                  onClick={clearCanvas}
                  className="tool-btn"
                  title="Clear Board"
                >
                  <i className="icon-clear"></i>
                </button>
              </div>
            </div>

            <div className="tool-section">
              <h4>Brush Size</h4>
              <input
                type="range"
                min="1"
                max="50"
                value={brushSize}
                onChange={(e) => setBrushSize(parseInt(e.target.value))}
                className="brush-slider"
              />
              <div className="brush-size">{brushSize}px</div>
            </div>

            <div className="tool-section">
              <h4>Color</h4>
              <div className="color-palette">
                {[
                  "#3b82f6",
                  "#ef4444",
                  "#10b981",
                  "#f59e0b",
                  "#8b5cf6",
                  "#000000",
                  "#ffffff",
                ].map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={`color-btn ${color === c ? "active" : ""}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="color-picker"
                />
              </div>
            </div>

            <div className="tool-section">
              <h4>Stencils</h4>
              <div className="stencil-grid">
                <button
                  onClick={() => addStencil("server")}
                  className="stencil-btn"
                >
                  <i className="icon-server"></i> Server
                </button>
                <button
                  onClick={() => addStencil("database")}
                  className="stencil-btn"
                >
                  <i className="icon-database"></i> Database
                </button>
                <button
                  onClick={() => addStencil("user")}
                  className="stencil-btn"
                >
                  <i className="icon-user"></i> User
                </button>
                <button
                  onClick={() => addStencil("cloud")}
                  className="stencil-btn"
                >
                  <i className="icon-cloud"></i> Cloud
                </button>
              </div>
            </div>
          </div>

          {/* Canvas */}
          <div className="canvas-container">
            <canvas
              ref={canvasRef}
              onMouseDown={(e) =>
                isTextMode ? addTextToCanvas(e) : startDrawing(e)
              }
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseOut={stopDrawing}
              className="whiteboard-canvas"
            />
            <div id="text-input" className="text-input-container">
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Enter text..."
                onKeyDown={(e) => e.key === "Enter" && insertText()}
              />
              <button onClick={insertText}>Add</button>
              <button
                onClick={() => {
                  document.getElementById("text-input").style.display = "none";
                  setIsTextMode(false);
                }}
              >
                Cancel
              </button>
            </div>
          </div>

          {/* Chat Panel */}
          <div className="chat-panel">
            <div className="chat-header">
              <h3>Interview Chat</h3>
              <div className="connection-status">
                <div className="status-dot online"></div>
                <span>Connected</span>
              </div>
            </div>
            <div className="chat-messages">
              {chatMessages.map((msg, index) => (
                <div
                  key={index}
                  className={`message ${
                    msg.user === "You" ? "sent" : "received"
                  }`}
                >
                  <div className="message-header">
                    <span className="message-sender">{msg.user}</span>
                    <span className="message-time">{msg.time}</span>
                  </div>
                  <div className="message-text">{msg.text}</div>
                </div>
              ))}
            </div>
            <div className="chat-input">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              />
              <button onClick={sendMessage}>
                <i className="icon-send"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="whiteboard-footer">
        <div className="footer-left">
          <button className="action-btn">
            <i className="icon-download"></i> Export Board
          </button>
          <button className="action-btn">
            <i className="icon-save"></i> Save Session
          </button>
        </div>
        <div className="footer-right">
          <button className="interview-btn">Start Interview</button>
          <button className="end-btn">End Session</button>
        </div>
      </footer>
    </div>
  );
};

export default Whiteboard;
