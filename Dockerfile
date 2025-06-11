# Build github-mcp-server binary
FROM golang:1.24.3-alpine AS mcp-builder
ARG VERSION="dev"

WORKDIR /build
RUN apk add --no-cache git
RUN git clone https://github.com/github/github-mcp-server.git .
RUN CGO_ENABLED=0 go build -ldflags="-s -w -X main.version=${VERSION} -X main.commit=$(git rev-parse HEAD) -X main.date=$(date -u +%Y-%m-%dT%H:%M:%SZ)" -o ./bin/github-mcp-server cmd/github-mcp-server/main.go

# Node.js application
FROM node:22-alpine
WORKDIR /app

# Copy built mcp-server binary
COPY --from=mcp-builder /build/bin/github-mcp-server /usr/local/bin/github-mcp-server

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy application code
COPY . .

# Expose port if needed (adjust as per your application)
EXPOSE 3000

ENV NODE_ENV=production

# Start the application
CMD ["npm", "start"] 