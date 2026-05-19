import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FaArrowPointer,
  FaBold,
  FaCode,
  FaComments,
  FaDatabase,
  FaDownload,
  FaEraser,
  FaFileExport,
  FaGrip,
  FaHand,
  FaHighlighter,
  FaImage,
  FaItalic,
  FaLayerGroup,
  FaLink,
  FaLocationDot,
  FaMicrophone,
  FaMinus,
  FaNoteSticky,
  FaObjectGroup,
  FaPen,
  FaPlus,
  FaRegCircle,
  FaRegClone,
  FaRegSquare,
  FaRotateRight,
  FaFloppyDisk,
  FaShareNodes,
  FaShapes,
  FaTrash,
  FaUnderline,
  FaUsers,
  FaVideo,
  FaWandMagicSparkles,
} from "react-icons/fa6";
import "./whiteboard.css";

const CANVAS_WIDTH = 5200;
const CANVAS_HEIGHT = 3400;
const GRID_SIZE = 40;
const MAX_HISTORY = 60;

const colors = ["#2563eb", "#10b981", "#f59e0b", "#ef4444", "#7c3aed", "#111827", "#ffffff"];

const collaborators = [
  { id: "u1", name: "Mekdes", role: "Owner", color: "#10b981", x: 1120, y: 640, area: "API Gateway" },
  { id: "u2", name: "Dawit", role: "Editor", color: "#2563eb", x: 1710, y: 880, area: "Payments" },
  { id: "u3", name: "Sara", role: "Viewer", color: "#f59e0b", x: 2210, y: 720, area: "Database" },
];

const templateGroups = [
  {
    title: "System Design",
    items: ["Microservices", "API Gateway", "Database Sharding", "CDN Architecture", "Telebirr Flow"],
  },
  {
    title: "UML",
    items: ["Class Diagram", "Sequence Diagram", "Activity Diagram", "Use Case", "Component Map"],
  },
  {
    title: "Flowcharts",
    items: ["Login Flow", "Decision Tree", "Algorithm Trace", "Support Flow", "CBE Payment"],
  },
  {
    title: "Brainstorm",
    items: ["Mind Map", "SWOT", "Retrospective", "Affinity Map", "Ethiopian Startup Map"],
  },
];

const initialElements = [
  {
    id: "shape-api",
    type: "server",
    x: 880,
    y: 520,
    width: 230,
    height: 120,
    label: "API Gateway",
    fill: "#e0f2fe",
    stroke: "#0284c7",
    strokeWidth: 3,
    layer: 1,
  },
  {
    id: "shape-auth",
    type: "rect",
    x: 1270,
    y: 380,
    width: 210,
    height: 110,
    label: "Auth Service",
    fill: "#dcfce7",
    stroke: "#16a34a",
    strokeWidth: 3,
    layer: 2,
  },
  {
    id: "shape-pay",
    type: "rect",
    x: 1270,
    y: 660,
    width: 230,
    height: 110,
    label: "Telebirr / CBE",
    fill: "#fef3c7",
    stroke: "#d97706",
    strokeWidth: 3,
    layer: 3,
  },
  {
    id: "shape-db",
    type: "database",
    x: 1770,
    y: 520,
    width: 210,
    height: 150,
    label: "MongoDB Cluster",
    fill: "#ede9fe",
    stroke: "#7c3aed",
    strokeWidth: 3,
    layer: 4,
  },
  {
    id: "note-1",
    type: "sticky",
    x: 750,
    y: 800,
    width: 245,
    height: 150,
    label: "Interview focus:\nlatency, failure modes,\nregional payment flows",
    fill: "#fef08a",
    stroke: "#ca8a04",
    strokeWidth: 2,
    layer: 5,
  },
  {
    id: "conn-1",
    type: "arrow",
    x: 1110,
    y: 580,
    x2: 1270,
    y2: 435,
    stroke: "#334155",
    strokeWidth: 3,
    layer: 6,
  },
  {
    id: "conn-2",
    type: "arrow",
    x: 1110,
    y: 600,
    x2: 1270,
    y2: 715,
    stroke: "#334155",
    strokeWidth: 3,
    layer: 7,
  },
  {
    id: "conn-3",
    type: "arrow",
    x: 1500,
    y: 580,
    x2: 1770,
    y2: 590,
    stroke: "#334155",
    strokeWidth: 3,
    layer: 8,
  },
];

