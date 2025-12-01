# Environment Variables Setup Guide

## Quick Start

Run the setup script:
\`\`\`bash
chmod +x scripts/setup-env.sh
./scripts/setup-env.sh
\`\`\`

Or manually copy the example files:
\`\`\`bash
cp .env.example .env
cp .env.local.example .env.local
\`\`\`

## Required Variables

### Database (Supabase)
Already configured via Vercel integration. These are automatically set:
- `DATABASE_URL` - PostgreSQL connection string
- `POSTGRES_URL` - Same as DATABASE_URL
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Public anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Server-side secret key

### Application
- `NODE_ENV` - Set to "production" for production builds
- `NEXT_PUBLIC_APP_URL` - Your application URL
- `CORS_ORIGIN` - Allowed origins for CORS (production domain)

## Optional Variables

### AI Features
If you want to use AI agents:
- `GEMINI_API_KEY` - Google Gemini API key
- `OPENAI_API_KEY` - OpenAI API key
- `ANTHROPIC_API_KEY` - Anthropic Claude API key

Get keys from:
- Gemini: https://makersuite.google.com/app/apikey
- OpenAI: https://platform.openai.com/api-keys
- Anthropic: https://console.anthropic.com/

### Rate Limiting
- `RATE_LIMIT_WINDOW_MS` - Time window in milliseconds (default: 900000 = 15 min)
- `RATE_LIMIT_MAX_REQUESTS` - Max requests per window (default: 100)

### Monitoring
- `VERCEL_ANALYTICS_ID` - Vercel Analytics ID
- `SENTRY_DSN` - Sentry error tracking DSN

### Webhooks
- `WEBHOOK_SECRET` - Secret for webhook verification
- `SLACK_WEBHOOK_URL` - Slack webhook for notifications

## Environment-Specific Configuration

### Development (.env.local)
\`\`\`env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000
\`\`\`

### Production (.env.production)
\`\`\`env
NEXT_PUBLIC_API_URL=https://your-domain.com/api
CORS_ORIGIN=https://your-domain.com
NODE_ENV=production
\`\`\`

## Security Best Practices

1. **Never commit .env files** - They're in .gitignore
2. **Use different keys** for development and production
3. **Rotate keys regularly** - Especially after team changes
4. **Use Vercel Secrets** for production deployment
5. **Limit CORS origins** to your actual domains only

## Troubleshooting

### Database Connection Issues
- Verify DATABASE_URL is correct
- Check if Supabase project is active
- Ensure IP whitelist includes your location

### Auth Issues
- Verify SUPABASE_ANON_KEY and SERVICE_ROLE_KEY
- Check redirect URLs in Supabase dashboard
- Ensure NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL matches

### CORS Errors
- Add your domain to CORS_ORIGIN
- Include protocol (https://)
- Don't use wildcards in production

## Deployment to Vercel

Vercel automatically uses environment variables from:
1. Project settings > Environment Variables
2. Integration-provided variables (Supabase, Neon, etc.)

Add custom variables in Vercel dashboard:
\`\`\`
Settings > Environment Variables > Add New
\`\`\`

Choose environment: Production, Preview, or Development
