from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from bson import ObjectId
import tempfile
import os
import time
import hashlib

from app.database import db
from app.core.auth import get_current_user

router = APIRouter()

# Docker client - initialize only if available
docker_client = None
try:
    import docker
    docker_client = docker.from_env()
except Exception as e:
    print(f"Docker not available: {e}")
    docker_client = None

# Language configurations with Docker images
LANGUAGE_CONFIGS = {
    "python": {
        "image": "python:3.11-slim",
        "file": "script.py",
        "cmd": ["python", "script.py"],
        "timeout": 10,
        "memory_limit": "512m"
    },
    "javascript": {
        "image": "node:20-slim",
        "file": "script.js",
        "cmd": ["node", "script.js"],
        "timeout": 10,
        "memory_limit": "512m"
    },
    "typescript": {
        "image": "node:20-slim",
        "file": "script.ts",
        "cmd": ["npx", "ts-node", "script.ts"],
        "timeout": 10,
        "memory_limit": "512m"
    },
    "java": {
        "image": "openjdk:17-slim",
        "file": "Main.java",
        "compile_cmd": ["javac", "Main.java"],
        "run_cmd": ["java", "Main"],
        "timeout": 15,
        "memory_limit": "1g"
    },
    "cpp": {
        "image": "gcc:latest",
        "file": "main.cpp",
        "compile_cmd": ["g++", "main.cpp", "-o", "main"],
        "run_cmd": ["./main"],
        "timeout": 10,
        "memory_limit": "512m"
    },
    "c": {
        "image": "gcc:latest",
        "file": "main.c",
        "compile_cmd": ["gcc", "main.c", "-o", "main"],
        "run_cmd": ["./main"],
        "timeout": 10,
        "memory_limit": "512m"
    },
    "go": {
        "image": "golang:1.21",
        "file": "main.go",
        "cmd": ["go", "run", "main.go"],
        "timeout": 10,
        "memory_limit": "512m"
    },
    "rust": {
        "image": "rust:1.70",
        "file": "main.rs",
        "compile_cmd": ["rustc", "main.rs"],
        "run_cmd": ["./main"],
        "timeout": 15,
        "memory_limit": "512m"
    },
    "csharp": {
        "image": "mcr.microsoft.com/dotnet/sdk:7.0",
        "file": "Program.cs",
        "cmd": ["dotnet", "script", "Program.cs"],
        "timeout": 10,
        "memory_limit": "512m"
    },
    "ruby": {
        "image": "ruby:3.2",
        "file": "script.rb",
        "cmd": ["ruby", "script.rb"],
        "timeout": 10,
        "memory_limit": "512m"
    },
    "php": {
        "image": "php:8.2-cli",
        "file": "script.php",
        "cmd": ["php", "script.php"],
        "timeout": 10,
        "memory_limit": "512m"
    },
    "swift": {
        "image": "swift:5.9",
        "file": "main.swift",
        "cmd": ["swift", "main.swift"],
        "timeout": 10,
        "memory_limit": "512m"
    },
    "kotlin": {
        "image": "kotlin:latest",
        "file": "main.kt",
        "compile_cmd": ["kotlinc", "main.kt", "-include-runtime", "-d", "main.jar"],
        "run_cmd": ["java", "-jar", "main.jar"],
        "timeout": 15,
        "memory_limit": "1g"
    },
    "r": {
        "image": "r-base:latest",
        "file": "script.r",
        "cmd": ["Rscript", "script.r"],
        "timeout": 10,
        "memory_limit": "512m"
    },
    "perl": {
        "image": "perl:latest",
        "file": "script.pl",
        "cmd": ["perl", "script.pl"],
        "timeout": 10,
        "memory_limit": "512m"
    },
    "scala": {
        "image": "scala:latest",
        "file": "Main.scala",
        "cmd": ["scala", "Main.scala"],
        "timeout": 15,
        "memory_limit": "1g"
    }
}


class CodeRequest(BaseModel):
    code: str = Field(..., description="Source code to execute")
    language: str = Field(..., description="Programming language")
    stdin: Optional[str] = Field("", description="Standard input for the program")
    test_cases: Optional[List[Dict[str, str]]] = Field([], description="Test cases to run")
    compile_only: Optional[bool] = Field(False, description="Only compile, don't run")


class CodeResponse(BaseModel):
    output: str
    error: Optional[str] = None
    execution_time_ms: int
    memory_used_mb: float
    status: str
    passed_tests: Optional[int] = None
    total_tests: Optional[int] = None
    test_results: Optional[List[Dict[str, Any]]] = None
    from_cache: Optional[bool] = False


