# Using standard Python image
FROM python:3.12-slim-bookworm

# Continental's proxy settings
ARG HTTP_PROXY=http://cias.geoaws.com:8080
ARG HTTPS_PROXY=http://cias.geoaws.com:8080

RUN echo "Acquire::http::Proxy \"${HTTP_PROXY}\";" > /etc/apt/apt.conf.d/80proxy \
    && echo "Acquire::https::Proxy \"${HTTPS_PROXY}\";" >> /etc/apt/apt.conf.d/80proxy

# Create working folder
WORKDIR /app

# Copy requirements first (for better caching)
COPY requirements.txt .

# Install system dependencies and Python packages
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && pip install --no-cache-dir -r requirements.txt \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Copy application code
COPY app.py .
COPY prompt_template.txt .
COPY .streamlit/ .streamlit/

# Create directory for saved Prompt Builder data
RUN mkdir -p /app/data

ENV PROMPT_BUILDER_DATA_DIR=/app/data
ENV STREAMLIT_BROWSER_GATHER_USAGE_STATS=false

# Expose port
EXPOSE 8080

# Streamlit health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD curl --fail http://localhost:8080/_stcore/health || exit 1

# Run Streamlit
ENTRYPOINT ["streamlit", "run", "app.py", "--server.port=8080", "--server.address=0.0.0.0", "--client.showErrorDetails=viewer"]
