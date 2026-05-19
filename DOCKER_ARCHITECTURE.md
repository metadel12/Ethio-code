# EthioCode Docker Architecture

## 🏗️ System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         ETHIOCODE PLATFORM                          │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                      DEVELOPMENT ENVIRONMENT                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────────┐     │
│  │   Frontend   │      │   Backend    │      │    Redis     │     │
│  │  Node.js 20  │◄────►│   FastAPI    │◄────►│   Cache      │     │
│  │  Port: 5173  │      │  Port: 8000  │      │  Port: 6379  │     │
│  └──────────────┘      └──────────────┘      └──────────────┘     │
│         │                      │                                    │
│         │                      ▼                                    │
│         │              ┌──────────────┐                            │
│         │              │  PostgreSQL  │                            │
│         │              │  Database    │                            │
│         │              │  Port: 5432  │                            │
│         │              └──────────────┘                            │
│         │                                                           │
│         ▼                                                           │
│  ┌──────────────────────────────────────────┐                     │
│  │         User Browser (localhost)          │                     │
│  └──────────────────────────────────────────┘                     │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

## 🚀 Production Environment

```
┌─────────────────────────────────────────────────────────────────────┐
│                     PRODUCTION ENVIRONMENT                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│                    ┌──────────────┐                                 │
│                    │    Nginx     │                                 │
│                    │ Reverse Proxy│                                 │
│                    │  Port: 80/443│                                 │
│                    └───────┬──────┘                                 │
│                            │                                         │
│              ┌─────────────┴─────────────┐                         │
│              │                           │                          │
│      ┌───────▼────────┐         ┌───────▼────────┐                │
│      │   Frontend     │         │    Backend     │                 │
│      │  (Built React) │         │    FastAPI     │                 │
│      │  Nginx Server  │         │  Port: 8000    │                 │
│      └────────────────┘         └───────┬────────┘                │
│                                          │                          │
│                    ┌─────────────────────┼─────────────┐           │
│                    │                     │             │            │
│            ┌───────▼────────┐   ┌───────▼────┐  ┌────▼─────┐     │
│            │    MongoDB     │   │   Redis    │  │  Health  │     │
│            │   Database     │   │   Cache    │  │  Checks  │     │
│            │  Port: 27017   │   │ Port: 6379 │  └──────────┘     │
│            └────────────────┘   └────────────┘                     │
│                                                                      │
│            ┌────────────────────────────────┐                      │
│            │      Monitoring Stack          │                      │
│            ├────────────────────────────────┤                      │
│            │  Prometheus  │   Grafana       │                      │
│            │  Port: 9090  │   Port: 3001    │                      │
│            └────────────────────────────────┘                      │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

## 🔒 Code Execution Environment (Sandboxed)

```
┌─────────────────────────────────────────────────────────────────────┐
│                    CODE RUNNER CONTAINERS                            │
│                    (Isolated & Sandboxed)                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│  │   Python     │  │   Node.js    │  │     Java     │             │
│  │   Runner     │  │   Runner     │  │   Runner     │             │
│  ├──────────────┤  ├──────────────┤  ├──────────────┤             │
│  │ • 512MB RAM  │  │ • 512MB RAM  │  │ • 1GB RAM    │             │
│  │ • 1 CPU      │  │ • 1 CPU      │  │ • 1 CPU      │             │
│  │ • Read-only  │  │ • Read-only  │  │ • Read-only  │             │
│  │ • No Network │  │ • No Network │  │ • No Network │             │
│  │ • 64MB tmpfs │  │ • 64MB tmpfs │  │ • 128MB tmpfs│             │
│  └──────────────┘  └──────────────┘  └──────────────┘             │
│                                                                      │
│  ┌──────────────┐                                                   │
│  │     C++      │                                                   │
│  │   Runner     │                                                   │
│  ├──────────────┤                                                   │
│  │ • 512MB RAM  │                                                   │
│  │ • 1 CPU      │                                                   │
│  │ • Read-only  │                                                   │
│  │ • No Network │                                                   │
│  │ • 64MB tmpfs │                                                   │
│  └──────────────┘                                                   │
│                                                                      │
│  Security Features:                                                 │
│  ✓ Isolated from main network                                      │
│  ✓ Limited resources (CPU, Memory)                                 │
│  ✓ Read-only filesystem                                            │
│  ✓ Temporary execution space                                       │
│  ✓ No persistent storage                                           │
│  ✓ Auto-cleanup after execution                                    │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

