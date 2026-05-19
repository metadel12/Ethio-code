# 🐳 Docker Cheat Sheet - EthioCode

## ⚡ Most Used Commands

```bash
# Start everything
docker-compose up -d

# Stop everything
docker-compose down

# View logs
docker-compose logs -f

# Restart service
docker-compose restart backend

# Rebuild
docker-compose up -d --build
```

---

## 🎯 One-Liners

```bash
# Start and watch logs
docker-compose up

# Rebuild specific service
docker-compose up -d --build frontend

# Stop and remove volumes (⚠️ deletes data)
docker-compose down -v

# View running containers
docker-compose ps

# Follow logs for specific service
docker-compose logs -f backend

# Execute command in container
docker-compose exec backend bash

# View resource usage
docker stats

# Clean everything
docker system prune -a

# Backup MongoDB
docker-compose exec -T mongodb mongodump --archive > backup.archive

# Restore MongoDB
docker-compose exec -T mongodb mongorestore --archive < backup.archive
```

---

## 🔥 Emergency Commands

```bash
# Nothing works? Reset everything!
docker-compose down -v && docker system prune -a && docker-compose up -d --build

# Port conflict? Find what's using it
netstat -ano | findstr :5173

# Out of space? Clean up
docker system prune -a --volumes

# Container stuck? Force remove
docker rm -f $(docker ps -aq)

# Images taking space? Remove unused
docker image prune -a
```

---

## 📊 Status & Info

```bash
# Container status
docker-compose ps

# Resource usage
docker stats

# Disk usage
docker system df

# Container details
docker inspect container_name

# View environment variables
docker-compose exec backend env

# Check health
docker inspect --format='{{.State.Health.Status}}' container_name
```

---

## 🔍 Debugging

```bash
# View all logs
docker-compose logs

# Last 100 lines
docker-compose logs --tail=100

# Follow logs
docker-compose logs -f

# Specific service logs
docker-compose logs -f backend

# Enter container
docker-compose exec backend bash
docker-compose exec frontend sh

# Run command in container
docker-compose exec backend python --version

# Check processes
docker-compose exec backend ps aux
```

---

## 🗄️ Database

```bash
# MongoDB shell
docker-compose exec mongodb mongosh

# PostgreSQL shell
docker-compose exec postgres psql -U ethiocode

# Redis CLI
docker-compose exec redis redis-cli

# Backup MongoDB
docker-compose exec mongodb mongodump --out=/data/backup

# Backup PostgreSQL
docker-compose exec postgres pg_dump -U ethiocode ethiocode > backup.sql
```

---

## 🧹 Cleanup

```bash
# Remove stopped containers
docker-compose rm

# Remove all unused
docker system prune

# Remove volumes
docker volume prune

# Remove images
docker image prune -a

# Nuclear option (removes everything)
docker system prune -a --volumes
```

---

## 🚀 Production

```bash
# Start production
docker-compose -f docker-compose.prod.yml up -d --build

# View production logs
docker-compose -f docker-compose.prod.yml logs -f

# Scale backend
docker-compose -f docker-compose.prod.yml up -d --scale backend=3

# Update single service
docker-compose -f docker-compose.prod.yml up -d --no-deps --build backend
```

---

## 🔧 Development Workflow

```bash
# 1. Start development
docker-compose up -d

# 2. Make code changes (auto-reload works!)

# 3. View logs if needed
docker-compose logs -f backend

# 4. Restart if needed
docker-compose restart backend

# 5. Rebuild if dependencies changed
docker-compose up -d --build backend

# 6. Stop when done
docker-compose down
```

---

## 💾 Backup & Restore

```bash
# Backup MongoDB
docker-compose exec -T mongodb mongodump --archive > backup_$(date +%Y%m%d).archive

# Restore MongoDB
docker-compose exec -T mongodb mongorestore --archive < backup_20240101.archive

# Backup PostgreSQL
docker-compose exec -T postgres pg_dump -U ethiocode ethiocode > backup_$(date +%Y%m%d).sql

# Restore PostgreSQL
docker-compose exec -T postgres psql -U ethiocode ethiocode < backup_20240101.sql

# Backup volume
docker run --rm -v ethio-code_mongo_data:/data -v $(pwd):/backup alpine tar czf /backup/mongo_backup.tar.gz /data
```

---

## 🎨 Useful Aliases

Add to `~/.bashrc` or `~/.zshrc`:

```bash
alias dc='docker-compose'
alias dcu='docker-compose up -d'
alias dcd='docker-compose down'
alias dcl='docker-compose logs -f'
alias dcr='docker-compose restart'
alias dcb='docker-compose build'
alias dcp='docker-compose ps'
alias dex='docker-compose exec'
```

Then use:
```bash
dcu              # Start
dcl backend      # View logs
dcr frontend     # Restart
dcd              # Stop
```

---

## 🎯 Common Scenarios

### Frontend not updating?
```bash
docker-compose restart frontend
```

### Backend error?
```bash
docker-compose logs -f backend
```

### Database connection failed?
```bash
docker-compose restart mongodb
docker-compose logs mongodb
```

### Need fresh start?
```bash
docker-compose down -v
docker-compose up -d --build
```

### Out of disk space?
```bash
docker system df
docker system prune -a --volumes
```

---

## 📱 Quick Reference Card

```
┌─────────────────────────────────────────┐
│         DOCKER QUICK COMMANDS           │
├─────────────────────────────────────────┤
│ Start:    docker-compose up -d          │
│ Stop:     docker-compose down           │
│ Logs:     docker-compose logs -f        │
│ Status:   docker-compose ps             │
│ Restart:  docker-compose restart NAME   │
│ Rebuild:  docker-compose up -d --build  │
│ Shell:    docker-compose exec NAME bash │
│ Clean:    docker system prune -a        │
└─────────────────────────────────────────┘
```

---

## 🆘 Troubleshooting Matrix

| Problem | Command |
|---------|---------|
| Port in use | `netstat -ano \| findstr :PORT` |
| Container won't start | `docker-compose logs SERVICE` |
| Out of space | `docker system prune -a` |
| Need fresh start | `docker-compose down -v && docker-compose up -d --build` |
| Slow performance | `docker stats` |
| Network issues | `docker network ls && docker network prune` |
| Volume issues | `docker volume ls && docker volume prune` |

---

## 📚 Documentation Links

- [DOCKER_SETUP.md](./DOCKER_SETUP.md) - Full setup guide
- [DOCKER_QUICK_REFERENCE.md](./DOCKER_QUICK_REFERENCE.md) - Detailed commands
- [DOCKER_ARCHITECTURE.md](./DOCKER_ARCHITECTURE.md) - Architecture diagrams
- [DOCKER_SUMMARY.md](./DOCKER_SUMMARY.md) - Overview

---

**Print this and keep it handy! 📄**
