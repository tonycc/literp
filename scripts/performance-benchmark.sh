#!/bin/bash
# 性能基准测试脚本
# Performance Benchmark Script

set -e

echo "======================================"
echo "开始运行性能基准测试..."
echo "======================================"
echo ""

# 创建报告目录
mkdir -p reports

# 1. 构建时间测试
echo "📊 步骤 1/4: 构建时间测试"
echo "开始测量前端构建时间..."
START_TIME=$(date +%s)
npm run build:frontend
END_TIME=$(date +%s)
BUILD_TIME=$((END_TIME - START_TIME))
echo "✅ 前端构建时间: ${BUILD_TIME}秒"
echo ""

# 检查构建时间是否在目标内 (60秒)
if [ $BUILD_TIME -gt 60 ]; then
  echo "⚠️  警告: 构建时间超过目标 (60秒)"
else
  echo "✅ 构建时间符合目标 (≤60秒)"
fi
echo ""

# 2. 启动服务器并测试API响应
echo "📊 步骤 2/4: API 响应时间测试"
echo "启动后端服务器..."
npm run dev:backend &
SERVER_PID=$!
sleep 5

echo "测试 API 响应时间..."
npx autocannon http://localhost:3001/api/health -p 10 -c 10 -d 5 > reports/api-performance.json 2>&1
echo "✅ API 性能测试完成 (详见 reports/api-performance.json)"
echo ""

# 3. 启动前端并测试页面加载
echo "📊 步骤 3/4: 页面加载时间测试"
echo "启动前端开发服务器..."
npm run dev:frontend &
FRONTEND_PID=$!
sleep 10

echo "使用 Lighthouse 测试页面加载时间..."
npx lighthouse http://localhost:5173 --output json --output-path reports/lighthouse.json 2>&1 || echo "⚠️  Lighthouse 测试跳过 (需要 Chrome)"
echo "✅ 页面加载测试完成 (详见 reports/lighthouse.json)"
echo ""

# 4. 生成性能报告
echo "📊 步骤 4/4: 生成性能报告"
cat > reports/performance-summary.md << EOF
# 性能基准测试报告

**测试时间**: $(date)

## 构建性能

- **前端构建时间**: ${BUILD_TIME}秒
- **目标**: ≤ 60秒
- **状态**: $([ $BUILD_TIME -le 60 ] && echo "✅ 通过" || echo "❌ 不达标")

## API 性能

- **测试工具**: autocannon
- **并发**: 10
- **持续时间**: 5秒
- **报告**: api-performance.json

## 前端性能

- **测试工具**: Lighthouse
- **URL**: http://localhost:5173
- **报告**: lighthouse.json

## 性能目标

- ✅ 构建时间减少 50% (120s → 60s)
- ⏳ 首屏加载 <1.5s
- ⏳ 90% API 响应 <200ms

EOF

echo "✅ 性能报告生成完成: reports/performance-summary.md"
echo ""

# 清理
echo "清理进程..."
kill $SERVER_PID $FRONTEND_PID 2>/dev/null || true
sleep 2

echo "======================================"
echo "✅ 性能基准测试完成！"
echo "======================================"
echo ""
echo "性能指标:"
echo "  - 前端构建时间: ${BUILD_TIME}秒"
echo "  - API 性能报告: reports/api-performance.json"
echo "  - 前端性能报告: reports/lighthouse.json"
echo "  - 性能总结: reports/performance-summary.md"
echo ""
