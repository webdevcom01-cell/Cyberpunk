#!/bin/bash
# Start CrewAI Orchestrator

echo "🚀 Starting CrewAI Orchestrator..."
echo ""

# Kill any existing process on port 3000
lsof -ti:3000 | xargs kill -9 2>/dev/null

# Wait a moment
sleep 1

# Start the development server
echo "📦 Starting Next.js server..."
npm run dev &

# Wait for server to be ready
echo "⏳ Waiting for server to start..."
sleep 5

# Check if server is running
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Server is running!"
    echo ""
    echo "🌐 Opening browser..."
    open http://localhost:3000
    echo ""
    echo "=========================================="
    echo "  CrewAI Orchestrator is now running!"
    echo "  URL: http://localhost:3000"
    echo "=========================================="
    echo ""
    echo "Press Ctrl+C to stop the server"
else
    echo "❌ Server failed to start"
    echo "Check the terminal for errors"
fi

# Keep script running
wait