class SnippetRequest(BaseModel):
    title: str
    description: Optional[str] = ""
    language: str
    code: str
    is_public: Optional[bool] = False
    tags: Optional[List[str]] = []


@router.post("/run", response_model=CodeResponse)
async def execute_code(request: CodeRequest):
    """Execute code in isolated Docker container or fallback to subprocess"""
    
    if request.language not in LANGUAGE_CONFIGS:
        raise HTTPException(
            status_code=400, 
            detail=f"Language {request.language} not supported. Supported: {', '.join(LANGUAGE_CONFIGS.keys())}"
        )
    
    # Generate cache key
    code_hash = hashlib.sha256(
        f"{request.code}{request.language}{request.stdin}".encode()
    ).hexdigest()
    
    # Check cache
    try:
        cached = await db.code_execution_cache.find_one({"code_hash": code_hash})
        if cached:
            return CodeResponse(
                output=cached.get("output", ""),
                error=cached.get("error"),
                execution_time_ms=cached.get("execution_time_ms", 0),
                memory_used_mb=cached.get("memory_used_mb", 0),
                status=cached.get("status", "success"),
                from_cache=True
            )
    except Exception:
        pass
    
    config = LANGUAGE_CONFIGS[request.language]
    start_time = time.time()
    
    try:
        # Try Docker execution first
        if docker_client:
            result = await execute_in_docker(request.code, request.language, request.stdin, config)
        else:
            # Fallback to subprocess
            result = await execute_in_subprocess(request.code, request.language, request.stdin, config)
        
        execution_time = int((time.time() - start_time) * 1000)
        result["execution_time_ms"] = execution_time
        
        # Cache result
        try:
            await db.code_execution_cache.insert_one({
                "code_hash": code_hash,
                "language": request.language,
                "output": result.get("output", ""),
                "error": result.get("error"),
                "execution_time_ms": execution_time,
                "memory_used_mb": result.get("memory_used_mb", 0),
                "status": result.get("status", "success"),
                "created_at": datetime.utcnow()
            })
        except Exception:
            pass
        
        return CodeResponse(**result)
        
    except Exception as e:
        return CodeResponse(
            output="",
            error=str(e),
            execution_time_ms=int((time.time() - start_time) * 1000),
            memory_used_mb=0,
            status="error"
        )


async def execute_in_docker(code: str, language: str, stdin: str, config: Dict) -> Dict:
    """Execute code in Docker container"""
    try:
        with tempfile.TemporaryDirectory() as temp_dir:
            # Write code to file
            file_path = os.path.join(temp_dir, config["file"])
            with open(file_path, "w", encoding="utf-8") as f:
                f.write(code)
            
            # Write stdin if provided
            if stdin:
                stdin_path = os.path.join(temp_dir, "input.txt")
                with open(stdin_path, "w", encoding="utf-8") as f:
                    f.write(stdin)
            
            # Compile if needed
            if "compile_cmd" in config:
                compile_container = docker_client.containers.run(
                    image=config["image"],
                    command=config["compile_cmd"],
                    volumes={temp_dir: {"bind": "/app", "mode": "rw"}},
                    working_dir="/app",
                    mem_limit=config["memory_limit"],
                    network_disabled=True,
                    detach=True,
                    remove=False
                )
                
                compile_result = compile_container.wait(timeout=config["timeout"])
                compile_logs = compile_container.logs(stdout=True, stderr=True).decode()
                compile_container.remove()
                
                if compile_result["StatusCode"] != 0:
                    return {
                        "output": "",
                        "error": compile_logs,
                        "memory_used_mb": 0,
                        "status": "compilation_error"
                    }
            
            # Run code
            run_cmd = config.get("run_cmd", config.get("cmd", []))
            
            # Handle stdin
            stdin_data = stdin.encode() if stdin else None
            
            container = docker_client.containers.run(
                image=config["image"],
                command=run_cmd,
                volumes={temp_dir: {"bind": "/app", "mode": "rw"}},
                working_dir="/app",
                mem_limit=config["memory_limit"],
                network_disabled=True,
                detach=True,
                stdin_open=bool(stdin),
                remove=False
            )
            
            # Send stdin if provided
            if stdin_data:
                try:
                    sock = container.attach_socket(params={'stdin': 1, 'stream': 1})
                    sock._sock.sendall(stdin_data)
                    sock.close()
                except Exception:
                    pass
            
            # Wait for completion
            result = container.wait(timeout=config["timeout"])
            logs = container.logs(stdout=True, stderr=True).decode()
            
            # Get stats
            stats = container.stats(stream=False)
            memory_used = stats.get("memory_stats", {}).get("usage", 0) / (1024 * 1024)
            
            container.remove()
            
            if result["StatusCode"] == 0:
                return {
                    "output": logs,
                    "error": None,
                    "memory_used_mb": round(memory_used, 2),
                    "status": "success"
                }
            else:
                return {
                    "output": "",
                    "error": logs,
                    "memory_used_mb": round(memory_used, 2),
                    "status": "runtime_error"
                }
                
    except docker.errors.ContainerError as e:
        return {
            "output": "",
            "error": f"Container error: {str(e)}",
            "memory_used_mb": 0,
            "status": "error"
        }
    except docker.errors.ImageNotFound:
        return {
            "output": "",
            "error": f"Docker image {config['image']} not found. Please pull it first.",
            "memory_used_mb": 0,
            "status": "error"
        }
    except Exception as e:
        return {
            "output": "",
            "error": f"Execution error: {str(e)}",
            "memory_used_mb": 0,
            "status": "error"
        }