## 📊 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         REQUEST FLOW                                 │
└─────────────────────────────────────────────────────────────────────┘

User Browser
     │
     │ HTTP Request
     ▼
┌─────────────┐
│   Nginx     │ (Production only)
│ Port 80/443 │
└──────┬──────┘
       │
       │ Proxy Pass
       ▼
┌─────────────┐
│  Frontend   │
│  React App  │
└──────┬──────┘
       │
       │ API Calls
       ▼
┌─────────────┐         ┌─────────────┐
│   Backend   │────────►│   Redis     │
│   FastAPI   │         │   Cache     │
└──────┬──────┘         └─────────────┘
       │
       │ Database Queries
       ▼
┌─────────────┐
│  MongoDB/   │
│ PostgreSQL  │
└─────────────┘
       │
       │ Code Execution Request
       ▼
┌─────────────┐
│ Code Runner │
│  Container  │
└─────────────┘
```

## 🔄 Container Lifecycle

```
┌─────────────────────────────────────────────────────────────────────┐
│                      CONTAINER LIFECYCLE                             │
└─────────────────────────────────────────────────────────────────────┘

Development:
  docker-compose up
       │
       ▼
  ┌─────────────┐
  │   Build     │ (if needed)
  └──────┬──────┘
         │
         ▼
  ┌─────────────┐
  │   Create    │
  └──────┬──────┘
         │
         ▼
  ┌─────────────┐
  │    Start    │ ◄──┐
  └──────┬──────┘    │
         │           │
         ▼           │
  ┌─────────────┐   │
  │   Running   │   │ Restart
  └──────┬──────┘   │
         │           │
         ▼           │
  ┌─────────────┐   │
  │    Stop     │───┘
  └──────┬──────┘
         │
         ▼
  ┌─────────────┐
  │   Remove    │
  └─────────────┘
       │
       ▼
  docker-compose down

Code Runners:
  Code Execution Request
       │
       ▼
  ┌─────────────┐
  │   Create    │
  └──────┬──────┘
         │
         ▼
  ┌─────────────┐
  │   Execute   │
  └──────┬──────┘
         │
         ▼
  ┌─────────────┐
  │   Cleanup   │
  └──────┬──────┘
         │
         ▼
  ┌─────────────┐
  │   Remove    │
  └─────────────┘
```

## 🌐 Network Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                      DOCKER NETWORKS                                 │
└─────────────────────────────────────────────────────────────────────┘

Default Network (ethiocode_default):
  ┌──────────────────────────────────────────┐
  │                                          │
  │  ┌──────────┐    ┌──────────┐          │
  │  │ Frontend │◄──►│ Backend  │          │
  │  └──────────┘    └────┬─────┘          │
  │                       │                 │
  │                       ▼                 │
  │  ┌──────────┐    ┌──────────┐          │
  │  │ MongoDB  │    │  Redis   │          │
  │  └──────────┘    └──────────┘          │
  │                                          │
  └──────────────────────────────────────────┘

Isolated Network (none):
  ┌──────────────────────────────────────────┐
  │  Code Runner Containers                  │
  │  (No network access)                     │
  │                                          │
  │  ┌──────────┐  ┌──────────┐            │
  │  │  Python  │  │  Node.js │            │
  │  └──────────┘  └──────────┘            │
  │                                          │
  └──────────────────────────────────────────┘

Host Network:
  ┌──────────────────────────────────────────┐
  │  Exposed Ports                           │
  │                                          │
  │  5173 → Frontend                         │
  │  8000 → Backend API                      │
  │  6379 → Redis                            │
  │  5432 → PostgreSQL                       │
  │  27017 → MongoDB                         │
  │  9090 → Prometheus                       │
  │  3001 → Grafana                          │
  │                                          │
  └──────────────────────────────────────────┘
```

