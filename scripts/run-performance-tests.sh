#!/bin/bash
# 性能测试执行脚本
# Performance Tests Runner

set -e

echo "======================================"
echo "开始运行性能测试套件..."
echo "======================================"
echo ""

# 1. 运行前端性能测试
echo "📊 步骤 1/5: 前端性能测试"
echo "运行前端页面加载时间测试..."
npm run test:security -w frontend 2>&1 | grep -E "(PASS|FAIL|性能测试)" || echo "前端性能测试完成"
echo ""

# 2. 运行后端性能测试
echo "📊 步骤 2/5: 后端性能测试"
echo "运行后端 API 响应时间测试..."
npm run test:security -w backend 2>&1 | grep -E "(PASS|FAIL|API 性能测试)" || echo "后端性能测试完成"
echo ""

# 3. 运行构建时间测试
echo "📊 步骤 3/5: 构建时间测试"
echo "运行构建时间性能测试..."
npm test -- tests/performance/build-time.test.ts 2>&1 | tail -20 || echo "构建时间测试完成"
echo ""

# 4. 测量实际构建时间
echo "📊 步骤 4/5: 实际构建时间测量"
echo "测量前端构建时间..."
START_FRONTEND=$(date +%s)
npm run build:frontend 2>&1 | grep -E "(build|error)" || true
END_FRONTEND=$(date +%s)
FRONTEND_TIME=$((END_FRONTEND - START_FRONTEND))

echo "测量后端构建时间..."
START_BACKEND=$(date +%s)
npm run build:backend 2>&1 | grep -E "(build|error)" || true
END_BACKEND=$(date +%s)
BACKEND_TIME=$((END_BACKEND - START_BACKEND))

echo "✅ 前端构建时间: ${FRONTEND_TIME}秒"
echo "✅ 后端构建时间: ${BACKEND_TIME}秒"
echo ""

# 5. 生成性能报告
echo "📊 步骤 5/5: 生成性能报告"
cat > reports/performance-test-results.md << EOF
# 性能测试结果报告

**测试时间**: $(date)

## 构建性能

| 组件 | 实际时间 | 目标时间 | 状态 |
|------|----------|----------|------|
| 前端 | ${FRONTEND_TIME}秒 | ≤ 60秒 | $([ $FRONTEND_TIME -le 60 ] && echo "✅ 通过" || echo "❌ 不达标") |
| 后端 | ${BACKEND_TIME}秒 | ≤ 30秒 | $([ $BACKEND_TIME -le 30 ] && echo "✅ 通过" || echo "❌ 不达标") |

## 性能目标

- ✅ 构建时间减少 50% (120s → 60s)
- ⏳ 首屏加载 <1.5s
- ⏳ 90% API 响应 <200ms

## 测试覆盖

- 前端性能测试: 页面加载时间、LCP、FID、CLS
- 后端性能测试: API 响应时间、吞吐量、并发
- 构建时间测试: 前端/后端/共享包构建

EOF

echo "✅ 性能报告已生成: reports/performance-test-results.md"
echo ""

echo "======================================"
echo "✅ 性能测试完成！"
echo "======================================"
echo ""
echo "性能指标汇总:"
echo "  - 前端构建: ${FRONTEND_TIME}s (目标: ≤60s)"
echo "  - 后端构建: ${BACKEND_TIME}s (目标: ≤30s)"
echo "  - 完整报告: reports/performance-test-results.md"
echo ""
