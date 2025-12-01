# Deployment Guide

## Vercel Deployment (Recommended)

### Prerequisites
- GitHub account with repository
- Vercel account
- Supabase project (already configured via v0)

### Steps

1. **Push to GitHub**
   \`\`\`bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-repo-url>
   git push -u origin main
   \`\`\`

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js

3. **Environment Variables**
   
   All Supabase environment variables are already configured via the v0 integration:
   - `DATABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `POSTGRES_*` variables

   Optional variables to add:
   - `CORS_ORIGIN` - Your production domain (e.g., `https://your-app.vercel.app`)
   - `OPENAI_API_KEY` - If using OpenAI features
   - `GEMINI_API_KEY` - If using Gemini features

4. **Build Settings**
   - Build Command: `prisma generate && next build`
   - Output Directory: `.next`
   - Install Command: `npm install`

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Your app will be live at `https://your-project.vercel.app`

## Docker Deployment

### Build and Run Locally

\`\`\`bash
# Build the image
docker build -t crewai-orchestrator .

# Run the container
docker run -p 3000:3000 \
  -e DATABASE_URL="your-database-url" \
  -e NEXT_PUBLIC_SUPABASE_URL="your-supabase-url" \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key" \
  crewai-orchestrator
\`\`\`

### Using Docker Compose

\`\`\`bash
# Create .env file with your variables
cp .env.example .env

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
\`\`\`

## Manual Server Deployment

### Requirements
- Node.js 20+
- PostgreSQL 14+
- SSL certificate (for HTTPS)

### Steps

1. **Clone and Install**
   \`\`\`bash
   git clone <your-repo>
   cd crewai-orchestrator-ui
   npm install
   \`\`\`

2. **Configure Environment**
   \`\`\`bash
   cp .env.example .env
   # Edit .env with your production values
   \`\`\`

3. **Setup Database**
   \`\`\`bash
   npx prisma generate
   npx prisma migrate deploy
   \`\`\`

4. **Build Application**
   \`\`\`bash
   npm run build
   \`\`\`

5. **Start Production Server**
   \`\`\`bash
   npm start
   \`\`\`

   Or with PM2:
   \`\`\`bash
   npm install -g pm2
   pm2 start npm --name "crewai-orchestrator" -- start
   pm2 save
   pm2 startup
   \`\`\`

## CORS Configuration

For production, update your CORS settings in `next.config.mjs`:

\`\`\`javascript
const corsOrigin = process.env.CORS_ORIGIN || 'https://your-domain.com'
\`\`\`

Set the `CORS_ORIGIN` environment variable to your production domain.

## SSL/HTTPS

### Vercel
- Automatic SSL via Let's Encrypt
- Custom domains get SSL certificates automatically

### Manual Setup
Use Nginx as a reverse proxy:

\`\`\`nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
\`\`\`

## Monitoring

### Vercel Analytics
Already included via `@vercel/analytics` package.

### Custom Monitoring
Add environment variables:
- `SENTRY_DSN` - For error tracking
- `VERCEL_ANALYTICS_ID` - For analytics

## Troubleshooting

### Build Failures
1. Check Prisma generation: `npx prisma generate`
2. Verify environment variables are set
3. Check TypeScript errors: `npm run type-check`

### Database Connection Issues
1. Verify `DATABASE_URL` is correct
2. Check database is accessible from deployment environment
3. Ensure Supabase project is not paused

### CORS Errors
1. Set `CORS_ORIGIN` environment variable
2. Verify domain matches exactly (including https://)
3. Check headers in `next.config.mjs`

## Post-Deployment

1. **Test Authentication**
   - Try logging in
   - Verify email redirects work

2. **Check Real-time Updates**
   - Create an agent/task
   - Verify real-time notifications appear

3. **Monitor Performance**
   - Check Vercel Analytics
   - Monitor API response times
   - Review error logs

4. **Set up Supabase RLS**
   - Run script: `scripts/004_add_rls_policies.sql`
   - Verify policies work correctly
\`\`\`
