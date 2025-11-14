# Deployment Guide - Chess.io Server to Fly.io

## Prerequisites
- Fly.io account (https://fly.io)
- Fly.io CLI installed (`flyctl`)
- Logged in to Fly.io (`flyctl auth login`)

## Files Added/Modified for Deployment

### New Files
- `fly.toml` - Fly.io configuration file
- `server/Dockerfile` - Docker container configuration
- `server/.dockerignore` - Docker build ignore patterns
- `.dockerignore` - Root level docker ignore (optional)

### Modified Files
- `server/index.js` - Added `/ping` health check endpoint
- `package.json` - Added @flydotio/dockerfile dev dependency

## Health Check Endpoints

The server has two health check endpoints configured:

### 1. Ping Endpoint (Primary Health Check)
```
GET /ping
Response: { "pong": true, "timestamp": "2025-11-14T11:37:34.721Z" }
```
Used by Fly.io for automatic health monitoring (every 30 seconds)

### 2. Health Endpoint (Secondary)
```
GET /api/health
Response: { "status": "Server is running", "timestamp": "2025-11-14T11:37:38.137Z" }
```

## Fly.io Configuration (fly.toml)

Key settings:
- **App Name**: chess-io-server
- **Primary Region**: bom (Mumbai, India)
- **Port**: 5000
- **CPU**: Shared (1x)
- **Memory**: 1GB
- **Health Check**: `/ping` endpoint
  - Interval: 30 seconds
  - Timeout: 10 seconds
  - Grace Period: 5 seconds (wait before first check)

## Deployment Steps

### Step 1: Ensure you're in the project root
```bash
cd /path/to/chess.io
```

### Step 2: Add Fly.io remote (if not already added)
```bash
git remote add fly <your-fly-git-url>
```

### Step 3: Deploy to Fly.io
```bash
flyctl deploy
```

Or with options:
```bash
# Deploy with extended timeout
flyctl deploy --wait-timeout=300s

# Deploy with no automatic start (for review)
flyctl deploy --detach

# Deploy and skip DNS checks
flyctl deploy --no-dns-checks
```

### Step 4: Monitor Deployment
```bash
# View logs
flyctl logs

# Check app status
flyctl status

# Check machine status
flyctl machines list
```

### Step 5: Verify Deployment
```bash
# Test ping endpoint
curl https://chess-io-server.fly.dev/ping

# Test health endpoint
curl https://chess-io-server.fly.dev/api/health
```

## Troubleshooting

### Deployment Timeout
If you get "timeout reached waiting for machine's state to change":

1. Try with extended timeout:
   ```bash
   flyctl deploy --wait-timeout=600s
   ```

2. Or deploy in detached mode and monitor separately:
   ```bash
   flyctl deploy --detach
   flyctl logs -n 100  # View last 100 log lines
   ```

### Health Check Failures
If health checks are failing:

1. Check app logs:
   ```bash
   flyctl logs --level info
   ```

2. SSH into machine for debugging:
   ```bash
   flyctl ssh console
   ```

3. Test health endpoint locally:
   ```bash
   curl http://localhost:5000/ping
   ```

### Port Issues
The server runs on port 5000 internally but is exposed on ports 80/443 through Fly.io's load balancer.

## Environment Variables

Current environment in fly.toml:
- `PORT=5000` - Server port
- `NODE_ENV=production` - Node environment

To add secrets:
```bash
flyctl secrets set SOME_SECRET=value
```

## Auto-Scaling Configuration

Current setup:
- `min_machines_running = 0` - App can scale to zero when idle
- `auto_stop_machines = 'stop'` - Machines stop when not needed
- `auto_start_machines = true` - Machines auto-start on requests
- `force_https = true` - All traffic redirected to HTTPS

To allocate a dedicated IPv4:
```bash
flyctl ips allocate-v4
```

## Rollback

To rollback to previous deployment:
```bash
flyctl releases
flyctl releases rollback
```

## Additional Resources

- Fly.io Documentation: https://fly.io/docs/
- Fly.io Dashboard: https://fly.io/apps/chess-io-server
- Node.js on Fly.io: https://fly.io/docs/languages-and-frameworks/nodejs/

## Notes

- The app uses multi-stage Docker build for optimization
- Only production dependencies are included in the final image
- dumb-init is used as the entrypoint to handle signals properly
- Socket.IO is configured for WebSocket connections
- CORS is configured to allow connections from the frontend

---
**Last Updated**: 2025-11-14
**Server Version**: Node.js 18-alpine
**App Status**: Ready for deployment
