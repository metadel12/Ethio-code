FROM python:3.11-slim

# Create non-root user for security
RUN useradd -m -s /bin/bash runner

# Set working directory
WORKDIR /app

# Switch to non-root user
USER runner

# Default command
CMD ["python"]
