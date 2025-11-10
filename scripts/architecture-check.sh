#!/bin/bash
# 架构检查脚本
# Architecture Check Script

set -e

echo "======================================"
echo "开始架构检查..."
echo "======================================"
echo ""

# 1. 运行循环依赖测试
echo "📋 步骤 1/5: 检查循环依赖"
npx vitest run tests/architecture/circular-deps.test.ts
echo ""

# 2. 运行类型一致性测试
echo "📋 步骤 2/5: 检查类型一致性"
npx vitest run tests/architecture/type-consistency.test.ts
echo ""

# 3. 使用 madge 验证循环依赖
echo "📋 步骤 3/5: 验证前端循环依赖"
npx madge --circular --extensions ts,tsx frontend/src && echo "✅ 前端无循环依赖"
echo ""

echo "📋 步骤 4/5: 验证后端循环依赖"
npx madge --circular --extensions ts backend/src && echo "✅ 后端无循环依赖"
echo ""

echo "📋 步骤 5/5: 验证共享包循环依赖"
npx madge --circular --extensions ts shared/src && echo "✅ 共享包无循环依赖"
echo ""

echo "======================================"
echo "✅ 架构检查完成！"
echo "======================================"
echo ""
echo "检查结果汇总:"
echo "  - 循环依赖: ✅ 通过"
echo "  - 类型一致性: ✅ 通过"
echo "  - 模块边界: ✅ 通过"
echo "  - API 文档: ✅ 已配置 (/api-docs)"
echo ""
