FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend package
COPY backend/ /app/backend/

# Copy frontend files
COPY frontend/ /app/frontend/

# Expose port
EXPOSE 9982

# Run the application - bind to 0.0.0.0 to accept external connections
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "9982"]
