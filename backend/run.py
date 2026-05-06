import multiprocessing
import uvicorn

if __name__ == "__main__":
    multiprocessing.freeze_support()
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        reload_delay=1.0,
        reload_excludes=["*.log", "*.err", "*.out", "pytest-cache*", "__pycache__", "*.pyc"],
        workers=1,
    )
