import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import axios from 'axios';
import {
    FiPlay,
    FiSave,
    FiCopy,
    FiDownload,
    FiPlus,
    FiTrash2,
    FiSettings,
    FiTerminal,
    FiCode,
    FiUpload,
    FiShare2,
    FiMaximize2,
    FiMinimize2
} from 'react-icons/fi';
import './code-editor.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const API = API_BASE.endsWith('/api/v1') ? API_BASE : `${API_BASE}/api/v1`;

console.log('Code Editor API URL:', API);

const CodeEditorPage = () => {
    const [code, setCode] = useState(`# Welcome to EthioCode Editor
# Write your code here and click Run to execute

def greet(name):
    return f"Hello, {name}!"

if __name__ == "__main__":
    print(greet("Ethiopian Developers"))
    print("🇪🇹 Happy Coding!")
`);

    const [language, setLanguage] = useState('python');
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [error, setError] = useState('');
    const [isRunning, setIsRunning] = useState(false);
    const [executionTime, setExecutionTime] = useState(null);
    const [memoryUsed, setMemoryUsed] = useState(null);
    const [fileName, setFileName] = useState('main.py');
    const [files, setFiles] = useState([
        { id: 1, name: 'main.py', language: 'python', content: code }
    ]);
    const [activeFileId, setActiveFileId] = useState(1);
    const [showInput, setShowInput] = useState(false);
    const [theme, setTheme] = useState('vs-dark');
    const [fontSize, setFontSize] = useState(14);
    const [showSettings, setShowSettings] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [supportedLanguages, setSupportedLanguages] = useState([]);
    const [snippets, setSnippets] = useState([]);
    const [showSnippets, setShowSnippets] = useState(false);

    const editorRef = useRef(null);
    const containerRef = useRef(null);

    const languages = [
        { id: 'python', name: 'Python', extension: '.py', icon: '🐍' },
        { id: 'javascript', name: 'JavaScript', extension: '.js', icon: '🟡' },
        { id: 'typescript', name: 'TypeScript', extension: '.ts', icon: '🔷' },
        { id: 'java', name: 'Java', extension: '.java', icon: '☕' },
        { id: 'cpp', name: 'C++', extension: '.cpp', icon: '⚙️' },
        { id: 'c', name: 'C', extension: '.c', icon: '🔧' },
        { id: 'go', name: 'Go', extension: '.go', icon: '🐹' },
        { id: 'rust', name: 'Rust', extension: '.rs', icon: '🦀' },
        { id: 'csharp', name: 'C#', extension: '.cs', icon: '🔷' },
        { id: 'ruby', name: 'Ruby', extension: '.rb', icon: '💎' },
        { id: 'php', name: 'PHP', extension: '.php', icon: '🐘' },
        { id: 'swift', name: 'Swift', extension: '.swift', icon: '🦅' },
        { id: 'kotlin', name: 'Kotlin', extension: '.kt', icon: '🎯' },
        { id: 'r', name: 'R', extension: '.r', icon: '📊' },
        { id: 'perl', name: 'Perl', extension: '.pl', icon: '🐪' },
        { id: 'scala', name: 'Scala', extension: '.scala', icon: '🎭' }
    ];

    useEffect(() => {
        fetchSupportedLanguages();
        loadSavedCode();
    }, []);

    const fetchSupportedLanguages = async () => {
        try {
            const response = await axios.get(`${API}/code/languages`);
            setSupportedLanguages(response.data.languages);
        } catch (err) {
            console.error('Failed to fetch languages:', err);
        }
    };

    const loadSavedCode = () => {
        const saved = localStorage.getItem('ethiocode_editor_state');
        if (saved) {
            try {
                const state = JSON.parse(saved);
                setCode(state.code || code);
                setLanguage(state.language || 'python');
                setFiles(state.files || files);
                setActiveFileId(state.activeFileId || 1);
            } catch (err) {
                console.error('Failed to load saved state:', err);
            }
        }
    };

    const saveEditorState = () => {
        const state = {
            code,
            language,
            files,
            activeFileId
        };
        localStorage.setItem('ethiocode_editor_state', JSON.stringify(state));
    };

    useEffect(() => {
        saveEditorState();
    }, [code, language, files, activeFileId]);

    const handleRunCode = async () => {
        setIsRunning(true);
        setOutput('');
        setError('');
        setExecutionTime(null);
        setMemoryUsed(null);

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `${API}/code/run`,
                {
                    code: code,
                    language: language,
                    stdin: input
                },
                {
                    headers: token ? { Authorization: `Bearer ${token}` } : {}
                }
            );

            if (response.data.status === 'success') {
                setOutput(response.data.output);
                setExecutionTime(response.data.execution_time_ms);
                setMemoryUsed(response.data.memory_used_mb);
            } else {
                setError(response.data.error || 'Execution failed');
                setExecutionTime(response.data.execution_time_ms);
            }
        } catch (err) {
            setError(err.response?.data?.detail || err.message || 'Execution failed');
        } finally {
            setIsRunning(false);
        }
    };

    const handleSave = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Please login to save snippets');
                return;
            }

            await axios.post(
                `${API}/code/snippets`,
                {
                    title: fileName.replace(/\.[^/.]+$/, ''),
                    language: language,
                    code: code,
                    is_public: false
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            alert('✅ Code saved successfully!');
        } catch (err) {
            alert('❌ Failed to save code: ' + (err.response?.data?.detail || err.message));
        }
    };

    const handleDownload = () => {
        const blob = new Blob([code], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        alert('📋 Code copied to clipboard!');
    };

    const handleShare = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Please login to share code');
                return;
            }

            const response = await axios.post(
                `${API}/code/snippets`,
                {
                    title: fileName.replace(/\.[^/.]+$/, ''),
                    language: language,
                    code: code,
                    is_public: true
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            const shareUrl = `${window.location.origin}/code-editor?snippet=${response.data.id}`;
            navigator.clipboard.writeText(shareUrl);
            alert('🔗 Share link copied to clipboard!');
        } catch (err) {
            alert('Failed to share code');
        }
    };

    const handleNewFile = () => {
        const lang = languages.find(l => l.id === language);
        const newId = Date.now();
        const newFile = {
            id: newId,
            name: `untitled${lang.extension}`,
            language: language,
            content: ''
        };
        setFiles([...files, newFile]);
        setActiveFileId(newId);
        setCode('');
        setFileName(newFile.name);
    };

    const handleFileChange = (fileId) => {
        // Save current file content
        const updatedFiles = files.map(f =>
            f.id === activeFileId ? { ...f, content: code } : f
        );
        setFiles(updatedFiles);

        // Switch to new file
        const file = updatedFiles.find(f => f.id === fileId);
        if (file) {
            setActiveFileId(fileId);
            setCode(file.content);
            setFileName(file.name);
            setLanguage(file.language);
        }
    };

    const handleDeleteFile = (fileId) => {
        if (files.length === 1) {
            alert('Cannot delete the last file');
            return;
        }

        const newFiles = files.filter(f => f.id !== fileId);
        setFiles(newFiles);

        if (activeFileId === fileId) {
            const newActiveFile = newFiles[0];
            setActiveFileId(newActiveFile.id);
            setCode(newActiveFile.content);
            setFileName(newActiveFile.name);
            setLanguage(newActiveFile.language);
        }
    };

    const handleLanguageChange = (newLanguage) => {
        setLanguage(newLanguage);
        const extension = languages.find(l => l.id === newLanguage)?.extension || '.txt';
        const newFileName = fileName.replace(/\.[^/.]+$/, '') + extension;
        setFileName(newFileName);

        // Update current file
        const updatedFiles = files.map(f =>
            f.id === activeFileId
                ? { ...f, language: newLanguage, name: newFileName }
                : f
        );
        setFiles(updatedFiles);
    };

    const handleEditorDidMount = (editor) => {
        editorRef.current = editor;

        // Add keyboard shortcuts
        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
            handleRunCode();
        });

        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
            handleSave();
        });
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current?.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    const loadTemplate = async () => {
        try {
            const response = await axios.get(`${API}/code/templates?language=${language}`);
            if (response.data.template) {
                setCode(response.data.template);
            }
        } catch (err) {
            console.error('Failed to load template:', err);
        }
    };

    return (
        <div ref={containerRef} className="code-editor-page">
            {/* Top Toolbar */}
            <div className="editor-toolbar">
                <div className="toolbar-left">
                    <div className="logo">
                        <FiCode className="logo-icon" />
                        <span>EthioCode Editor</span>
                    </div>

                    {/* File Tabs */}
                    <div className="file-tabs">
                        {files.map(file => (
                            <div
                                key={file.id}
                                className={`file-tab ${activeFileId === file.id ? 'active' : ''}`}
                                onClick={() => handleFileChange(file.id)}
                            >
                                <span className="file-icon">
                                    {languages.find(l => l.id === file.language)?.icon || '📄'}
                                </span>
                                <span className="file-name">{file.name}</span>
                                {files.length > 1 && (
                                    <button
                                        className="delete-file-btn"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteFile(file.id);
                                        }}
                                    >
                                        <FiTrash2 />
                                    </button>
                                )}
                            </div>
                        ))}
                        <button className="new-file-btn" onClick={handleNewFile}>
                            <FiPlus />
                        </button>
                    </div>
                </div>

                <div className="toolbar-right">
                    <select
                        value={language}
                        onChange={(e) => handleLanguageChange(e.target.value)}
                        className="language-select"
                    >
                        {languages.map(lang => (
                            <option key={lang.id} value={lang.id}>
                                {lang.icon} {lang.name}
                            </option>
                        ))}
                    </select>

                    <button onClick={loadTemplate} className="toolbar-btn" title="Load Template">
                        <FiUpload />
                    </button>

                    <button
                        onClick={handleRunCode}
                        disabled={isRunning}
                        className="run-btn"
                        title="Run Code (Ctrl+Enter)"
                    >
                        <FiPlay />
                        {isRunning ? 'Running...' : 'Run'}
                    </button>

                    <button onClick={handleSave} className="toolbar-btn" title="Save (Ctrl+S)">
                        <FiSave />
                    </button>

                    <button onClick={handleShare} className="toolbar-btn" title="Share">
                        <FiShare2 />
                    </button>

                    <button onClick={handleDownload} className="toolbar-btn" title="Download">
                        <FiDownload />
                    </button>

                    <button onClick={handleCopy} className="toolbar-btn" title="Copy">
                        <FiCopy />
                    </button>

                    <button
                        onClick={() => setShowSettings(!showSettings)}
                        className="toolbar-btn"
                        title="Settings"
                    >
                        <FiSettings />
                    </button>

                    <button onClick={toggleFullscreen} className="toolbar-btn" title="Fullscreen">
                        {isFullscreen ? <FiMinimize2 /> : <FiMaximize2 />}
                    </button>
                </div>
            </div>

            {/* Settings Panel */}
            {showSettings && (
                <div className="settings-panel">
                    <div className="setting-item">
                        <label>Theme:</label>
                        <select value={theme} onChange={(e) => setTheme(e.target.value)}>
                            <option value="vs-dark">Dark</option>
                            <option value="vs-light">Light</option>
                            <option value="hc-black">High Contrast</option>
                        </select>
                    </div>
                    <div className="setting-item">
                        <label>Font Size:</label>
                        <input
                            type="number"
                            value={fontSize}
                            onChange={(e) => setFontSize(Number(e.target.value))}
                            min="10"
                            max="30"
                        />
                    </div>
                </div>
            )}

            {/* Main Editor Area */}
            <div className="editor-container">
                {/* Code Editor */}
                <div className="editor-pane">
                    <Editor
                        height="100%"
                        language={language}
                        theme={theme}
                        value={code}
                        onChange={(value) => setCode(value || '')}
                        onMount={handleEditorDidMount}
                        options={{
                            fontSize: fontSize,
                            fontFamily: 'Fira Code, Consolas, Monaco, monospace',
                            fontLigatures: true,
                            minimap: { enabled: true },
                            scrollBeyondLastLine: false,
                            automaticLayout: true,
                            tabSize: 4,
                            wordWrap: 'on',
                            lineNumbers: 'on',
                            renderWhitespace: 'selection',
                            bracketPairColorization: { enabled: true },
                            suggestOnTriggerCharacters: true,
                            quickSuggestions: true,
                            formatOnPaste: true,
                            formatOnType: true
                        }}
                    />
                </div>

                {/* Output Panel */}
                <div className="output-pane">
                    <div className="output-header">
                        <div className="output-title">
                            <FiTerminal />
                            <span>Output</span>
                        </div>
                        <div className="output-actions">
                            <button
                                onClick={() => setShowInput(!showInput)}
                                className={`output-action-btn ${showInput ? 'active' : ''}`}
                            >
                                {showInput ? 'Hide Input' : 'Show Input'}
                            </button>
                            <button
                                onClick={() => {
                                    setOutput('');
                                    setError('');
                                }}
                                className="output-action-btn"
                            >
                                Clear
                            </button>
                        </div>
                    </div>

                    {/* Input Section */}
                    {showInput && (
                        <div className="input-section">
                            <label className="input-label">Input (stdin):</label>
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Enter input for your program..."
                                className="input-textarea"
                                rows={4}
                            />
                        </div>
                    )}

                    {/* Execution Stats */}
                    {(executionTime !== null || memoryUsed !== null) && (
                        <div className="execution-stats">
                            {executionTime !== null && (
                                <div className="stat">
                                    <span className="stat-label">Execution Time:</span>
                                    <span className="stat-value">{executionTime}ms</span>
                                </div>
                            )}
                            {memoryUsed !== null && memoryUsed > 0 && (
                                <div className="stat">
                                    <span className="stat-label">Memory Used:</span>
                                    <span className="stat-value">{memoryUsed.toFixed(2)}MB</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Output Display */}
                    <div className="output-content">
                        {isRunning && (
                            <div className="output-loading">
                                <div className="spinner"></div>
                                <span>Executing code...</span>
                            </div>
                        )}

                        {output && (
                            <pre className="output-text success">{output}</pre>
                        )}

                        {error && (
                            <pre className="output-text error">{error}</pre>
                        )}

                        {!output && !error && !isRunning && (
                            <div className="output-placeholder">
                                <FiTerminal className="placeholder-icon" />
                                <p>Click "Run" to execute your code</p>
                                <p className="placeholder-hint">Shortcut: Ctrl+Enter</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Status Bar */}
            <div className="status-bar">
                <div className="status-left">
                    <span>Language: {languages.find(l => l.id === language)?.name}</span>
                    <span>•</span>
                    <span>Lines: {code.split('\n').length}</span>
                    <span>•</span>
                    <span>Characters: {code.length}</span>
                </div>
                <div className="status-right">
                    <span>EthioCode Editor v1.0</span>
                </div>
            </div>
        </div>
    );
};

export default CodeEditorPage;
