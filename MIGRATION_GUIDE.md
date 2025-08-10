# Practical Migration Guide

This guide provides step-by-step instructions for migrating to alternative hosting solutions.

## 🎯 Option 1: Migrate to Netlify Functions (Save $5/month)

### Why Choose This?
- **Cost**: $0/month (completely free)
- **Performance**: Good for lightweight APIs
- **Complexity**: Medium (requires backend refactoring)

### Prerequisites
- Netlify account
- Basic understanding of serverless functions

### Step 1: Create Netlify Functions Structure
```bash
mkdir netlify/functions
```

### Step 2: Convert Express Routes to Netlify Functions

#### Current Express Route Example:
```javascript
// server/routes/userRoutes.js
app.get('/api/users', async (req, res) => {
  const { data, error } = await supabase.from('users').select('*');
  res.json({ data, error });
});
```

#### Converted Netlify Function:
```javascript
// netlify/functions/users.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod === 'GET') {
    const { data, error } = await supabase.from('users').select('*');
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ data, error })
    };
  }

  return {
    statusCode: 405,
    headers,
    body: JSON.stringify({ error: 'Method not allowed' })
  };
};
```

### Step 3: Update Frontend API Calls
```javascript
// Before (Railway)
const API_BASE = 'https://sociotest-production.up.railway.app/api';

// After (Netlify)
const API_BASE = 'https://your-site.netlify.app/.netlify/functions';

// Update all API calls
const response = await fetch(`${API_BASE}/users`);
```

### Step 4: Configure netlify.toml
```toml
[build]
  command = "npm run build"
  functions = "netlify/functions"
  publish = ".next"

[functions]
  node_bundler = "esbuild"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200
```

### Step 5: Environment Variables
Add to Netlify dashboard:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

### Step 6: Deploy
```bash
npm install -g netlify-cli
netlify deploy --build --prod
```

---

## 🎯 Option 2: Consolidate on Railway

### Why Choose This?
- **Cost**: $5-10/month (similar to current)
- **Performance**: Good
- **Complexity**: Low (minimal changes)

### Step 1: Create Railway Frontend Service
1. Go to Railway dashboard
2. Create new service from GitHub repo
3. Select the `client` folder
4. Set build command: `npm run build`
5. Set start command: `npm start`

### Step 2: Update Environment Variables
Set in Railway frontend service:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_API_URL=https://your-backend-service.railway.app
```

### Step 3: Update Backend CORS
```javascript
// server/index.js
app.use(cors({
  origin: [
    'https://your-frontend-service.railway.app',
    'http://localhost:3000' // for development
  ]
}));
```

### Step 4: Deploy Both Services
Railway will automatically deploy both services when you push to GitHub.

---

## 🎯 Option 3: Move to Firebase/Google Cloud

### Why Choose This?
- **Cost**: $0 for small apps
- **Performance**: Excellent (Google infrastructure)
- **Complexity**: High (requires significant refactoring)

### Step 1: Set up Firebase Project
```bash
npm install -g firebase-tools
firebase login
firebase init
```

### Step 2: Convert to Cloud Functions
```javascript
// functions/index.js
const functions = require('firebase-functions');
const express = require('express');
const app = express();

app.get('/users', async (req, res) => {
  // Your logic here
  res.json({ data: 'users' });
});

exports.api = functions.https.onRequest(app);
```

### Step 3: Database Migration
You'd need to migrate from PostgreSQL (Supabase) to Firestore, which requires significant data structure changes.

---

## 🎯 Option 4: Self-Hosted VPS

### Why Choose This?
- **Cost**: $4-6/month
- **Performance**: Good (single region)
- **Complexity**: High (server management required)

### Step 1: Set up VPS
1. Create DigitalOcean/Hetzner droplet (Ubuntu 22.04)
2. Set up SSH access
3. Install Docker and Docker Compose

### Step 2: Create docker-compose.yml
```yaml
version: '3.8'
services:
  frontend:
    build: ./client
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:3001
    depends_on:
      - backend

  backend:
    build: ./server
    ports:
      - "3001:3001"
    environment:
      - SUPABASE_URL=${SUPABASE_URL}
      - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - frontend
      - backend
```

### Step 3: Set up CI/CD with GitHub Actions
```yaml
# .github/workflows/deploy.yml
name: Deploy to VPS
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to server
        uses: appleboy/ssh-action@v0.1.5
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          script: |
            cd /var/www/sociotest
            git pull
            docker-compose down
            docker-compose up -d --build
```

---

## 🚦 Quick Decision Matrix

| Factor | Keep Current | Netlify Functions | Railway Only | VPS |
|--------|-------------|-------------------|--------------|-----|
| **Monthly Cost** | $5 | $0 | $5-10 | $4-6 |
| **Setup Time** | 0 hours | 8-12 hours | 2-4 hours | 12-20 hours |
| **Maintenance** | Low | Low | Low | High |
| **Performance** | Excellent | Good | Good | Good |
| **Scalability** | Excellent | Good | Good | Manual |
| **Learning Value** | Low | Medium | Low | High |

## 🎯 My Recommendation

**Keep your current setup** unless you have a specific reason to change:

1. **It's working well** - your app is successfully deployed and functional
2. **Cost is reasonable** - $5/month for a full-stack app is very fair
3. **Excellent performance** - Vercel + Railway is a proven combination
4. **Easy maintenance** - minimal DevOps overhead

**If you must cut costs**, go with **Netlify Functions**, but be prepared for:
- 8-12 hours of migration work
- Function limitations (cold starts, timeouts)
- More complex debugging

The time spent migrating could be better used building features for your app!