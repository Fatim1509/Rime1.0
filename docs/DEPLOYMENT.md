# RIME Deployment Guide

## Prerequisites

- Node.js 18+
- Python 3.11+
- Docker & Docker Compose
- PostgreSQL 15
- Redis 7

## Local Development

### 1. Initial Setup
```bash
git clone <your-repo>
cd rime
chmod +x scripts/setup.sh
./scripts/setup.sh
```

### 2. Configure Environment
```bash
cp infrastructure/.env.example infrastructure/.env
# Edit .env with your API keys
```

### 3. Start Services
```bash
chmod +x scripts/dev-start.sh
./scripts/dev-start.sh
```

### 4. Access
- Dashboard: http://localhost:3000
- API: http://localhost:4000
- Screen Service: http://localhost:8000

## Docker Deployment

### Using Docker Compose
```bash
cd infrastructure
docker-compose up -d
```

### Individual Services
```bash
# Build images
docker build -t rime-core ./services/core-engine
docker build -t rime-screen ./services/screen-service
docker build -t rime-dashboard ./apps/dashboard

# Run containers
docker run -d -p 4000:4000 --env-file .env rime-core
docker run -d -p 8000:8000 --env-file .env rime-screen
docker run -d -p 3000:3000 --env-file .env rime-dashboard
```

## Cloud Deployment

### Vercel (Dashboard)

#### 1. Install Vercel CLI
```bash
npm i -g vercel
```

#### 2. Deploy
```bash
cd apps/dashboard
vercel --prod
```

#### 3. Environment Variables
Set in Vercel dashboard:
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_WS_URL`

### Railway (Core Engine)

#### 1. Install Railway CLI
```bash
npm i -g @railway/cli
```

#### 2. Deploy
```bash
cd services/core-engine
railway up
```

#### 3. Add Services
```bash
railway add postgresql
railway add redis
```

#### 4. Environment Variables
Set in Railway dashboard or via CLI

### Render (Screen Service)

#### 1. Create `render.yaml`
```yaml
services:
  - type: web
    name: rime-screen-service
    env: python
    buildCommand: pip install -r requirements.txt
    startCommand: python capture.py
    envVars:
      - key: ENABLE_MOCK
        value: true
      - key: CAPTURE_INTERVAL
        value: 3000
```

#### 2. Deploy
```bash
render blueprint sync
```

### AWS (Full Stack)

#### Core Engine (ECS/Fargate)
```bash
# Build and push to ECR
aws ecr create-repository --repository-name rime-core
docker build -t rime-core ./services/core-engine
docker tag rime-core:latest <account>.dkr.ecr.us-east-1.amazonaws.com/rime-core:latest
docker push <account>.dkr.ecr.us-east-1.amazonaws.com/rime-core:latest

# Create ECS task definition and service
# Use AWS Console or Terraform
```

#### Database (RDS)
```bash
aws rds create-db-instance \
  --db-instance-identifier rime-postgres \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --master-username admin \
  --master-user-password <password>
```

#### Cache (ElastiCache)
```bash
aws elasticache create-cache-cluster \
  --cache-cluster-id rime-redis \
  --cache-node-type cache.t3.micro \
  --engine redis \
  --num-cache-nodes 1
```

## Database Setup

### PostgreSQL Migrations
```sql
-- Create database
CREATE DATABASE rime;

-- Create tables (add as needed)
CREATE TABLE sessions (
  id UUID PRIMARY KEY,
  user_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE actions (
  id UUID PRIMARY KEY,
  agent_id VARCHAR(50),
  type VARCHAR(50),
  status VARCHAR(20),
  payload JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Redis Setup
```bash
# No special setup required
# Just ensure connection string is correct
redis-cli ping
```

### Pinecone Setup
```bash
# Create index via Pinecone dashboard or API
curl -X POST "https://controller.<environment>.pinecone.io/databases" \
  -H "Api-Key: <your-api-key>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "rime-memory",
    "dimension": 1536,
    "metric": "cosine"
  }'
```

## Environment Variables

### Production
```bash
# Core Services
PORT=4000
NODE_ENV=production

# AI
GOOGLE_AI_API_KEY=<your-key>

# Database
POSTGRES_URL=<production-url>
REDIS_URL=<production-url>
PINECONE_API_KEY=<your-key>

# Security
JWT_SECRET=<random-secure-string>
SESSION_SECRET=<random-secure-string>
CORS_ORIGIN=https://yourdomain.com

# Features
ENABLE_MOCK=false
ENABLE_SCREEN_CAPTURE=true
```

## SSL/TLS Setup

### Nginx Reverse Proxy
```nginx
server {
    listen 443 ssl;
    server_name yourdomain.com;

    ssl_certificate /etc/ssl/certs/cert.pem;
    ssl_certificate_key /etc/ssl/private/key.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:4000;
    }

    location /socket.io {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

## Monitoring

### Health Checks
```bash
# Add to your monitoring tool (DataDog, New Relic, etc.)
curl https://yourdomain.com/health
curl https://yourdomain.com/api/health
curl https://screen.yourdomain.com/health
```

### Logging
```bash
# Use structured logging
# Winston (Node.js) or Python logging module
# Send to CloudWatch, LogDNA, or similar
```

## Scaling

### Horizontal Scaling
```bash
# Run multiple instances behind load balancer
# Use Redis for shared state
# WebSocket sticky sessions required
```

### Auto-scaling (AWS)
```bash
# Set up ECS auto-scaling
aws application-autoscaling register-scalable-target \
  --service-namespace ecs \
  --scalable-dimension ecs:service:DesiredCount \
  --resource-id service/rime-cluster/rime-core \
  --min-capacity 2 \
  --max-capacity 10
```

## Backup & Recovery

### Database Backups
```bash
# PostgreSQL automated backups
pg_dump -U user -d rime > backup.sql

# Restore
psql -U user -d rime < backup.sql
```

### Redis Persistence
```bash
# Enable AOF
redis-cli CONFIG SET appendonly yes
```

## Troubleshooting

### Common Issues

#### WebSocket not connecting
- Check CORS settings
- Verify WS_URL environment variable
- Ensure port 4000 is accessible

#### Screen capture failing
- Set ENABLE_MOCK=true for testing
- Check display environment variables
- Verify X11 permissions (Linux)

#### Gemini API errors
- Verify API key is valid
- Check rate limits
- Ensure billing is enabled

## Security Checklist

- [ ] API keys in environment variables
- [ ] SSL/TLS enabled in production
- [ ] Database connections encrypted
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Authentication implemented
- [ ] Input validation on all endpoints
- [ ] Logging of security events
