#!/bin/bash
# Init script - Check and install missing skills from clawhub

set -e

# Configuration
SKILLS_DIR="${HOME}/.openclaw/workspace/skills"
WORK_DIR="${HOME}/.openclaw/workspace"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔍 检查工作区初始化状态...${NC}"
echo ""

# Ensure skills directory exists
mkdir -p "$SKILLS_DIR"

# Read required skills from config
if [ ! -f "$SCRIPT_DIR/../config.json" ]; then
    echo -e "${RED}✗ 错误：找不到 config.json 配置文件${NC}"
    exit 1
fi

# Parse required skills from config
REQUIRED_SKILLS=$(grep -o '"[^"]*"' "$SCRIPT_DIR/../config.json" | grep -v 'requiredSkills' | tr -d '"' | tr '\n' ' ')

if [ -z "$REQUIRED_SKILLS" ]; then
    echo -e "${YELLOW}⚠️ 配置文件中未定义必需技能${NC}"
    exit 0
fi

echo -e "${BLUE}📋 必需技能清单：${NC}"
echo "$REQUIRED_SKILLS" | tr ' ' '\n' | sed '/^$/d' | while read -r skill; do
    echo -e "  • $skill"
done
echo ""

# Check each required skill
echo -e "${BLUE}🔍 检查本地技能安装状态...${NC}"
MISSING_SKILLS=""
INSTALLED_COUNT=0

for skill in $REQUIRED_SKILLS; do
    if [ -z "$skill" ]; then
        continue
    fi
    
    if [ -d "$SKILLS_DIR/$skill" ]; then
        echo -e "  ${GREEN}✓${NC} $skill"
        INSTALLED_COUNT=$((INSTALLED_COUNT + 1))
    else
        echo -e "  ${RED}✗${NC} $skill ${YELLOW}(缺失)${NC}"
        MISSING_SKILLS="$MISSING_SKILLS $skill"
    fi
done

echo ""

# Install missing skills from clawhub if any
if [ -z "$MISSING_SKILLS" ]; then
    echo -e "${GREEN}✅ 所有必需技能已安装完成！${NC}"
else
    echo -e "${YELLOW}📥 发现缺失的技能，开始从 clawhub 安装...${NC}"
    echo ""
    
    INSTALLED_NEW=0
    FAILED_SKILLS=""
    
    for skill in $MISSING_SKILLS; do
        if [ -z "$skill" ]; then
            continue
        fi
        
        echo -e "${BLUE}  正在安装: $skill...${NC}"
        if npx clawhub@latest install "$skill" --workdir "$WORK_DIR" --no-input 2>/dev/null; then
            echo -e "  ${GREEN}✓ 安装成功: $skill${NC}"
            INSTALLED_NEW=$((INSTALLED_NEW + 1))
        else
            echo -e "  ${RED}✗ 安装失败: $skill${NC}"
            FAILED_SKILLS="$FAILED_SKILLS $skill"
        fi
    done
    
    echo ""
    if [ $INSTALLED_NEW -gt 0 ]; then
        echo -e "${GREEN}✅ 成功安装 $INSTALLED_NEW 个技能${NC}"
    fi
    
    if [ -n "$FAILED_SKILLS" ]; then
        echo -e "${YELLOW}⚠️ 以下技能安装失败，可能需要手动处理：${NC}"
        for skill in $FAILED_SKILLS; do
            if [ -n "$skill" ]; then
                echo -e "    • $skill"
            fi
        done
    fi
fi

echo ""
echo -e "${BLUE}📊 统计摘要：${NC}"
echo -e "  必需技能总数: $(echo "$REQUIRED_SKILLS" | wc -w | tr -d ' ')"
echo -e "  已安装: $INSTALLED_COUNT"
echo -e "  本次安装: ${INSTALLED_NEW:-0}"
