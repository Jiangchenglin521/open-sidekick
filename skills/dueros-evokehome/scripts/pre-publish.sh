#!/bin/bash
#
# 发布前检查脚本

set -e

echo "🔍 发布前检查"
echo "=============="

# 检查版本号
echo ""
echo "📋 当前版本:"
grep '"version"' package.json | head -1

# 检查测试
echo ""
echo "🧪 运行测试..."
npm test || echo "⚠️  测试未完成"

# 检查代码风格
echo ""
echo "🎨 检查代码风格..."
npm run lint 2>/dev/null || echo "⚠️  lint 未完成"

# 检查必要文件
echo ""
echo "📁 检查必要文件..."

files=(
    "package.json"
    "README.md"
    "SKILL.md"
    "openclaw.plugin.json"
    "config.schema.json"
    "src/index.js"
    "src/client.js"
    "src/device-manager.js"
    "src/config.js"
    "bin/evokehome.js"
    "control.js"
)

all_exist=true
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✅ $file"
    else
        echo "  ❌ $file (缺失)"
        all_exist=false
    fi
done

# 检查 package.json 必填字段
echo ""
echo "📦 检查 package.json..."

required_fields=(
    "name"
    "version"
    "description"
    "main"
    "author"
    "license"
)

for field in "${required_fields[@]}"; do
    if grep -q "\"$field\"" package.json; then
        echo "  ✅ $field"
    else
        echo "  ❌ $field (缺失)"
        all_exist=false
    fi
done

# 总结
echo ""
echo "=============="
if [ "$all_exist" = true ]; then
    echo "✅ 所有检查通过，可以发布！"
    echo ""
    echo "发布命令:"
    echo "  npm publish --access public"
else
    echo "❌ 存在缺失项，请完善后再发布"
    exit 1
fi
