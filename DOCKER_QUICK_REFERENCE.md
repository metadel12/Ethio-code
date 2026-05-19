# Docker Quick Reference - EthioCode

## 🚀 Start/Stop Commands

```bash
# Start development environment
docker-compose up -d

# Start with logs visible
docker-compose up

# Stop all services
docker-compose down

# Stop and remove volumes (⚠️ deletes data)
docker-compose down -v

# Restart specific service
docker-compose restart backend
docker-compose restart frontend
```

## 🔨 Build Commands

```bash
# Build all services
docker-compose build

# Build specific service
docker-compose build frontend
docker-compose build backend

# Build and start (force rebuild)
docker-compose up -d --build

# Build code runners
docker-compose -f docker-compose.code-runners.yml build
```

## 📊 Status & Logs

```bash
# View running containers
docker-compose ps

# View all logs
docker-compose logs

# Follow logs (live)
docker-compose logs -f

# Logs for specific service
docker-compose logs -f backend
docker-compose logs -f frontend

# Last 100 lines
docker-compose logs --tail=100 backend
```

## 🔍 Debugging

```bash
# Execute command in running container
docker-compose exec backend bash
docker-compose exec frontend sh

# Run one-off command
docker-compose run backend python manage.py migrate
docker-compose run frontend npm install

# Check environment variables
docker-compose exec backend env

# Check resource usage
docker stats

# Inspect container
docker inspect ethio-code-backend-1
```

## 🗄️ Database Commands

```bash
# Access MongoDB shell (production)
docker-compose -f docker-compose.prod.yml exec mongodb mongosh

# Access PostgreSQL shell (development)
docker-compose exec postgres psql -U ethiocode -d ethiocode

# Backup MongoDB
docker-compose exec mongodb mongodump --out=/data/backup

# Restore MongoDB
docker-compose exec mongodb mongorestore /data/backup

# View Redis data
docker-compose exec redis redis-cli
```

## 🧹 Cleanup Commands

```bash
# Remove stopped containers
docker-compose rm

# Remove all unused containers, networks, images
docker system prune

# Remove all unused volumes (⚠️ deletes data)
docker volume prune

# Remove specific volume
docker volume rm ethio-code_mongo_data

# Remove all project containers and volumes
docker-compose down -v --remove-orphans
```

## 🌐 Production Commands

```bash
# Start production environment
docker-compose -f docker-compose.prod.yml up -d --build

# View production logs
docker-compose -f docker-compose.prod.yml logs -f

# Stop production
docker-compose -f docker-compose.prod.yml down

# Scale services
docker-compose -f docker-compose.prod.yml up -d --scale backend=3

# Update single service
docker-compose -f docker-compose.prod.yml up -d --no-deps --build backend
```

## 🔧 Troubleshooting

```bash
# Port already in use - find process
netstat -ano | findstr :5173
netstat -ano | findstr :8000

# Container won't start - check logs
docker-compose logs backend

# Network issues - recreate network
docker-compose down
docker network prune
docker-compose up -d

# Permission issues - fix ownership
docker-compose exec backend chown -R app:app /app

# Clear cache and rebuild
docker-compose down
docker system prune -a
docker-compose up -d --build
```

## 📦 Image Management

```bash
# List images
docker images

# Remove image
docker rmi ethiocode-frontend

# Remove all unused images
docker image prune -a

# Pull latest base images
docker-compose pull

# Tag image for registry
docker tag ethiocode-backend:latest registry.example.com/ethiocode-backend:v1.0
```

## 🔐 Security Checks

```bash
# Scan image for vulnerabilities
docker scan ethiocode-backend

# Check container security
docker-compose exec backend ps aux

# View container processes
docker top ethio-code-backend-1

# Check resource limits
docker inspect ethio-code-backend-1 | grep -A 10 "Memory"
```

## 📈 Monitoring

```bash
# Real-time resource usage
docker stats

# Container health status
docker-compose ps

# Check health of specific service
docker inspect --format='{{.State.Health.Status}}' ethio-code-backend-1

# View Prometheus metrics
curl http://localhost:9090/metrics

# Access Grafana
open http://localhost:3001
```

## 🔄 Update Workflow

```bash
# 1. Pull latest code
git pull origin main

# 2. Rebuild changed services
docker-compose up -d --build

# 3. Run migrations (if needed)
docker-compose exec backend python -m alembic upgrade head

# 4. Verify services
docker-compose ps
docker-compose logs -f
```

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

# Backup volumes
docker run --rm -v ethio-code_mongo_data:/data -v $(pwd):/backup alpine tar czf /backup/mongo_data_backup.tar.gz /data
```

## 🎯 Common Scenarios

### Scenario 1: Frontend not updating
```bash
docker-compose restart frontend
# or
docker-compose up -d --build frontend
```

### Scenario 2: Backend API errors
```bash
docker-compose logs -f backend
docker-compose exec backend python -c "from app.core.database import db; print(db.client.server_info())"
```

### Scenario 3: Database connection failed
```bash
docker-compose restart mongodb
docker-compose logs mongodb
```

### Scenario 4: Out of disk space
```bash
docker system df
docker system prune -a --volumes
```

### Scenario 5: Reset everything
```bash
docker-compose down -v
docker system prune -a
docker-compose up -d --build
```

## 📝 Environment Variables

```bash
# View all environment variables
docker-compose config

# Set environment variable for one command
VITE_API_URL=http://api.example.com docker-compose up -d frontend

# Load from different .env file
docker-compose --env-file .env.production up -d
```

## 🔗 Useful Aliases (Add to ~/.bashrc or ~/.zshrc)

```bash
# Docker Compose shortcuts
alias dc='docker-compose'
alias dcu='docker-compose up -d'
alias dcd='docker-compose down'
alias dcl='docker-compose logs -f'
alias dcr='docker-compose restart'
alias dcb='docker-compose build'
alias dcp='docker-compose ps'

# Docker shortcuts
alias dps='docker ps'
alias dpsa='docker ps -a'
alias di='docker images'
alias dex='docker exec -it'
alias dlog='docker logs -f'
alias dstats='docker stats'
```

## 📚 Additional Resources

- Full Documentation: [DOCKER_SETUP.md](./DOCKER_SETUP.md)
- Docker Docs: https://docs.docker.com/
- Docker Compose Docs: https://docs.docker.com/compose/
- Best Practices: https://docs.docker.com/develop/dev-best-practices/
