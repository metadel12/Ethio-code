# Docker Setup for Code Execution

## Quick Start

### 1. Build Docker Images (One-time setup)
```bash
# Build all language containers
docker-compose -f docker-compose.code-runners.yml build

# Or build individually
docker build -t ethiocode-python-runner ./docker/python
docker build -t ethiocode-node-runner ./docker/node
docker build -t ethiocode-java-runner ./docker/java
docker build -t ethiocode-cpp-runner ./docker/cpp
```

### 2. Pull Pre-built Images (Alternative)
```bash
docker pull python:3.11-slim
docker pull node:20-slim
docker pull openjdk:17-slim
docker pull gcc:latest
docker pull golang:1.21
docker pull rust:1.70
docker pull ruby:3.2
docker pull php:8.2-cli
```

### 3. Test Docker Setup
```bash
# Test Python
docker run --rm python:3.11-slim python -c "print('Hello from Docker!')"

# Test Node
docker run --rm node:20-slim node -e "console.log('Hello from Docker!')"
```

## Without Docker (Fallback)

The code editor will automatically fallback to subprocess execution if Docker is not available.

Required installations:
- Python 3.11+
- Node.js 20+
- Java 17+ (optional)
- GCC/G++ (optional)

## Security Features

- Network disabled in containers
- Memory limits enforced
- CPU limits enforced
- Read-only filesystem
- Non-root user execution
- 10-second timeout per execution

## Usage

The backend automatically detects Docker availability and uses it when present.
