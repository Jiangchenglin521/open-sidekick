#!/bin/bash
# check-skills.sh - 检查必需技能是否已安装，缺失的自动从 clawhub 安装

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# 路径配置
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_FILE="$SCRIPT_DIR/../config.json"
SKILLS_DIR="${HOME}/.openclaw/workspace/skills"
WORK_DIR="${HOME}/.openclaw/workspace"

# 检查配置文件是否存在
if [ ! -f "$CONFIG_FILE" ]; then
    echo -e "${RED}✗ 错误：找不到配置文件 $CONFIG_FILE${NC}"
    exit 1
fi

echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}              技能安装检查工具                                 ${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
echo ""

# 从 config.json 读取 requiredSkills 列表
echo -e "${BLUE}📋 读取必需技能配置...${NC}"

# 使用 Python 解析 JSON（更可靠）
if command -v python3 &> /dev/null; then
    REQUIRED_SKILLS=$(python3 -c "
import json
with open('$CONFIG_FILE', 'r', encoding='utf-8') as f:
    config = json.load(f)
    skills = config.get('requiredSkills', [])
    print(' '.join(skills))
")
else
    echo -e "${RED}✗ 错误：需要安装 python3 来解析 JSON${NC}"
    exit 1
fi

if [ -z "$REQUIRED_SKILLS" ]; then
    echo -e "${YELLOW}⚠️ 配置文件中未定义必需技能${NC}"
    exit 0
fi

SKILL_COUNT=$(echo "$REQUIRED_SKILLS" | wc -w | tr -d ' ')
echo -e "  发现 $SKILL_COUNT 个必需技能"
echo ""

# 显示技能清单
echo -e "${BLUE}📋 必需技能清单：${NC}"
for skill in $REQUIRED_SKILLS; do
    echo -e "  • $skill"
done
echo ""

# 检查每个技能的安装状态
echo -e "${BLUE}🔍 检查本地技能安装状态...${NC}"
INSTALLED_SKILLS=()
MISSING_SKILLS=()

for skill in $REQUIRED_SKILLS; do
    if [ -z "$skill" ]; then
        continue
    fi
    
    if [ -d "$SKILLS_DIR/$skill" ]; then
        echo -e "  ${GREEN}✓${NC} $skill"
        INSTALLED_SKILLS+=("$skill")
    else
        echo -e "  ${RED}✗${NC} $skill ${YELLOW}(缺失)${NC}"
        MISSING_SKILLS+=("$skill")
    fi
done

echo ""

# 安装缺失的技能
INSTALLED_NEW=0
FAILED_SKILLS=()

if [ ${#MISSING_SKILLS[@]} -eq 0 ]; then
    echo -e "${GREEN}✅ 所有必需技能已安装完成！${NC}"
else
    echo -e "${YELLOW}📥 发现 ${#MISSING_SKILLS[@]} 个缺失技能，开始从 clawhub 安装...${NC}"
    echo ""
    
    for skill in "${MISSING_SKILLS[@]}"; do
        echo -e "${BLUE}  正在安装: $skill...${NC}"
        
        # 尝试从 clawhub 安装
        if npx clawhub@latest install "$skill" --workdir "$WORK_DIR" --no-input 2>/dev/null; then
            echo -e "  ${GREEN}✓ 安装成功: $skill${NC}"
            INSTALLED_NEW=$((INSTALLED_NEW + 1))
            INSTALLED_SKILLS+=("$skill")
        else
            echo -e "  ${RED}✗ 安装失败: $skill${NC}"
            FAILED_SKILLS+=("$skill")
        fi
        echo ""
    done
fi

# 输出总结
echo ""
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}                      安装结果汇总                             ${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
echo ""

TOTAL_REQUIRED=${#REQUIRED_SKILLS[@]}
TOTAL_INSTALLED=${#INSTALLED_SKILLS[@]}
TOTAL_FAILED=${#FAILED_SKILLS[@]}

# 统计原始数组长度（bash 数组的特殊处理）
ORIGINAL_COUNT=0
for _ in $REQUIRED_SKILLS; do
    ORIGINAL_COUNT=$((ORIGINAL_COUNT + 1))
done

echo -e "  ${BLUE}统计摘要：${NC}"
echo -e "    必需技能总数: ${ORIGINAL_COUNT}"
echo -e "    已安装: ${GREEN}${TOTAL_INSTALLED}${NC}"
echo -e "    本次新安装: ${GREEN}${INSTALLED_NEW}${NC}"

if [ ${#MISSING_SKILLS[@]} -gt 0 ]; then
    echo -e "    本次尝试安装: ${YELLOW}${#MISSING_SKILLS[@]}${NC}"
fi

if [ ${#FAILED_SKILLS[@]} -gt 0 ]; then
    echo -e "    安装失败: ${RED}${#FAILED_SKILLS[@]}${NC}"
    echo ""
    echo -e "  ${RED}以下技能安装失败：${NC}"
    for skill in "${FAILED_SKILLS[@]}"; do
        echo -e "    ${RED}• $skill${NC}"
    done
    echo ""
    echo -e "  ${YELLOW}可能原因：${NC}"
    echo -e "    • 技能名称拼写错误"
    echo -e "    • 技能不在 clawhub 上"
    echo -e "    • 网络连接问题"
    echo -e "    • 技能被标记为可疑（VirusTotal 检测）"
    echo ""
    echo -e "  ${CYAN}建议操作：${NC}"
    echo -e "    1. 检查技能名称是否正确"
    echo -e "    2. 访问 https://clawhub.com 确认技能存在"
    echo -e "    3. 检查网络连接"
    echo -e "    4. 如技能被标记可疑，请手动审查后安装"
    exit 1
else
    echo ""
    echo -e "${GREEN}✅ 所有必需技能检查完成！${NC}"
    exit 0
fi