const makeId = () => `el-${Date.now()}-${Math.random().toString(16).slice(2)}`;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function downloadFile(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export default function Whiteboard() {
  const boardRef = useRef(null);
  const imageInputRef = useRef(null);
  const [tool, setTool] = useState("select");
  const [elements, setElements] = useState(initialElements);
  const [selectedId, setSelectedId] = useState("shape-api");
  const [draft, setDraft] = useState(null);
  const [drag, setDrag] = useState(null);
  const [view, setView] = useState({ x: -520, y: -260, zoom: 0.82 });
  const [stroke, setStroke] = useState("#2563eb");
  const [fill, setFill] = useState("#ffffff");
  const [strokeWidth, setStrokeWidth] = useState(4);
  const [showGrid, setShowGrid] = useState(true);
  const [snap, setSnap] = useState(true);
  const [rightPanel, setRightPanel] = useState("layers");
  const [history, setHistory] = useState([initialElements]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [chat, setChat] = useState([
    { id: 1, user: "Mekdes", text: "Let's map login, payments, and failure recovery.", time: "10:00" },
    { id: 2, user: "Dawit", text: "@Sara can you verify the MongoDB shard boundary?", time: "10:02" },
  ]);
  const [chatText, setChatText] = useState("");
  const [comments, setComments] = useState([
    { id: 1, element: "Telebirr / CBE", author: "Sara", text: "Add callback retry and reconciliation job.", resolved: false },
    { id: 2, element: "MongoDB Cluster", author: "Mekdes", text: "Mark PII collections before export.", resolved: true },
  ]);
  const [savedAt, setSavedAt] = useState("just now");
  const [connection, setConnection] = useState("Live");

  const selected = elements.find((element) => element.id === selectedId);
  const sortedElements = useMemo(() => [...elements].sort((a, b) => a.layer - b.layer), [elements]);

  const pushHistory = useCallback(
    (nextElements) => {
      const nextHistory = history.slice(0, historyIndex + 1).concat([nextElements]).slice(-MAX_HISTORY);
      setHistory(nextHistory);
      setHistoryIndex(nextHistory.length - 1);
    },
    [history, historyIndex]
  );

  const commitElements = useCallback(
    (nextElements) => {
      setElements(nextElements);
      pushHistory(nextElements);
      setSavedAt("saving...");
      window.setTimeout(() => setSavedAt(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })), 450);
    },
    [pushHistory]
  );

  const screenToWorld = (event) => {
    const rect = boardRef.current.getBoundingClientRect();
    const x = (event.clientX - rect.left) / view.zoom - view.x;
    const y = (event.clientY - rect.top) / view.zoom - view.y;
    return snap ? { x: Math.round(x / 10) * 10, y: Math.round(y / 10) * 10 } : { x, y };
  };

  const addElement = (type, overrides = {}) => {
    const base = {
      id: makeId(),
      type,
      x: 1180 + elements.length * 16,
      y: 860 + elements.length * 12,
      width: type === "sticky" ? 240 : 210,
      height: type === "sticky" ? 150 : 118,
      label:
        type === "sticky"
          ? "New note"
          : type === "code"
          ? "const flow = await design();"
          : type === "database"
          ? "Database"
          : type === "cloud"
          ? "Cloud"
          : type === "ethiopia"
          ? "Ethiopia region map"
          : "New shape",
      fill: type === "sticky" ? "#fef08a" : fill,
      stroke,
      strokeWidth,
      layer: elements.length + 1,
      ...overrides,
    };
    commitElements([...elements, base]);
    setSelectedId(base.id);
    setTool("select");
  };

  const applyTemplate = (name) => {
    const startX = 860 + Math.random() * 120;
    const startY = 990 + Math.random() * 80;
    const nodes = [
      { type: "rect", label: "Client", x: startX, y: startY, fill: "#e0f2fe", stroke: "#0284c7" },
      { type: "server", label: name, x: startX + 330, y: startY, fill: "#dcfce7", stroke: "#16a34a" },
      { type: "database", label: "Data Store", x: startX + 690, y: startY, fill: "#ede9fe", stroke: "#7c3aed" },
      { type: "sticky", label: "Risks:\nrate limit\nobservability\nrollback plan", x: startX + 330, y: startY + 210, fill: "#fef08a", stroke: "#ca8a04" },
    ].map((item, index) => ({ id: makeId(), width: 220, height: index === 3 ? 150 : 120, strokeWidth: 3, layer: elements.length + index + 1, ...item }));
    const arrows = [
      { id: makeId(), type: "arrow", x: startX + 220, y: startY + 60, x2: startX + 330, y2: startY + 60, stroke: "#334155", strokeWidth: 3, layer: elements.length + 10 },
      { id: makeId(), type: "arrow", x: startX + 550, y: startY + 60, x2: startX + 690, y2: startY + 60, stroke: "#334155", strokeWidth: 3, layer: elements.length + 11 },
    ];
    commitElements([...elements, ...nodes, ...arrows]);
  };

  const runAiAction = (mode) => {
    setConnection("AI thinking");
    window.setTimeout(() => {
      if (mode === "recognize" && selected) {
        const next = elements.map((element) =>
          element.id === selected.id
            ? { ...element, type: element.width > element.height * 1.25 ? "rect" : "circle", label: `${element.label || "Shape"} (cleaned)` }
            : element
        );
        commitElements(next);
      }
      if (mode === "diagram") {
        applyTemplate("AI Login Flow");
      }
      if (mode === "layout") {
        const next = elements.map((element, index) =>
          element.type === "arrow"
            ? element
            : { ...element, x: 760 + (index % 4) * 340, y: 360 + Math.floor(index / 4) * 220 }
        );
        commitElements(next);
      }
      setConnection("Live");
    }, 700);
  };

  const getElementAt = (point) =>
    [...sortedElements]
      .reverse()
      .find((element) => {
        if (element.type === "arrow") {
          const minX = Math.min(element.x, element.x2) - 12;
          const maxX = Math.max(element.x, element.x2) + 12;
          const minY = Math.min(element.y, element.y2) - 12;
          const maxY = Math.max(element.y, element.y2) + 12;
          return point.x >= minX && point.x <= maxX && point.y >= minY && point.y <= maxY;
        }
        return point.x >= element.x && point.x <= element.x + element.width && point.y >= element.y && point.y <= element.y + element.height;
      });

  const onPointerDown = (event) => {
    const point = screenToWorld(event);
    if (tool === "hand" || event.button === 1 || event.altKey) {
      setDrag({ mode: "pan", startX: event.clientX, startY: event.clientY, view });
      return;
    }

    if (tool === "select") {
      const hit = getElementAt(point);
      setSelectedId(hit?.id || null);
      if (hit) setDrag({ mode: "move", id: hit.id, point, original: hit });
      return;
    }

    if (tool === "eraser") {
      const hit = getElementAt(point);
      if (hit) commitElements(elements.filter((element) => element.id !== hit.id));
      return;
    }

    if (["rect", "circle", "diamond", "arrow", "pen", "highlighter"].includes(tool)) {
      setDraft({
        id: "draft",
        type: tool === "highlighter" ? "pen" : tool,
        x: point.x,
        y: point.y,
        x2: point.x,
        y2: point.y,
        points: tool === "pen" || tool === "highlighter" ? [point] : undefined,
        fill: tool === "highlighter" ? "#fef08a66" : fill,
        stroke,
        strokeWidth: tool === "highlighter" ? 14 : strokeWidth,
        label: "",
      });
    }
  };

  const onPointerMove = (event) => {
    const point = screenToWorld(event);
    if (drag?.mode === "pan") {
      setView({
        ...view,
        x: drag.view.x + (event.clientX - drag.startX) / view.zoom,
        y: drag.view.y + (event.clientY - drag.startY) / view.zoom,
      });
      return;
    }

    if (drag?.mode === "move") {
      const dx = point.x - drag.point.x;
      const dy = point.y - drag.point.y;
      setElements((current) =>
        current.map((element) =>
          element.id === drag.id
            ? element.type === "arrow"
              ? { ...element, x: drag.original.x + dx, y: drag.original.y + dy, x2: drag.original.x2 + dx, y2: drag.original.y2 + dy }
              : { ...element, x: drag.original.x + dx, y: drag.original.y + dy }
            : element
        )
      );
      return;
    }

    if (draft) {
      setDraft((current) =>
        current.points
          ? { ...current, points: [...current.points, point], x2: point.x, y2: point.y }
          : { ...current, x2: point.x, y2: point.y }
      );
    }
  };

  const onPointerUp = () => {
    if (drag?.mode === "move") pushHistory(elements);
    setDrag(null);
    if (!draft) return;

    const normalized =
      draft.type === "arrow" || draft.points
        ? { ...draft, id: makeId(), layer: elements.length + 1 }
        : {
            ...draft,
            id: makeId(),
            x: Math.min(draft.x, draft.x2),
            y: Math.min(draft.y, draft.y2),
            width: Math.max(40, Math.abs(draft.x2 - draft.x)),
            height: Math.max(40, Math.abs(draft.y2 - draft.y)),
            label: "",
            layer: elements.length + 1,
          };
    const next = [...elements, normalized];
    setDraft(null);
    commitElements(next);
    setSelectedId(normalized.id);
    if (tool !== "pen" && tool !== "highlighter") setTool("select");
  };

  const updateSelected = (changes) => {
    if (!selectedId) return;
    commitElements(elements.map((element) => (element.id === selectedId ? { ...element, ...changes } : element)));
  };

  const deleteSelected = () => {
    if (!selectedId) return;
    commitElements(elements.filter((element) => element.id !== selectedId));
    setSelectedId(null);
  };

  const duplicateSelected = () => {
    if (!selected) return;
    const copy = { ...selected, id: makeId(), x: selected.x + 40, y: selected.y + 40, layer: elements.length + 1 };
    commitElements([...elements, copy]);
    setSelectedId(copy.id);
  };

  const undo = () => {
    if (historyIndex === 0) return;
    const index = historyIndex - 1;
    setHistoryIndex(index);
    setElements(history[index]);
  };

  const redo = () => {
    if (historyIndex >= history.length - 1) return;
    const index = historyIndex + 1;
    setHistoryIndex(index);
    setElements(history[index]);
  };

  const exportJson = () => downloadFile("ethiocode-whiteboard.json", JSON.stringify({ elements, view, comments }, null, 2), "application/json");

  const exportSvg = () => {
    const markup = document.querySelector(".whiteboard-world-svg")?.outerHTML || "";
    downloadFile("ethiocode-whiteboard.svg", markup, "image/svg+xml");
  };

  const exportPng = () => {
    const svg = document.querySelector(".whiteboard-world-svg")?.outerHTML || "";
    const image = new Image();
    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 1920;
      canvas.height = 1080;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#f8fafc";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, -550, -210, CANVAS_WIDTH * 0.52, CANVAS_HEIGHT * 0.52);
      canvas.toBlob((pngBlob) => {
        const pngUrl = URL.createObjectURL(pngBlob);
        const anchor = document.createElement("a");
        anchor.href = pngUrl;
        anchor.download = "ethiocode-whiteboard.png";
        anchor.click();
        URL.revokeObjectURL(pngUrl);
      });
      URL.revokeObjectURL(url);
    };
    image.src = url;
  };

  const onWheel = (event) => {
    if (!event.ctrlKey && !event.metaKey) return;
    event.preventDefault();
    const nextZoom = clamp(view.zoom - event.deltaY * 0.001, 0.1, 10);
    setView({ ...view, zoom: nextZoom });
  };

  const sendMessage = () => {
    if (!chatText.trim()) return;
    setChat([...chat, { id: Date.now(), user: "You", text: chatText, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }]);
    setChatText("");
  };

  const onImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => addElement("image", { imageUrl: reader.result, label: file.name, fill: "#ffffff", stroke: "#cbd5e1", width: 280, height: 170 });
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    const onKey = (event) => {
      if (event.target.tagName === "INPUT" || event.target.tagName === "TEXTAREA") return;
      const key = event.key.toLowerCase();
      if ((event.ctrlKey || event.metaKey) && key === "z") undo();
      if ((event.ctrlKey || event.metaKey) && key === "y") redo();
      if (key === "delete" || key === "backspace") deleteSelected();
      if (key === "p") setTool("pen");
      if (key === "h") setTool("highlighter");
      if (key === "e") setTool("eraser");
      if (key === "v") setTool("select");
      if (key === " ") setTool("hand");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  useEffect(() => {
    const interval = window.setInterval(() => setSavedAt(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })), 5000);
    return () => window.clearInterval(interval);
  }, []);

  const renderElement = (element) => {
    const common = {
      key: element.id,
      className: `wb-element ${selectedId === element.id ? "selected" : ""}`,
      onPointerDown: (event) => {
        event.stopPropagation();
        if (tool === "select") {
          setSelectedId(element.id);
          const point = screenToWorld(event);
          setDrag({ mode: "move", id: element.id, point, original: element });
        }
      },
    };

    if (element.type === "arrow") {
      return (
        <g {...common}>
          <line x1={element.x} y1={element.y} x2={element.x2} y2={element.y2} stroke={element.stroke} strokeWidth={element.strokeWidth} markerEnd="url(#arrowhead)" />
        </g>
      );
    }

    if (element.points) {
      const path = element.points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
      return <path {...common} d={path} fill="none" stroke={element.stroke} strokeWidth={element.strokeWidth} strokeLinecap="round" strokeLinejoin="round" opacity={element.fill?.includes("66") ? 0.55 : 1} />;
    }

    if (element.type === "circle") {
      return (
        <g {...common}>
          <ellipse cx={element.x + element.width / 2} cy={element.y + element.height / 2} rx={element.width / 2} ry={element.height / 2} fill={element.fill} stroke={element.stroke} strokeWidth={element.strokeWidth} />
          {renderLabel(element)}
        </g>
      );
    }

    if (element.type === "diamond") {
      const points = `${element.x + element.width / 2},${element.y} ${element.x + element.width},${element.y + element.height / 2} ${element.x + element.width / 2},${element.y + element.height} ${element.x},${element.y + element.height / 2}`;
      return (
        <g {...common}>
          <polygon points={points} fill={element.fill} stroke={element.stroke} strokeWidth={element.strokeWidth} />
          {renderLabel(element)}
        </g>
      );
    }

    if (element.type === "database") {
      return (
        <g {...common}>
          <rect x={element.x} y={element.y + 18} width={element.width} height={element.height - 36} fill={element.fill} stroke={element.stroke} strokeWidth={element.strokeWidth} />
          <ellipse cx={element.x + element.width / 2} cy={element.y + 18} rx={element.width / 2} ry={18} fill={element.fill} stroke={element.stroke} strokeWidth={element.strokeWidth} />
          <ellipse cx={element.x + element.width / 2} cy={element.y + element.height - 18} rx={element.width / 2} ry={18} fill="none" stroke={element.stroke} strokeWidth={element.strokeWidth} />
          {renderLabel(element)}
        </g>
      );
    }

    if (element.type === "cloud") {
      return (
        <g {...common}>
          <path d={`M ${element.x + 45} ${element.y + 85} C ${element.x + 10} ${element.y + 80}, ${element.x + 20} ${element.y + 35}, ${element.x + 70} ${element.y + 45} C ${element.x + 95} ${element.y - 5}, ${element.x + 170} ${element.y + 15}, ${element.x + 175} ${element.y + 55} C ${element.x + 230} ${element.y + 45}, ${element.x + 250} ${element.y + 105}, ${element.x + 195} ${element.y + 115} L ${element.x + 55} ${element.y + 115} C ${element.x + 25} ${element.y + 115}, ${element.x + 20} ${element.y + 90}, ${element.x + 45} ${element.y + 85} Z`} fill={element.fill} stroke={element.stroke} strokeWidth={element.strokeWidth} />
          {renderLabel({ ...element, y: element.y + 20 })}
        </g>
      );
    }

    if (element.type === "ethiopia") {
      return (
        <g {...common}>
          <path d={`M${element.x + 75} ${element.y + 5} L${element.x + 165} ${element.y + 20} L${element.x + 205} ${element.y + 85} L${element.x + 170} ${element.y + 145} L${element.x + 98} ${element.y + 130} L${element.x + 42} ${element.y + 165} L${element.x + 18} ${element.y + 95} L${element.x + 55} ${element.y + 55} Z`} fill={element.fill} stroke={element.stroke} strokeWidth={element.strokeWidth} />
          {renderLabel(element)}
        </g>
      );
    }

    if (element.type === "image") {
      return (
        <g {...common}>
          <rect x={element.x} y={element.y} width={element.width} height={element.height} fill="#fff" stroke={element.stroke} strokeWidth={element.strokeWidth} />
          <image href={element.imageUrl} x={element.x + 8} y={element.y + 8} width={element.width - 16} height={element.height - 38} preserveAspectRatio="xMidYMid meet" />
          <text x={element.x + 14} y={element.y + element.height - 12} className="wb-small-text">{element.label}</text>
        </g>
      );
    }

    return (
      <g {...common}>
        <rect x={element.x} y={element.y} width={element.width} height={element.height} rx={element.type === "sticky" ? 6 : element.type === "server" ? 4 : 8} fill={element.fill} stroke={element.stroke} strokeWidth={element.strokeWidth} strokeDasharray={element.type === "code" ? "8 6" : ""} />
        {element.type === "server" && [24, 48, 72].map((offset) => <line key={offset} x1={element.x + 14} x2={element.x + element.width - 14} y1={element.y + offset} y2={element.y + offset} stroke={element.stroke} strokeWidth="1.5" opacity="0.45" />)}
        {renderLabel(element)}
      </g>
    );
  };

  const renderLabel = (element) => {
    if (!element.label) return null;
    const lines = element.label.split("\n");
    return (
      <text x={element.x + element.width / 2} y={element.y + element.height / 2 - (lines.length - 1) * 11} textAnchor="middle" className={element.type === "code" ? "wb-code-text" : "wb-label"}>
        {lines.map((line, index) => (
          <tspan key={line + index} x={element.x + element.width / 2} dy={index === 0 ? 0 : 22}>
            {line}
          </tspan>
        ))}
      </text>
    );
  };

  return (
    <main className="wb-shell">
      <section className="wb-topbar">
        <div className="wb-title">
          <span className="wb-logo">E</span>
          <div>
            <h1>EthioCode Collaborative Whiteboard</h1>
            <p>System design, interviews, AI diagrams, Ethiopian payment flows</p>
          </div>
        </div>
        <div className="wb-menu">
          <button onClick={undo} title="Undo"><FaRotateRight className="flip" />Undo</button>
          <button onClick={redo} title="Redo"><FaRotateRight />Redo</button>
          <button onClick={() => commitElements(elements)} title="Save"><FaFloppyDisk />Save</button>
          <button onClick={exportJson} title="Export JSON"><FaDownload />JSON</button>
          <button onClick={exportSvg} title="Export SVG"><FaFileExport />SVG</button>
          <button onClick={exportPng} title="Export PNG"><FaImage />PNG</button>
          <button className="primary"><FaShareNodes />Share</button>
        </div>
      </section>

      <section className="wb-workspace">
        <aside className="wb-toolbar" aria-label="Whiteboard tools">
          <ToolButton icon={<FaArrowPointer />} label="Select" active={tool === "select"} onClick={() => setTool("select")} />
          <ToolButton icon={<FaHand />} label="Pan" active={tool === "hand"} onClick={() => setTool("hand")} />
          <ToolButton icon={<FaPen />} label="Pen" active={tool === "pen"} onClick={() => setTool("pen")} />
          <ToolButton icon={<FaHighlighter />} label="Highlighter" active={tool === "highlighter"} onClick={() => setTool("highlighter")} />
          <ToolButton icon={<FaEraser />} label="Eraser" active={tool === "eraser"} onClick={() => setTool("eraser")} />
          <div className="wb-tool-divider" />
          <ToolButton icon={<FaRegSquare />} label="Rectangle" active={tool === "rect"} onClick={() => setTool("rect")} />
          <ToolButton icon={<FaRegCircle />} label="Circle" active={tool === "circle"} onClick={() => setTool("circle")} />
          <ToolButton icon={<FaShapes />} label="Diamond" active={tool === "diamond"} onClick={() => setTool("diamond")} />
          <ToolButton icon={<FaMinus />} label="Arrow" active={tool === "arrow"} onClick={() => setTool("arrow")} />
          <div className="wb-tool-divider" />
          <ToolButton icon={<FaNoteSticky />} label="Sticky" onClick={() => addElement("sticky")} />
          <ToolButton icon={<FaCode />} label="Code" onClick={() => addElement("code")} />
          <ToolButton icon={<FaDatabase />} label="Database" onClick={() => addElement("database")} />
          <ToolButton icon={<FaLocationDot />} label="Ethiopia" onClick={() => addElement("ethiopia", { fill: "#dcfce7", stroke: "#15803d" })} />
          <ToolButton icon={<FaImage />} label="Image" onClick={() => imageInputRef.current?.click()} />
          <input ref={imageInputRef} className="hidden-input" type="file" accept="image/*" onChange={onImageUpload} />
        </aside>

        <aside className="wb-left-panel">
          <PanelSection title="Style">
            <div className="wb-colors">
              {colors.map((color) => (
                <button key={color} className={stroke === color ? "active" : ""} style={{ background: color }} onClick={() => setStroke(color)} title={color} />
              ))}
              <input type="color" value={stroke} onChange={(event) => setStroke(event.target.value)} />
            </div>
            <label>
              Stroke
              <input type="range" min="1" max="18" value={strokeWidth} onChange={(event) => setStrokeWidth(Number(event.target.value))} />
            </label>
            <label>
              Fill
              <input type="color" value={fill} onChange={(event) => setFill(event.target.value)} />
            </label>
            <div className="wb-switches">
              <button className={showGrid ? "active" : ""} onClick={() => setShowGrid(!showGrid)}><FaGrip />Grid</button>
              <button className={snap ? "active" : ""} onClick={() => setSnap(!snap)}><FaObjectGroup />Snap</button>
            </div>
          </PanelSection>

          <PanelSection title="AI">
            <button className="wb-ai" onClick={() => runAiAction("recognize")}><FaWandMagicSparkles />Shape recognition</button>
            <button className="wb-ai" onClick={() => runAiAction("diagram")}><FaWandMagicSparkles />Text to diagram</button>
            <button className="wb-ai" onClick={() => runAiAction("layout")}><FaWandMagicSparkles />Smart layout</button>
          </PanelSection>

          <PanelSection title="Templates">
            {templateGroups.map((group) => (
              <details key={group.title} open={group.title === "System Design"}>
                <summary>{group.title}</summary>
                {group.items.map((item) => (
                  <button key={item} className="wb-template" onClick={() => applyTemplate(item)}>
                    {item}
                  </button>
                ))}
              </details>
            ))}
          </PanelSection>
        </aside>

        <section
          ref={boardRef}
          className={`wb-board tool-${tool}`}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
          onWheel={onWheel}
        >
          <svg
            className="whiteboard-world-svg"
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
            style={{ transform: `scale(${view.zoom}) translate(${view.x}px, ${view.y}px)` }}
          >
            <defs>
              <marker id="arrowhead" markerWidth="14" markerHeight="10" refX="12" refY="5" orient="auto">
                <polygon points="0 0, 14 5, 0 10" fill="#334155" />
              </marker>
              <pattern id="grid" width={GRID_SIZE} height={GRID_SIZE} patternUnits="userSpaceOnUse">
                <path d={`M ${GRID_SIZE} 0 L 0 0 0 ${GRID_SIZE}`} fill="none" stroke="#dbe4ef" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width={CANVAS_WIDTH} height={CANVAS_HEIGHT} fill="#f8fafc" />
            {showGrid && <rect width={CANVAS_WIDTH} height={CANVAS_HEIGHT} fill="url(#grid)" />}
            <text x="760" y="270" className="wb-board-heading">Real-time interview architecture board</text>
            <text x="760" y="310" className="wb-board-subtitle">Zoom with Ctrl + wheel. Drag shapes. Use AI actions for recognition, generation, and layout.</text>
            {sortedElements.map(renderElement)}
            {draft && renderElement(draft)}
            {collaborators.map((user) => (
              <g key={user.id} className="wb-cursor">
                <path d={`M ${user.x} ${user.y} L ${user.x + 16} ${user.y + 42} L ${user.x + 26} ${user.y + 25} L ${user.x + 46} ${user.y + 25} Z`} fill={user.color} />
                <rect x={user.x + 34} y={user.y + 26} width="112" height="30" rx="15" fill={user.color} />
                <text x={user.x + 48} y={user.y + 46}>{user.name}</text>
              </g>
            ))}
          </svg>

          <div className="wb-minimap">
            <div className="wb-mini-title">Mini-map</div>
            <div className="wb-mini-canvas">
              {elements.filter((element) => element.type !== "arrow").map((element) => (
                <span key={element.id} style={{ left: `${(element.x / CANVAS_WIDTH) * 100}%`, top: `${(element.y / CANVAS_HEIGHT) * 100}%`, width: `${Math.max(3, (element.width / CANVAS_WIDTH) * 100)}%`, height: `${Math.max(3, (element.height / CANVAS_HEIGHT) * 100)}%`, background: element.stroke }} />
              ))}
              <b style={{ left: `${Math.abs(view.x / CANVAS_WIDTH) * 100}%`, top: `${Math.abs(view.y / CANVAS_HEIGHT) * 100}%` }} />
            </div>
          </div>
        </section>

        <aside className="wb-right-panel">
          <div className="wb-tabs">
            <button className={rightPanel === "layers" ? "active" : ""} onClick={() => setRightPanel("layers")}><FaLayerGroup /></button>
            <button className={rightPanel === "comments" ? "active" : ""} onClick={() => setRightPanel("comments")}><FaComments /></button>
            <button className={rightPanel === "presence" ? "active" : ""} onClick={() => setRightPanel("presence")}><FaUsers /></button>
          </div>

          {rightPanel === "layers" && (
            <div className="wb-panel-body">
              <h2>Layers</h2>
              <div className="wb-layer-actions">
                <button onClick={duplicateSelected}><FaRegClone />Duplicate</button>
                <button onClick={deleteSelected}><FaTrash />Delete</button>
              </div>
              <div className="wb-layers">
                {[...sortedElements].reverse().map((element) => (
                  <button key={element.id} className={selectedId === element.id ? "active" : ""} onClick={() => setSelectedId(element.id)}>
                    <span>{element.type}</span>
                    <strong>{element.label || element.id}</strong>
                  </button>
                ))}
              </div>
              {selected && (
                <div className="wb-properties">
                  <h3>Properties</h3>
                  <label>Label<textarea value={selected.label || ""} onChange={(event) => updateSelected({ label: event.target.value })} /></label>
                  <div className="wb-prop-grid">
                    <label>X<input type="number" value={Math.round(selected.x)} onChange={(event) => updateSelected({ x: Number(event.target.value) })} /></label>
                    <label>Y<input type="number" value={Math.round(selected.y)} onChange={(event) => updateSelected({ y: Number(event.target.value) })} /></label>
                    {"width" in selected && <label>W<input type="number" value={Math.round(selected.width)} onChange={(event) => updateSelected({ width: Number(event.target.value) })} /></label>}
                    {"height" in selected && <label>H<input type="number" value={Math.round(selected.height)} onChange={(event) => updateSelected({ height: Number(event.target.value) })} /></label>}
                  </div>
                  <div className="wb-format-row">
                    <button><FaBold /></button><button><FaItalic /></button><button><FaUnderline /></button><button><FaLink /></button>
                  </div>
                </div>
              )}
            </div>
          )}

          {rightPanel === "comments" && (
            <div className="wb-panel-body">
              <h2>Comments</h2>
              {comments.map((comment) => (
                <article key={comment.id} className={comment.resolved ? "resolved" : ""}>
                  <strong>{comment.author}</strong>
                  <span>{comment.element}</span>
                  <p>{comment.text}</p>
                  <button onClick={() => setComments(comments.map((item) => (item.id === comment.id ? { ...item, resolved: !item.resolved } : item)))}>{comment.resolved ? "Reopen" : "Resolve"}</button>
                </article>
              ))}
            </div>
          )}

          {rightPanel === "presence" && (
            <div className="wb-panel-body">
              <h2>Presence</h2>
              {collaborators.map((user) => (
                <div key={user.id} className="wb-person">
                  <span style={{ background: user.color }}>{user.name.slice(0, 1)}</span>
                  <div><strong>{user.name}</strong><small>{user.role} viewing {user.area}</small></div>
                </div>
              ))}
              <div className="wb-call">
                <button><FaMicrophone />Voice</button>
                <button><FaVideo />Video</button>
              </div>
            </div>
          )}
        </aside>
      </section>

      <footer className="wb-bottom">
        <div>
          <button onClick={() => setView({ ...view, zoom: clamp(view.zoom - 0.1, 0.1, 10) })}><FaMinus /></button>
          <span>{Math.round(view.zoom * 100)}%</span>
          <button onClick={() => setView({ ...view, zoom: clamp(view.zoom + 0.1, 0.1, 10) })}><FaPlus /></button>
          <button onClick={() => setView({ x: -520, y: -260, zoom: 0.82 })}>Fit</button>
        </div>
        <div className="wb-status"><span className="live-dot" />{connection} collaboration</div>
        <div>{elements.length} elements | {history.length} history states | saved {savedAt}</div>
        <div className="wb-chat">
          <input value={chatText} onChange={(event) => setChatText(event.target.value)} onKeyDown={(event) => event.key === "Enter" && sendMessage()} placeholder={chat.at(-1)?.text || "Message collaborators"} />
          <button onClick={sendMessage}>Send</button>
        </div>
      </footer>
    </main>
  );
}

function ToolButton({ icon, label, active, onClick }) {
  return (
    <button className={active ? "active" : ""} onClick={onClick} title={label} type="button">
      {icon}
      <span>{label}</span>
    </button>
  );
}

function PanelSection({ title, children }) {
  return (
    <section className="wb-panel-section">
      <h2>{title}</h2>
      {children}
    </section>
  );
}
