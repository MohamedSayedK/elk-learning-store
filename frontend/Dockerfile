# =============================================================================
# Dockerfile — Angular Frontend (Development)
# =============================================================================
# Runs `ng serve` inside Docker so the dev server is accessible at port 4200
# Hot-reload works because the source is mounted as a volume in docker-compose
# =============================================================================

FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --legacy-peer-deps

COPY . .

EXPOSE 4200

# --host 0.0.0.0 makes the dev server accessible outside the container
# Without this, it only listens on 127.0.0.1 inside the container (unreachable)
CMD ["npx", "ng", "serve", "--host", "0.0.0.0", "--port", "4200"]
