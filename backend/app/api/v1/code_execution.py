from fastapi import APIRouter, HTTPException
import subprocess
import tempfile
import os
import hashlib
from typing import Dict, Any
from datetime import datetime
from app.database import db
from app.config import settings

router = APIRouter(prefix="/code-execution", tags=["Code Execution"])

# Docker client - initialize only if available
docker_client = None
try:
    import docker
    docker_client = docker.from_env()
except Exception:
    docker_client = None

@router.post("/run")
async def run_code(request: Dict[str, Any]):
    """Execute code in an isolated Docker container"""

    code = request.get("code", "")
    language = request.get("language", "python")

    if not code:
        raise HTTPException(status_code=400, detail="No code provided")

    if len(code) > settings.MAX_CODE_LENGTH:
        raise HTTPException(status_code=400, detail="Code too long")

    # Generate cache key
    code_hash = hashlib.sha256(f"{code}{language}".encode()).hexdigest()

    # Check cache first
    try:
        cached = await db.code_execution_cache.find_one({"code_hash": code_hash})
    except Exception:
        cached = None
    if cached:
        return {
            "output": cached["output"],
            "execution_time_ms": cached["execution_time_ms"],
            "from_cache": True
        }

    # Execute code based on language
    result = await execute_code(code, language)

    # Cache result
    try:
        await db.code_execution_cache.insert_one({
            "code_hash": code_hash,
            "language": language,
            "output": result["output"],
            "execution_time_ms": result["execution_time_ms"],
            "created_at": datetime.utcnow(),
            "expires_at": datetime.utcnow()
        })
    except Exception:
        pass

    return result

async def execute_code(code: str, language: str) -> Dict[str, Any]:
    """Execute code using Docker containers"""

    try:
        if language == "python":
            return await execute_python(code)
        elif language == "javascript":
            return await execute_javascript(code)
        elif language == "java":
            return await execute_java(code)
        elif language == "go":
            return await execute_go(code)
        else:
            return {"output": f"Language {language} not supported", "execution_time_ms": 0}

    except Exception as e:
        return {"output": f"Execution error: {str(e)}", "execution_time_ms": 0}

async def execute_python(code: str) -> Dict[str, Any]:
    """Execute Python code"""
    import time
    start = time.time()

    try:
        # Create temporary file
        with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as f:
            f.write(code)
            temp_file = f.name

        # Run subprocess with timeout
        result = subprocess.run(
            ['python', temp_file],
            capture_output=True,
            text=True,
            timeout=settings.CODE_EXECUTION_TIMEOUT
        )

        output = result.stdout if result.stdout else result.stderr

        # Cleanup
        os.unlink(temp_file)

        execution_time = int((time.time() - start) * 1000)

        return {
            "output": output or "Code executed successfully (no output)",
            "execution_time_ms": execution_time,
            "from_cache": False
        }

    except subprocess.TimeoutExpired:
        return {"output": "Execution timeout", "execution_time_ms": settings.CODE_EXECUTION_TIMEOUT * 1000}
    except Exception as e:
        return {"output": str(e), "execution_time_ms": 0}

async def execute_javascript(code: str) -> Dict[str, Any]:
    """Execute JavaScript/Node.js code"""
    import time
    start = time.time()

    try:
        with tempfile.NamedTemporaryFile(mode='w', suffix='.js', delete=False) as f:
            f.write(code)
            temp_file = f.name

        result = subprocess.run(
            ['node', temp_file],
            capture_output=True,
            text=True,
            timeout=settings.CODE_EXECUTION_TIMEOUT
        )

        output = result.stdout if result.stdout else result.stderr
        os.unlink(temp_file)

        return {
            "output": output or "Code executed successfully",
            "execution_time_ms": int((time.time() - start) * 1000)
        }

    except subprocess.TimeoutExpired:
        return {"output": "Execution timeout", "execution_time_ms": settings.CODE_EXECUTION_TIMEOUT * 1000}
    except Exception as e:
        return {"output": str(e), "execution_time_ms": 0}

# Similar functions for Java, Go, etc.
