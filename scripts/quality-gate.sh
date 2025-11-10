#!/bin/bash
# 质量门禁检查脚本
# Quality Gate Check Script

set -e

echo "======================================"
echo "开始运行质量门禁检查..."
echo "======================================"
echo ""

# 1. TypeScript 编译检查
echo "📋 步骤 1/5: TypeScript 编译检查"
npx tsc --noEmit
if [ $? -ne 0 ]; then
  echo "❌ TypeScript 编译失败"
  exit 1
fi
echo "✅ TypeScript 编译通过"
echo ""

# 2. ESLint 检查
echo "📋 步骤 2/5: ESLint 检查"
npm run lint
if [ $? -ne 0 ]; then
  echo "❌ ESLint 检查失败"
  exit 1
fi
echo "✅ ESLint 检查通过"
echo ""

# 3. 运行测试
echo "📋 步骤 3/5: 运行测试"
npm test
if [ $? -ne 0 ]; then
  echo "❌ 测试失败"
  exit 1
fi
echo "✅ 所有测试通过"
echo ""

# 4. 测试覆盖率检查
echo "📋 步骤 4/5: 测试覆盖率检查"
npm run coverage
if [ $? -ne 0 ]; then
  echo "❌ 测试覆盖率不达标"
  exit 1
fi
echo "✅ 测试覆盖率达标 (≥80%)"
echo ""

# 5. 安全扫描
echo "📋 步骤 5/5: 安全扫描"
npm audit --audit-level=moderate
if [ $? -ne 0 ]; then
  echo "❌ 发现安全漏洞"
  exit 1
fi
echo "✅ 安全扫描通过"
echo ""

echo "======================================"
echo "✅ 所有质量门禁检查通过！"
echo "======================================"
echo ""
echo "质量检查结果:"
echo "  ✓ TypeScript 编译零错误"
echo "  ✓ ESLint 零警告"
echo "  ✓ 测试通过"
echo "  ✓ 测试覆盖率 ≥80%"
echo "  ✓ 安全扫描通过"
echo ""