async def execute_in_subprocess(code: str, language: str, stdin: str, config: Dict) -> Dict:
    """Fallback execution using subprocess (less secure)"""
    import subprocess
    
    try:
        with tempfile.TemporaryDirectory() as temp_dir:
            file_path = os.path.join(temp_dir, config["file"])
            with open(file_path, "w", encoding="utf-8") as f:
                f.write(code)
            
            # Compile if needed
            if "compile_cmd" in config:
                compile_result = subprocess.run(
                    config["compile_cmd"],
                    cwd=temp_dir,
                    capture_output=True,
                    text=True,
                    timeout=config["timeout"]
                )
                
                if compile_result.returncode != 0:
                    return {
                        "output": "",
                        "error": compile_result.stderr or compile_result.stdout,
                        "memory_used_mb": 0,
                        "status": "compilation_error"
                    }
            
            # Run code
            run_cmd = config.get("run_cmd", config.get("cmd", []))
            
            result = subprocess.run(
                run_cmd,
                cwd=temp_dir,
                input=stdin,
                capture_output=True,
                text=True,
                timeout=config["timeout"]
            )
            
            if result.returncode == 0:
                return {
                    "output": result.stdout,
                    "error": None,
                    "memory_used_mb": 0,
                    "status": "success"
                }
            else:
                return {
                    "output": result.stdout,
                    "error": result.stderr,
                    "memory_used_mb": 0,
                    "status": "runtime_error"
                }
                
    except subprocess.TimeoutExpired:
        return {
            "output": "",
            "error": f"Execution timeout ({config['timeout']}s)",
            "memory_used_mb": 0,
            "status": "timeout"
        }
    except Exception as e:
        return {
            "output": "",
            "error": str(e),
            "memory_used_mb": 0,
            "status": "error"
        }


@router.post("/run-with-tests")
async def run_with_tests(request: CodeRequest):
    """Run code against multiple test cases"""
    
    if not request.test_cases:
        raise HTTPException(status_code=400, detail="No test cases provided")
    
    passed = 0
    test_results = []
    
    for i, test_case in enumerate(request.test_cases):
        test_input = test_case.get("input", "")
        expected_output = test_case.get("expected_output", "").strip()
        
        # Run code with test input
        test_request = CodeRequest(
            code=request.code,
            language=request.language,
            stdin=test_input
        )
        
        result = await execute_code(test_request)
        actual_output = result.output.strip()
        
        is_passed = actual_output == expected_output
        if is_passed:
            passed += 1
        
        test_results.append({
            "test_number": i + 1,
            "input": test_input,
            "expected": expected_output,
            "actual": actual_output,
            "passed": is_passed,
            "execution_time_ms": result.execution_time_ms
        })
    
    return {
        "passed_tests": passed,
        "total_tests": len(request.test_cases),
        "test_results": test_results,
        "all_passed": passed == len(request.test_cases)
    }


