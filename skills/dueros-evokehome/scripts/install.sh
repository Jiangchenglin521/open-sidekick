#!/bin/bash
#
# DuerOS EvokeHome 安装脚本
# 一键安装和配置

set -e

echo "🏠 DuerOS EvokeHome 安装脚本"
echo "================================"

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 未检测到 Node.js，请先安装 Node.js 18+"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js 版本过低，需要 18+，当前: $(node -v)"
    exit 1
fi

echo "✅ Node.js 版本: $(node -v)"

# 安装依赖
echo ""
echo "📦 安装依赖..."
npm install

# 创建配置目录
CONFIG_DIR="$HOME/.config/dueros-evokehome"
mkdir -p "$CONFIG_DIR"

# 复制模板配置
if [ ! -f "$CONFIG_DIR/config.json" ]; then
    echo ""
    echo "📝 创建默认配置..."
    cp templates/config.json "$CONFIG_DIR/config.json"
    echo "✅ 配置模板已创建: $CONFIG_DIR/config.json"
fi

if [ ! -f "$CONFIG_DIR/devices.json" ]; then
    echo ""
    echo "📝 创建设备映射..."
    cp templates/devices.json "$CONFIG_DIR/devices.json"
    echo "✅ 设备映射已创建: $CONFIG_DIR/devices.json"
fi

# 创建命令链接
echo ""
echo "🔗 创建命令链接..."

# 检查是否可以全局安装
if [ -w "$(npm config get prefix)/bin" ] 2>/dev/null || [ -w "/usr/local/bin" ] 2>/dev/null; then
    npm link 2>/dev/null || true
    echo "✅ 命令已链接，可以使用: evokehome"
else
    echo "⚠️  需要管理员权限创建全局命令"
    echo "   可以手动运行: sudo npm link"
fi

echo ""
echo "================================"
echo "✅ 安装完成！"
echo ""
echo "下一步:"
echo "  1. 获取 DuerOS Token"
echo "  2. 运行: evokehome setup"
echo "  3. 开始使用语音控制"
echo ""
echo "更多帮助: evokehome help"
