# Socio Website

A full-stack social platform for events and communities.

## 🚀 Live Demo
- **Frontend**: [Your Vercel URL will be here]
- **API**: [Your Railway URL will be here]

## 🛠️ Tech Stack
- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Express.js, Node.js
- **Database**: Supabase
- **Authentication**: Supabase Auth

## 📁 Project Structure
```
├── client/          # Next.js frontend
├── server/          # Express.js backend
└── README.md
```

## 🔧 Local Development

### Frontend (client)
```bash
cd client
npm install
npm run dev
```

### Backend (server)
```bash
cd server
npm install
npm run dev
```

## 🌍 Environment Variables

### Client (.env.local)
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Server (.env)
```
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
PORT=3001
```

## 🚀 Deployment

- **Frontend**: Deployed on Vercel
- **Backend**: Deployed on Railway
- **Database**: Supabase (managed)

## 📚 Additional Resources

- **[Hosting Analysis & Recommendations](./HOSTING_ANALYSIS.md)** - Complete analysis of your current hosting stack and alternatives
- **[Migration Guide](./MIGRATION_GUIDE.md)** - Step-by-step instructions for migrating to different hosting solutions
- **[Cost Optimization Guide](./COST_OPTIMIZATION.md)** - Tips to reduce hosting costs while maintaining performance

## 💰 Hosting Cost Summary

**Current Setup**: $5/month
- Vercel (Frontend): **Free**
- Railway (Backend): **$5/month** 
- Supabase (Database): **Free**

**Alternatives**:
- Netlify Functions: **$0/month** (requires backend refactoring)
- Self-hosted VPS: **$4-6/month** (requires server management)
- Firebase: **$0/month** (requires significant migration)

**Recommendation**: Keep current setup - it's optimized and cost-effective!

## 📧 Contact
For questions or support, reach out to the team.