## 💾 Volume Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                      DOCKER VOLUMES                                  │
└─────────────────────────────────────────────────────────────────────┘

Development (Bind Mounts):
  Host                          Container
  ────────────────────────────────────────
  ./frontend/src      →    /app/src
  ./backend/app       →    /app/app
  
  ✓ Live code changes
  ✓ Hot reload enabled
  ✓ No data persistence needed

Production (Named Volumes):
  Volume Name              Mount Point
  ────────────────────────────────────────
  mongo_data        →    /data/db
  redis_data        →    /data
  prometheus_data   →    /prometheus
  grafana_data      →    /var/lib/grafana
  
  ✓ Data persists across restarts
  ✓ Managed by Docker
  ✓ Backup/restore support

Code Runners (tmpfs):
  Memory                    Mount Point
  ────────────────────────────────────────
  64MB-128MB tmpfs   →    /app
  
  ✓ In-memory execution
  ✓ Auto-cleanup
  ✓ No persistence
```

## 🔐 Security Layers

```
┌─────────────────────────────────────────────────────────────────────┐
│                      SECURITY ARCHITECTURE                           │
└─────────────────────────────────────────────────────────────────────┘

Layer 1: Network Isolation
  ├─ Internal Docker network
  ├─ No direct external access
  └─ Nginx reverse proxy only

Layer 2: Container Isolation
  ├─ Separate containers per service
  ├─ Limited inter-container communication
  └─ Resource limits enforced

Layer 3: Code Runner Sandbox
  ├─ No network access
  ├─ Read-only filesystem
  ├─ Memory limits
  ├─- CPU limits
  └─ Temporary execution space

Layer 4: Application Security
  ├─ JWT authentication
  ├─ CORS configuration
  ├─ Rate limiting
  └─ Input validation

Layer 5: Data Security
  ├─ Encrypted connections
  ├─ Secure environment variables
  ├─ Volume encryption (optional)
  └─ Regular backups
```

## 📈 Scaling Strategy

```
┌─────────────────────────────────────────────────────────────────────┐
│                      HORIZONTAL SCALING                              │
└─────────────────────────────────────────────────────────────────────┘

Single Instance:
  ┌──────────┐
  │ Backend  │
  └──────────┘

Scaled (3 instances):
  ┌──────────┐
  │  Nginx   │
  │  (Load   │
  │ Balancer)│
  └────┬─────┘
       │
  ┌────┴─────────────────┐
  │                      │
  ▼          ▼          ▼
┌────────┐ ┌────────┐ ┌────────┐
│Backend │ │Backend │ │Backend │
│   1    │ │   2    │ │   3    │
└────────┘ └────────┘ └────────┘
     │          │          │
     └──────────┴──────────┘
              │
              ▼
        ┌──────────┐
        │ MongoDB  │
        │ (Shared) │
        └──────────┘

Command:
  docker-compose up -d --scale backend=3
```

## 🎯 Resource Allocation

```
┌─────────────────────────────────────────────────────────────────────┐
│                      RESOURCE LIMITS                                 │
└─────────────────────────────────────────────────────────────────────┘

Service          CPU    Memory    Storage
─────────────────────────────────────────
Frontend         -      -         -
Backend          -      -         -
MongoDB          -      -         10GB
Redis            -      256MB     1GB
Python Runner    1      512MB     64MB
Node Runner      1      512MB     64MB
Java Runner      1      1GB       128MB
C++ Runner       1      512MB     64MB
Prometheus       -      -         5GB
Grafana          -      -         1GB

Note: - means no explicit limit (uses available resources)
```

---

## 📚 Related Documentation

- [DOCKER_SETUP.md](./DOCKER_SETUP.md) - Complete setup guide
- [DOCKER_QUICK_REFERENCE.md](./DOCKER_QUICK_REFERENCE.md) - Command reference
- [README.md](./README.md) - Project overview
