# Sandbox Docker Configurations

This directory contains Docker configurations for various sandbox environments used in the playground.

## Available Sandboxes

### 1. Node.js Sandbox (`Dockerfile.nodejs`)
- **Base Image**: node:18-alpine
- **Tools**: git, curl, wget, bash, vim, nano
- **Global Packages**: typescript, ts-node, nodemon, eslint, prettier
- **Use Case**: JavaScript/TypeScript development and testing

### 2. Python Sandbox (`Dockerfile.python`)
- **Base Image**: python:3.11-alpine
- **Tools**: git, curl, wget, bash, vim, nano, gcc
- **Packages**: flask, fastapi, requests, pytest, black, pylint
- **Use Case**: Python development and API testing

### 3. Playwright Sandbox (`Dockerfile.playwright`)
- **Base Image**: mcr.microsoft.com/playwright:v1.40.0-focal
- **Tools**: Node.js 18, Playwright, all browsers (Chromium, Firefox, WebKit)
- **Global Packages**: @playwright/test, typescript
- **Use Case**: Browser automation and testing

### 4. Full-Stack Sandbox (`Dockerfile.fullstack`)
- **Base Image**: node:18
- **Tools**: git, curl, PostgreSQL client, Redis tools, Python 3
- **Node Packages**: typescript, NestJS, Express, React tools, Vite
- **Python Packages**: Flask, FastAPI
- **Use Case**: Full-stack application development

## Building Images

Build all sandbox images:

```bash
cd docker/sandbox
docker-compose build
```

Build specific sandbox:

```bash
docker build -f Dockerfile.nodejs -t playground-nodejs-sandbox:latest .
docker build -f Dockerfile.python -t playground-python-sandbox:latest .
docker build -f Dockerfile.playwright -t playground-playwright-sandbox:latest .
docker build -f Dockerfile.fullstack -t playground-fullstack-sandbox:latest .
```

## Running Sandboxes

### Using Docker Compose

Start all services:

```bash
docker-compose up -d
```

Start specific service:

```bash
docker-compose up -d nodejs-sandbox
docker-compose up -d postgres redis
```

### Manual Docker Run

Run a Node.js sandbox:

```bash
docker run -d \
  --name my-sandbox \
  -v $(pwd)/workspace:/workspace \
  --memory=512m \
  --cpus=1 \
  --network=bridge \
  playground-nodejs-sandbox:latest
```

Execute commands in sandbox:

```bash
docker exec my-sandbox node --version
docker exec -it my-sandbox bash
```

## Resource Limits

Default limits for sandboxes:
- **Memory**: 512MB (configurable)
- **CPU**: 1 core (configurable)
- **Storage**: 1GB (configurable)
- **Network**: Bridge (isolated)
- **Process Limit**: 100

## Security Features

1. **Isolated Networks**: Each sandbox runs in isolated network
2. **User Permissions**: Non-root user with limited privileges
3. **Resource Limits**: CPU, memory, and storage constraints
4. **No Internet**: Optional network isolation for sensitive operations
5. **Read-only Filesystems**: Optional for additional security

## Environment Variables

Common environment variables:

```env
SANDBOX_USER=sandbox
SANDBOX_UID=1000
SANDBOX_GID=1000
WORKSPACE_DIR=/workspace
```

## Volume Mounts

Workspace directory is mounted at `/workspace`:

```bash
docker run -v /path/to/host:/workspace sandbox-image
```

## Networking

Sandboxes can communicate with:
- PostgreSQL: `postgres:5432`
- Redis: `redis:6379`
- Other sandboxes via `sandbox-network`

## Cleanup

Remove all containers:

```bash
docker-compose down
```

Remove containers and volumes:

```bash
docker-compose down -v
```

Remove images:

```bash
docker rmi playground-nodejs-sandbox:latest
docker rmi playground-python-sandbox:latest
docker rmi playground-playwright-sandbox:latest
docker rmi playground-fullstack-sandbox:latest
```

## Troubleshooting

### Container won't start
Check logs:
```bash
docker logs <container-id>
```

### Out of memory
Increase memory limit:
```bash
docker run --memory=1g ...
```

### Permission denied
Ensure correct user permissions:
```bash
docker exec <container-id> ls -la /workspace
```

### Network issues
Verify network configuration:
```bash
docker network inspect sandbox-network
```

## Best Practices

1. **Always set resource limits** to prevent resource exhaustion
2. **Use specific tags** instead of `latest` for production
3. **Regularly update base images** for security patches
4. **Monitor container metrics** for performance optimization
5. **Clean up unused containers** to save disk space
6. **Use multi-stage builds** to reduce image size
7. **Implement health checks** for container monitoring

## Development

To add a new sandbox:

1. Create `Dockerfile.<name>` with desired configuration
2. Add entry to `docker-compose.yml`
3. Build and test the image
4. Update this README with details
5. Add to backend sandbox service configuration

## Support

For issues or questions about sandbox configurations, refer to:
- Docker documentation: https://docs.docker.com/
- Playwright documentation: https://playwright.dev/
- Project repository: [Your repo URL]
