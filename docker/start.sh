#!/bin/sh
echo "Starting DX01 Application..."

echo "Starting Node.js backend..."
cd /app/server
PORT=5000 node index.js &
BACKEND_PID=$!

echo "Waiting for backend to start..."
for i in $(seq 1 30); do
    if wget -q -O /dev/null http://localhost:5000/health 2>/dev/null; then
        echo "Backend is ready!"
        break
    fi
    if [ "$i" = "30" ]; then
        echo "Backend failed to start"
        exit 1
    fi
    sleep 1
done

echo "Starting Nginx..."
nginx -g "daemon off;" &
NGINX_PID=$!

trap 'echo Shutting down...; kill $BACKEND_PID $NGINX_PID 2>/dev/null; exit 0' SIGTERM SIGINT

wait $NGINX_PID $BACKEND_PID