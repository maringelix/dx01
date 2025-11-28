#!/bin/sh
set -e

echo "🚀 Starting DX01 Application..."

# Start backend in background
echo "📦 Starting Node.js backend..."
cd /app/server
PORT=5000 node index.js &
BACKEND_PID=$!

# Wait for backend to be ready
echo "⏳ Waiting for backend to start..."
for i in $(seq 1 30); do
    if wget -q -O /dev/null http://localhost:5000/health 2>/dev/null; then
        echo "✅ Backend is ready!"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "❌ Backend failed to start"
        exit 1
    fi
    sleep 1
done

# Start nginx in foreground
echo "🌐 Starting Nginx..."
nginx -g 'daemon off;' &
NGINX_PID=$!

# Trap signals and shutdown gracefully
trap "echo '🛑 Shutting down...'; kill $BACKEND_PID $NGINX_PID; exit 0" SIGTERM SIGINT

# Wait for processes
wait $NGINX_PID $BACKEND_PID
