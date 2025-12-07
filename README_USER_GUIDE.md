# CrewAI Orchestrator - AI Research & Automation Platform

🚀 **Simple, powerful AI-powered research and automation**

## ✨ What Can You Do?

### 🔍 AI Research (NEW!)
**Get instant research on any topic**
- Ask anything: "Research crypto market trends"
- Get comprehensive, structured reports
- Works in demo mode or with your own AI

### 💬 AI Chat (NEW!)
**Quick conversations with AI**
- Chat about any topic
- Get instant answers
- Interactive and easy to use

### 🤖 AI Agents
**Create autonomous AI agents**
- Define agents with specific roles
- Assign tasks and goals
- Monitor execution and performance

### 🔄 Workflows
**Automate complex processes**
- Build multi-step workflows
- Connect agents and tasks
- Schedule and monitor execution

---

## 🚀 Quick Start

### 1. Start the Server
```bash
npm run dev
```

Server will start at: **http://localhost:3000**

### 2. Try It Out!

**Option A: Demo Mode (No API Key Required)**
- Go to **AI Research** → Type: "Research crypto market trends"
- Go to **AI Chat** → Ask: "What are AI agents?"
- Demo mode provides mock intelligent responses

**Option B: Real AI (Requires API Key)**
1. Get an API key:
   - **OpenAI**: https://platform.openai.com/api-keys
   - **Gemini**: https://aistudio.google.com/app/apikey (FREE!)

2. Add to `.env.local`:
```bash
# For OpenAI
OPENAI_API_KEY=sk-your-key-here

# OR for Gemini (FREE!)
GEMINI_API_KEY=your-gemini-key-here
```

3. Restart server:
```bash
pkill -f next
npm run dev
```

4. Try again - now with real AI! 🎉

---

## 📂 Main Features

### 🌟 Simple Features (Start Here!)
- **AI Research** (`/research`) - Research any topic
- **AI Chat** (`/chat`) - Chat with AI
- **Home** (`/`) - Overview and quick start

### 🔧 Advanced Features
- **Agents** (`/agents`) - Manage AI agents
- **Tasks** (`/tasks`) - Define and track tasks
- **Workflows** (`/workflows`) - Build automation
- **Analytics** (`/analytics`) - Performance metrics
- **Observability** (`/observability`) - Execution traces

---

## 🗄️ Database Setup

The app uses Supabase. Run this SQL in Supabase SQL Editor:

```sql
-- Enable RLS and create policies
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to agents" ON agents FOR ALL USING (true);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to tasks" ON tasks FOR ALL USING (true);

ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to workflows" ON workflows FOR ALL USING (true);

-- Add missing columns
ALTER TABLE workflows ADD COLUMN IF NOT EXISTS config JSONB DEFAULT '{}';
ALTER TABLE workflows ADD COLUMN IF NOT EXISTS nodes JSONB DEFAULT '[]';

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE agents;
ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE workflows;
```

---

## 🎯 Workflow Examples

### Example 1: Simple Research
1. Go to **AI Research**
2. Type: "Research top 3 AI trends in 2024"
3. Click "Start Research"
4. Get comprehensive report!

### Example 2: Chat Assistant
1. Go to **AI Chat**
2. Ask: "How do I start investing in crypto?"
3. Get instant advice
4. Continue conversation!

### Example 3: Create an Agent
1. Go to **Agents**
2. Click "+ Add Agent"
3. Fill in:
   - Name: "Research Agent"
   - Role: "Market Researcher"
   - Goal: "Analyze market trends"
4. Save!

---

## 🔑 Environment Variables

```bash
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# AI API Keys (Optional - for real AI)
OPENAI_API_KEY=sk-your-key-here  # OR
GEMINI_API_KEY=your-key-here     # Gemini is FREE!

# App
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 🎨 Tech Stack

- **Framework**: Next.js 16 with Turbopack
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **AI**: OpenAI GPT-4 or Google Gemini
- **UI**: Tailwind CSS v4 + shadcn/ui
- **Real-time**: Supabase Realtime

---

## 📝 Common Questions

**Q: Do I need an API key?**
A: No! It works in demo mode. Add API key for real AI responses.

**Q: Which AI should I use?**
A: Gemini is FREE and works great! OpenAI is more powerful but costs money.

**Q: Why isn't my research working?**
A: Check if server is running (`npm run dev`). Demo mode always works!

**Q: How do I get better results?**
A: Be specific! Instead of "crypto", try "Research Bitcoin price trends and factors affecting it in 2024"

---

## 🐛 Troubleshooting

**Server won't start:**
```bash
pkill -f next
rm -rf .next
npm run dev
```

**Database errors:**
- Run the SQL setup script above in Supabase

**AI not responding:**
- Check if API key is correct in `.env.local`
- Restart server after adding API key
- Demo mode always works as fallback!

---

## 🚀 Deployment

### Quick Deploy to Vercel

1. Push to GitHub
2. Connect to Vercel
3. Add environment variables
4. Deploy!

---

## 📧 Support

Having issues? Check:
1. Server is running: `npm run dev`
2. Database is set up (run SQL above)
3. `.env.local` has correct values

---

## 🎉 Start Building!

```bash
# Clone and install
npm install

# Start development
npm run dev

# Open browser
open http://localhost:3000
```

**Try AI Research now!** Go to `/research` and ask anything! 🚀
