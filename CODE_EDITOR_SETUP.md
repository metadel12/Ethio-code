# EthioCode Code Editor - Setup Guide

## 🚀 Quick Start

### 1. Build Docker Images (Optional - for better security)

```bash
# Build all language runner images
docker-compose -f docker-compose.code-runners.yml build

# Or pull official images (they'll be pulled automatically on first run)
docker pull python:3.11-slim
docker pull node:20-slim
docker pull openjdk:17-slim
docker pull gcc:latest
docker pull golang:1.21
docker pull rust:1.70
```

### 2. Backend Setup

The backend is already configured! The code execution endpoint is at:
- `POST /api/v1/code/run` - Execute code
- `GET /api/v1/code/languages` - Get supported languages
- `POST /api/v1/code/snippets` - Save code snippets
- `GET /api/v1/code/templates` - Get code templates

### 3. Frontend Setup

Already installed! Just access:
```
http://localhost:5173/code-editor
```

## 🎯 Features

### ✅ Implemented
- **16+ Programming Languages**: Python, JavaScript, TypeScript, Java, C++, C, Go, Rust, C#, Ruby, PHP, Swift, Kotlin, R, Perl, Scala
- **Monaco Editor**: Full VS Code editor experience
- **Real Code Execution**: Docker-based isolated execution
- **Multi-file Support**: Create and manage multiple files
- **Syntax Highlighting**: Language-specific highlighting
- **Auto-completion**: IntelliSense support
- **Input/Output**: stdin support and formatted output
- **Execution Stats**: Time and memory usage tracking
- **Code Saving**: Save snippets to database
- **Code Sharing**: Share code with public links
- **Download/Copy**: Export code easily
- **Templates**: Pre-built code templates
- **Dark Theme**: Professional VS Code dark theme
- **Keyboard Shortcuts**: Ctrl+Enter to run, Ctrl+S to save
- **Fullscreen Mode**: Distraction-free coding
- **Responsive Design**: Works on all devices

## 🐳 Docker Execution (Recommended)

### Security Features:
- ✅ Isolated containers per execution
- ✅ No network access
- ✅ Memory limits (512MB-1GB)
- ✅ CPU limits (1 core)
- ✅ Execution timeout (10-15s)
- ✅ Read-only filesystem
- ✅ Non-root user execution

### Fallback Mode:
If Docker is not available, the system automatically falls back to subprocess execution (less secure but functional).

## 📝 Usage Examples

### Python Example:
```python
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

for i in range(10):
    print(f"F({i}) = {fibonacci(i)}")
```

### JavaScript Example:
```javascript
function isPrime(num) {
    if (num <= 1) return false;
    for (let i = 2; i <= Math.sqrt(num); i++) {
        if (num % i === 0) return false;
    }
    return true;
}

for (let i = 1; i <= 20; i++) {
    if (isPrime(i)) console.log(i);
}
```

### Java Example:
```java
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello from EthioCode!");
        for (int i = 1; i <= 5; i++) {
            System.out.println("Count: " + i);
        }
    }
}
```

## 🔧 Configuration

### Backend Configuration (app/api/v1/code.py)

Modify language configs:
```python
LANGUAGE_CONFIGS = {
    "python": {
        "image": "python:3.11-slim",
        "timeout": 10,  # seconds
        "memory_limit": "512m"
    }
}
```

### Frontend Configuration

Modify editor settings in code-editor.jsx:
```javascript
const [fontSize, setFontSize] = useState(14);
const [theme, setTheme] = useState('vs-dark');
```

## 🎨 Customization

### Add New Language:

1. **Backend** (code.py):
```python
"newlang": {
    "image": "newlang:latest",
    "file": "script.ext",
    "cmd": ["newlang", "script.ext"],
    "timeout": 10,
    "memory_limit": "512m"
}
```

2. **Frontend** (code-editor.jsx):
```javascript
{ id: 'newlang', name: 'NewLang', extension: '.ext', icon: '🔥' }
```

## 🔒 Security Best Practices

1. **Always use Docker** for production
2. **Set resource limits** (memory, CPU, timeout)
3. **Disable network** in containers
4. **Use read-only filesystems**
5. **Run as non-root user**
6. **Implement rate limiting** (recommended)
7. **Add authentication** for saving/sharing

## 📊 Database Collections

### code_snippets
```javascript
{
  user_id: ObjectId,
  title: String,
  language: String,
  code: String,
  is_public: Boolean,
  created_at: Date
}
```

### code_execution_cache
```javascript
{
  code_hash: String,
  language: String,
  output: String,
  execution_time_ms: Number,
  created_at: Date
}
```

## 🚨 Troubleshooting

### Docker not found:
- Install Docker Desktop for Windows
- Or system will use subprocess fallback

### Monaco Editor not loading:
```bash
cd frontend
npm install @monaco-editor/react
```

### Execution timeout:
- Increase timeout in LANGUAGE_CONFIGS
- Check Docker container resources

### Memory issues:
- Increase memory_limit in configs
- Check Docker Desktop memory allocation

## 🎯 Keyboard Shortcuts

- `Ctrl + Enter` - Run code
- `Ctrl + S` - Save code
- `Ctrl + /` - Toggle comment
- `Ctrl + F` - Find
- `Ctrl + H` - Replace
- `Alt + Up/Down` - Move line
- `Ctrl + D` - Select next occurrence

## 📱 Mobile Support

The editor is fully responsive and works on:
- ✅ Desktop (optimal)
- ✅ Tablets (good)
- ✅ Mobile phones (basic)

## 🌟 Future Enhancements

- [ ] Collaborative editing (multiple users)
- [ ] AI code completion
- [ ] Debugging support
- [ ] Git integration
- [ ] Package manager support
- [ ] Custom themes
- [ ] Code formatting
- [ ] Linting support
- [ ] Test runner integration
- [ ] Performance profiling

## 📞 Support

For issues or questions:
- GitHub: [EthioCode Repository]
- Email: support@ethiocode.com
- Discord: [EthioCode Community]

---

**Built with ❤️ for Ethiopian Developers 🇪🇹**
