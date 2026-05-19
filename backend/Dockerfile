FROM python:3.11-slim

WORKDIR /app

# Install system dependencies for NumPy, Pandas, and other scientific packages
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    gfortran \
    libopenblas-dev \
    liblapack-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

EXPOSE 8000

# Run with uvicorn (adjust path to match your project structure)
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
