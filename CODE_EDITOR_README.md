# 🚀 EthioCode Online Code Editor

## ✅ Features Implemented

### Core Features
- ✅ Monaco Editor (VS Code editor)
- ✅ 16+ Programming Languages
- ✅ Real Code Execution (Docker + Subprocess)
- ✅ Syntax Highlighting
- ✅ Auto-completion
- ✅ Multiple File Tabs
- ✅ Dark/Light Themes
- ✅ Stdin Support
- ✅ Code Templates
- ✅ Save/Load Snippets
- ✅ Download Code
- ✅ Copy to Clipboard
- ✅ Share Code
- ✅ Execution Stats (time, memory)
- ✅ Fullscreen Mode
- ✅ Keyboard Shortcuts

### Supported Languages
🐍 Python | 🟡 JavaScript | 🔷 TypeScript | ☕ Java | ⚙️ C++ | 🔧 C | 🐹 Go | 🦀 Rust | 🔷 C# | 💎 Ruby | 🐘 PHP | 🦅 Swift | 🎯 Kotlin | 📊 R | 🐪 Perl | 🎭 Scala

## 🎯 Quick Start

### 1. Start Backend
```bash
cd backend
python run.py
```

### 2. Start Frontend
```bash
cd frontend
npm run dev
```

### 3. Access Editor
```
http://localhost:5173/code-editor
```

## 🔌 API Endpoints

### Execute Code
```bash
POST /api/v1/code/run
{
  "code": "print('Hello')",
  "language": "python",
  "stdin": ""
}
```

### Get Languages
```bash
GET /api/v1/code/languages
```

### Save Snippet
```bash
POST /api/v1/code/snippets
{
  "title": "My Code",
  "language": "python",
  "code": "print('Hello')",
  "is_public": false
}
```

### Get Templates
```bash
GET /api/v1/code/templates?language=python
```

## ⌨️ Keyboard Shortcuts

- `Ctrl+Enter` - Run Code
- `Ctrl+S` - Save Code
- `Ctrl+/` - Toggle Comment
- `Ctrl+F` - Find
- `Ctrl+H` - Replace
- `F11` - Fullscreen

## 🐳 Docker Setup (Optional)

For secure isolated execution:

```bash
# Build containers
docker-compose -f docker-compose.code-runners.yml build

# Or pull images
docker pull python:3.11-slim
docker pull node:20-slim
docker pull openjdk:17-slim
docker pull gcc:latest
```

**Note:** Editor works without Docker using subprocess fallback.

## 📊 Database Collections

### code_snippets
```javascript
{
  user_id: ObjectId,
  title: String,
  language: String,
  code: String,
  is_public: Boolean,
  tags: [String],
  views: Number,
  likes: Number,
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

## 🔒 Security Features

- Docker isolation (when available)
- Network disabled in containers
- Memory limits (512MB-1GB)
- CPU limits (1 core)
- 10-second timeout
- Read-only filesystem
- Non-root execution
- Code caching

## 🎨 Customization

### Change Theme
Click Settings icon → Select theme (Dark/Light/High Contrast)

### Change Font Size
Click Settings icon → Adjust font size (10-30px)

### Add New Language
Edit `backend/app/api/v1/code.py` → Add to `LANGUAGE_CONFIGS`

## 🚀 Production Deployment

1. Enable Docker for security
2. Set up rate limiting
3. Add user authentication
4. Configure CDN for Monaco assets
5. Enable code execution monitoring
6. Set up logging and alerts

## 📝 Example Usage

### Python
```python
def greet(name):
    return f"Hello, {name}!"

print(greet("EthioCode"))
```

### JavaScript
```javascript
function greet(name) {
    return `Hello, ${name}!`;
}

console.log(greet("EthioCode"));
```

### Java
```java
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, EthioCode!");
    }
}
```

## 🐛 Troubleshooting

### Code not executing?
- Check backend is running on port 8000
- Check browser console for errors
- Verify language is supported

### Docker errors?
- Install Docker Desktop
- Start Docker service
- Pull required images
- Or use subprocess fallback

### Monaco editor not loading?
- Check internet connection (CDN)
- Clear browser cache
- Check console for errors

## 🎯 Next Steps

- [ ] Add collaborative editing (WebSocket)
- [ ] Add AI code completion
- [ ] Add code formatting
- [ ] Add linting
- [ ] Add debugging support
- [ ] Add test runner UI
- [ ] Add code sharing with links
- [ ] Add syntax error highlighting
- [ ] Add code execution history
- [ ] Add performance metrics

## 📞 Support

For issues or questions:
- GitHub: [EthioCode Repository]
- Email: support@ethiocode.com
- Discord: [EthioCode Community]

---

**Built with ❤️ for Ethiopian Developers 🇪🇹**
