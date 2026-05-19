# Docker Setup Guide for EthioCode

## Overview

EthioCode uses Docker for containerization with three main configurations:

1. **Development** (`docker-compose.yml`) - For local development
2. **Production** (`docker-compose.prod.yml`) - For production deployment
3. **Code Runners** (`docker-compose.code-runners.yml`) - For secure code execution

---

## 📦 Services Architecture

### Development Environment

```yaml
Services:
├── frontend (Node.js 20)      → Port 5173
├── backend (Python/FastAPI)   → Port 8000
├── redis (Redis 7)            → Port 6379
└── postgres (PostgreSQL 16)   → Port 5432
```

### Production Environment

```yaml
Services:
├── nginx (Reverse Proxy)      → Ports 80, 443
├── frontend (Built React App)
├── backend (FastAPI)          → Port 8000
├── mongodb (MongoDB 7)        → Port 27017
├── redis (Redis 7)            → Port 6379
├── prometheus (Monitoring)    → Port 9090
└── grafana (Dashboards)       → Port 3001
```

### Code Runners (Isolated Execution)

```yaml
Runners:
├── python-runner (Python 3.13)
├── node-runner (Node.js 20)
├── java-runner (OpenJDK 17)
└── cpp-runner (GCC 13)
```

---

## 🚀 Quick Start

### Development Mode

```bash
# Start all development services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild after changes
docker-compose up -d --build
```

**Access:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs
- Redis: localhost:6379
- PostgreSQL: localhost:5432

### Production Mode

```bash
# Build and start production services
docker-compose -f docker-compose.prod.yml up -d --build

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Stop services
docker-compose -f docker-compose.prod.yml down
```

**Access:**
- Application: http://localhost (or your domain)
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3001

### Code Runners

```bash
# Build code runner images
docker-compose -f docker-compose.code-runners.yml build

# Images are used by backend for code execution
# They run in isolated, sandboxed environments
```

---

## 📁 Docker Files Structure

```
Ethio-code/
├── docker-compose.yml                    # Development
├── docker-compose.prod.yml               # Production
├── docker-compose.code-runners.yml       # Code execution
├── frontend/
│   └── Dockerfile                        # Multi-stage build (Node → Nginx)
├── backend/
│   └── Dockerfile                        # Python FastAPI
└── docker/
    ├── python/Dockerfile                 # Python runner
    ├── node/Dockerfile                   # Node.js runner
    ├── java/Dockerfile                   # Java runner
    ├── cpp/Dockerfile                    # C++ runner
    └── nginx/
        └── nginx.conf                    # Nginx configuration
```

---

## 🔧 Configuration

### Frontend Dockerfile (Multi-stage Build)

```dockerfile
# Stage 1: Build React app
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --frozen-lockfile
COPY . .
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY --from=builder /app/public/sw.js /usr/share/nginx/html/sw.js
COPY --from=builder /app/public/manifest.json /usr/share/nginx/html/manifest.json
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Backend Dockerfile

```dockerfile
FROM python:3.13-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]
```

---

## 🔒 Security Features (Code Runners)

Each code runner container has strict security constraints:

- **Memory Limit**: 512MB - 1GB
- **CPU Limit**: 1 CPU
- **Read-only Filesystem**: Prevents file modifications
- **No Network Access**: `network_mode: none`
- **Temporary Storage**: Limited tmpfs for execution
- **No Restart**: Containers don't auto-restart

---

## 🗄️ Data Persistence

Production volumes:
```yaml
volumes:
  mongo_data:      # MongoDB data
  redis_data:      # Redis persistence
  prometheus_data: # Metrics data
  grafana_data:    # Dashboard configs
```

---

## 🌐 Environment Variables

### Development (.env)

```bash
# Backend
MONGODB_URL=mongodb://localhost:27017
REDIS_URL=redis://localhost:6379
SECRET_KEY=your-secret-key-here

# Frontend
VITE_API_URL=http://localhost:8000
```

### Production

```bash
# Required
SECRET_KEY=your-production-secret-key
GRAFANA_PASSWORD=your-grafana-password

# Auto-configured
MONGODB_URL=mongodb://mongodb:27017
REDIS_URL=redis://redis:6379
VITE_API_URL=http://backend:8000
```

---

## 📊 Monitoring (Production)

### Prometheus
- Collects metrics from backend
- Access: http://localhost:9090

### Grafana
- Visualizes metrics
- Access: http://localhost:3001
- Default credentials: admin / (GRAFANA_PASSWORD)

---

## 🛠️ Common Commands

### View Running Containers
```bash
docker ps
```

### View All Containers (including stopped)
```bash
docker ps -a
```

### View Logs for Specific Service
```bash
docker-compose logs -f frontend
docker-compose logs -f backend
```

### Execute Command in Container
```bash
docker-compose exec backend bash
docker-compose exec frontend sh
```

### Rebuild Single Service
```bash
docker-compose up -d --build frontend
```

### Remove All Containers and Volumes
```bash
docker-compose down -v
```

### Check Resource Usage
```bash
docker stats
```

---

## 🐛 Troubleshooting

### Frontend Not Loading
```bash
# Check if container is running
docker-compose ps frontend

# View logs
docker-compose logs frontend

# Rebuild
docker-compose up -d --build frontend
```

### Backend Connection Issues
```bash
# Check backend logs
docker-compose logs backend

# Verify environment variables
docker-compose exec backend env | grep MONGODB_URL

# Test database connection
docker-compose exec backend python -c "from app.core.database import db; print(db.client.server_info())"
```

### Database Connection Failed
```bash
# Check if MongoDB/PostgreSQL is running
docker-compose ps mongodb
docker-compose ps postgres

# Restart database
docker-compose restart mongodb
```

### Port Already in Use
```bash
# Find process using port
netstat -ano | findstr :5173
netstat -ano | findstr :8000

# Kill process or change port in docker-compose.yml
```

---

## 🚢 Deployment Checklist

### Before Production Deployment:

- [ ] Set strong `SECRET_KEY` in environment
- [ ] Configure SSL certificates in `docker/nginx/certs/`
- [ ] Update `VITE_API_URL` to production domain
- [ ] Set `GRAFANA_PASSWORD`
- [ ] Review and adjust resource limits
- [ ] Configure backup strategy for volumes
- [ ] Set up log rotation
- [ ] Configure firewall rules
- [ ] Test health checks
- [ ] Set up monitoring alerts

---

## 📝 Notes

1. **Development**: Uses hot-reload for both frontend and backend
2. **Production**: Optimized builds with health checks and auto-restart
3. **Code Runners**: Isolated environments for secure code execution
4. **Networking**: Services communicate via Docker internal network
5. **Volumes**: Data persists across container restarts in production

---

## 🔗 Useful Links

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [FastAPI Docker Guide](https://fastapi.tiangolo.com/deployment/docker/)
- [Vite Docker Guide](https://vitejs.dev/guide/static-deploy.html)

---

## 📞 Support

For issues or questions about the Docker setup, please:
1. Check the logs: `docker-compose logs -f`
2. Review this documentation
3. Contact the development team