@router.get("/languages")
async def get_supported_languages():
    """Get all supported programming languages"""
    return {
        "languages": [
            {"id": "python", "name": "Python", "version": "3.11", "icon": "🐍"},
            {"id": "javascript", "name": "JavaScript", "version": "ES2022", "icon": "🟡"},
            {"id": "typescript", "name": "TypeScript", "version": "5.0", "icon": "🔷"},
            {"id": "java", "name": "Java", "version": "17", "icon": "☕"},
            {"id": "cpp", "name": "C++", "version": "20", "icon": "⚙️"},
            {"id": "c", "name": "C", "version": "11", "icon": "🔧"},
            {"id": "go", "name": "Go", "version": "1.21", "icon": "🐹"},
            {"id": "rust", "name": "Rust", "version": "1.70", "icon": "🦀"},
            {"id": "csharp", "name": "C#", "version": "11", "icon": "🔷"},
            {"id": "ruby", "name": "Ruby", "version": "3.2", "icon": "💎"},
            {"id": "php", "name": "PHP", "version": "8.2", "icon": "🐘"},
            {"id": "swift", "name": "Swift", "version": "5.9", "icon": "🦅"},
            {"id": "kotlin", "name": "Kotlin", "version": "1.9", "icon": "🎯"},
            {"id": "r", "name": "R", "version": "4.3", "icon": "📊"},
            {"id": "perl", "name": "Perl", "version": "5.38", "icon": "🐪"},
            {"id": "scala", "name": "Scala", "version": "3.3", "icon": "🎭"}
        ]
    }


@router.post("/snippets")
async def save_snippet(
    snippet_data: SnippetRequest,
    current_user: dict = Depends(get_current_user)
):
    """Save code snippet to database"""
    
    snippet = {
        "user_id": current_user["_id"],
        "title": snippet_data.title,
        "description": snippet_data.description,
        "language": snippet_data.language,
        "code": snippet_data.code,
        "is_public": snippet_data.is_public,
        "tags": snippet_data.tags,
        "views": 0,
        "likes": 0,
        "forks": 0,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    result = await db.code_snippets.insert_one(snippet)
    
    return {
        "message": "Snippet saved successfully",
        "id": str(result.inserted_id)
    }


@router.get("/snippets")
async def get_public_snippets(
    limit: int = 20,
    skip: int = 0,
    language: Optional[str] = None
):
    """Get public code snippets"""
    
    query = {"is_public": True}
    if language:
        query["language"] = language
    
    cursor = db.code_snippets.find(query).sort("created_at", -1).skip(skip).limit(limit)
    snippets = await cursor.to_list(length=limit)
    
    # Convert ObjectId to string
    for snippet in snippets:
        snippet["_id"] = str(snippet["_id"])
        snippet["user_id"] = str(snippet["user_id"])
    
    return {"snippets": snippets, "total": len(snippets)}


@router.get("/snippets/my")
async def get_my_snippets(
    current_user: dict = Depends(get_current_user),
    limit: int = 50,
    skip: int = 0
):
    """Get current user's code snippets"""
    
    cursor = db.code_snippets.find(
        {"user_id": current_user["_id"]}
    ).sort("created_at", -1).skip(skip).limit(limit)
    
    snippets = await cursor.to_list(length=limit)
    
    for snippet in snippets:
        snippet["_id"] = str(snippet["_id"])
        snippet["user_id"] = str(snippet["user_id"])
    
    return {"snippets": snippets}


@router.get("/templates")
async def get_code_templates(language: Optional[str] = None):
    """Get code templates for different languages"""
    
    templates = {
        "python": """# Python Example
def greet(name):
    return f"Hello, {name}!"

if __name__ == "__main__":
    print(greet("EthioCode"))
""",
        "javascript": """// JavaScript Example
function greet(name) {
    return `Hello, ${name}!`;
}

console.log(greet("EthioCode"));
""",
        "java": """// Java Example
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, EthioCode!");
    }
}
""",
        "cpp": """// C++ Example
#include <iostream>
using namespace std;

int main() {
    cout << "Hello, EthioCode!" << endl;
    return 0;
}
""",
        "go": """// Go Example
package main

import "fmt"

func main() {
    fmt.Println("Hello, EthioCode!")
}
""",
        "rust": """// Rust Example
fn main() {
    println!("Hello, EthioCode!");
}
"""
    }
    
    if language and language in templates:
        return {"template": templates[language]}
    
    return {"templates": templates}


@router.delete("/snippets/{snippet_id}")
async def delete_snippet(
    snippet_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Delete a code snippet"""
    
    result = await db.code_snippets.delete_one({
        "_id": ObjectId(snippet_id),
        "user_id": current_user["_id"]
    })
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Snippet not found")
    
    return {"message": "Snippet deleted successfully"}
