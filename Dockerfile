ARG DOCKER_REGISTRY="common-docker-r.artifactory.geo.conti.de/"

FROM ${DOCKER_REGISTRY}python:3.11-slim

ARG HTTP_PROXY=http://cias.geoaws.com:8080
ARG HTTPS_PROXY=http://cias.geoaws.com:8080

ENV HTTP_PROXY=${HTTP_PROXY}
ENV HTTPS_PROXY=${HTTPS_PROXY}
ENV http_proxy=${HTTP_PROXY}
ENV https_proxy=${HTTPS_PROXY}

WORKDIR /app

COPY requirements.txt .

RUN pip3 install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8080

ENTRYPOINT ["streamlit", "run", "app.py", "--server.port=8080", "--server.address=0.0.0.0", "--server.headless=true"]
