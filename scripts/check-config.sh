#!/bin/bash
# 配置检查脚本 - 部署前运行
# Usage: ./scripts/check-config.sh

echo "🔍 检查 omojoker 环境配置..."
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

# 检查 .env 文件
if [ -f ".env" ]; then
    echo -e "${GREEN}✓${NC} 根目录 .env 文件存在"
else
    echo -e "${RED}✗${NC} 根目录 .env 文件缺失"
    echo "   请复制 .env.example 到 .env 并填入配置"
    ERRORS=$((ERRORS + 1))
fi

# 检查 Tavily API Key
if [ -f ".env" ] && grep -q "TAVILY_API_KEY=your_" .env 2>/dev/null; then
    echo -e "${YELLOW}⚠${NC} TAVILY_API_KEY 未配置（可选，但推荐）"
    WARNINGS=$((WARNINGS + 1))
fi

# 检查 chinese-asr 配置
if [ -f "skills/chinese-asr/config.json" ]; then
    echo -e "${GREEN}✓${NC} chinese-asr/config.json 存在"
    if grep -q "YOUR_SECRET_ID_HERE\|YOUR_SECRET_KEY_HERE" skills/chinese-asr/config.json; then
        echo -e "${YELLOW}⚠${NC} chinese-asr 配置未填写真实密钥"
        echo "   请访问 https://console.cloud.tencent.com/cam/capi 获取"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo -e "${RED}✗${NC} chinese-asr/config.json 缺失"
    echo "   请复制 skills/chinese-asr/config.example.json 到 config.json"
    ERRORS=$((ERRORS + 1))
fi

# 检查 imap-smtp-email 配置
if [ -f "skills/imap-smtp-email/.env" ]; then
    echo -e "${GREEN}✓${NC} imap-smtp-email/.env 存在"
    if grep -q "your_email@gmail.com\|your_app_password" skills/imap-smtp-email/.env; then
        echo -e "${YELLOW}⚠${NC} imap-smtp-email 配置未填写真实邮箱信息"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo -e "${YELLOW}⚠${NC} imap-smtp-email/.env 缺失（可选）"
    echo "   如需邮件功能，请复制 .env.example 到 .env"
    WARNINGS=$((WARNINGS + 1))
fi

# 检查 openclaw 安装
if command -v openclaw &> /dev/null; then
    echo -e "${GREEN}✓${NC} openclaw CLI 已安装"
    openclaw --version 2>/dev/null | head -1
else
    echo -e "${RED}✗${NC} openclaw CLI 未安装"
    echo "   请运行: npm install -g openclaw"
    ERRORS=$((ERRORS + 1))
fi

# 检查 gateway 状态
if pgrep -f "openclaw-gateway" > /dev/null; then
    echo -e "${GREEN}✓${NC} openclaw-gateway 正在运行"
else
    echo -e "${YELLOW}⚠${NC} openclaw-gateway 未运行"
    echo "   请运行: openclaw gateway run"
    WARNINGS=$((WARNINGS + 1))
fi

echo ""
echo "========================================"
if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}🎉 所有检查通过！环境已就绪${NC}"
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠ 有 $WARNINGS 个警告，但核心功能可用${NC}"
else
    echo -e "${RED}✗ 有 $ERRORS 个错误需要修复${NC}"
    if [ $WARNINGS -gt 0 ]; then
        echo -e "${YELLOW}  另有 $WARNINGS 个警告${NC}"
    fi
    echo ""
    echo "请参考 README.md 的安装配置部分"
    exit 1
fi
