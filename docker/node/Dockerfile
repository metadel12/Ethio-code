FROM node:20-slim

# Create non-root user for security
RUN useradd -m -s /bin/bash runner

# Install TypeScript globally
RUN npm install -g typescript ts-node

# Set working directory
WORKDIR /app

# Switch to non-root user
USER runner

# Default command
CMD ["node"]
