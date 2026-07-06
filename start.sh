#!/bin/bash
# 恒伟智慧商业会员营销平台 - 一键部署启动脚本
# 用法: ./start.sh
set -e

WORKSPACE=$(cd "$(dirname "$0")" && pwd)
cd "$WORKSPACE"

echo "========================================"
echo "  恒伟智慧商业会员营销平台 部署启动"
echo "========================================"

# 1. 构建前端
echo "[1/3] 构建前端生产版本..."
cd frontend
if [ ! -d node_modules ]; then
  npm install --silent
fi
npm run build
cd ..

# 2. 安装后端依赖（如需）
echo "[2/3] 检查后端依赖..."
cd mock-server
if [ ! -d node_modules ]; then
  npm install --silent
fi
cd ..

# 3. 启动统一服务
echo "[3/3] 启动服务..."
PORT=${PORT:-8080}
HOST=${HOST:-0.0.0.0}
echo "服务端口: $PORT"
echo "访问地址: http://localhost:$PORT"
echo "默认账号: admin / admin"
echo "----------------------------------------"
exec node mock-server/server.js
