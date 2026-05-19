# EthioCode Platform

Full-stack platform scaffold for EthioCode.

## Structure

- `frontend/` - React/Vite application
- `backend/` - FastAPI application
- `mobile/` - React Native placeholder
- `database/` - migrations, seeds, and backups
- `docker/` - service configuration
- `kubernetes/` - deployment manifests
- `scripts/` - deployment and maintenance scripts
- `docs/` - project documentation

## Run Locally

### Option 1: Docker (Recommended) 🐳

```bash
# Start all services (frontend, backend, database, redis)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

**Access:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000/docs
- PostgreSQL: localhost:5432
- Redis: localhost:6379

📖 **Docker Documentation:**
- **[DOCKER_INDEX.md](./DOCKER_INDEX.md)** - Documentation index (start here!)
- **[DOCKER_SUMMARY.md](./DOCKER_SUMMARY.md)** - Quick overview
- **[DOCKER_CHEATSHEET.md](./DOCKER_CHEATSHEET.md)** - Command reference
- **[DOCKER_SETUP.md](./DOCKER_SETUP.md)** - Complete setup guide
- **[DOCKER_ARCHITECTURE.md](./DOCKER_ARCHITECTURE.md)** - Architecture diagrams

### Option 2: Manual Setup

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Backend:

```bash
cd backend
pip install -r requirements-dev.txt
python run.py
```
