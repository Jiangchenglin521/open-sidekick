#!/bin/bash
# init.sh - Init 技能主入口脚本
# 功能：1. 检查必需技能是否安装，缺失则自动安装
#       2. 检查已安装技能的配置参数是否完整

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

# 显示欢迎信息
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}              OpenClaw 工作区初始化工具                        ${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${CYAN}本工具将完成以下检查：${NC}"
echo -e "  1. 检查必需技能是否已安装，缺失的自动从 clawhub 安装"
echo -e "  2. 检查已安装技能的配置参数（API Key、OAuth 等）"
echo -e "  3. 生成配置报告，提醒补全缺失的配置"
echo ""

# 检查模式
CHECK_ONLY=false
SKIP_CONFIG=false

# 解析命令行参数
while [[ $# -gt 0 ]]; do
    case $1 in
        --check-only)
            CHECK_ONLY=true
            shift
            ;;
        --skip-config)
            SKIP_CONFIG=true
            shift
            ;;
        --help|-h)
            echo "用法: bash init.sh [选项]"
            echo ""
            echo "选项:"
            echo "  --check-only    仅检查，不安装缺失的技能"
            echo "  --skip-config   跳过配置参数检查"
            echo "  --help, -h      显示此帮助信息"
            echo ""
            echo "示例:"
            echo "  bash init.sh                    # 完整检查并安装"
            echo "  bash init.sh --check-only       # 仅检查，不安装"
            echo "  bash init.sh --skip-config      # 只检查技能，不检查配置"
            exit 0
            ;;
        *)
            echo -e "${RED}未知选项: $1${NC}"
            echo "使用 --help 查看帮助"
            exit 1
            ;;
    esac
done

# 第一步：检查技能安装
SKILL_CHECK_STATUS=0
if [ "$CHECK_ONLY" = true ]; then
    echo -e "${YELLOW}[检查模式] 仅检查，不安装缺失技能${NC}"
    echo ""
    # 在检查模式下，手动执行检查逻辑
    CONFIG_FILE="$SCRIPT_DIR/../config.json"
    if [ -f "$CONFIG_FILE" ] && command -v python3 &> /dev/null; then
        REQUIRED_SKILLS=$(python3 -c "
import json
with open('$CONFIG_FILE', 'r', encoding='utf-8') as f:
    config = json.load(f)
    skills = config.get('requiredSkills', [])
    print(' '.join(skills))
")
        SKILLS_DIR="${HOME}/.openclaw/workspace/skills"
        
        echo -e "${BLUE}📋 必需技能清单：${NC}"
        for skill in $REQUIRED_SKILLS; do
            if [ -d "$SKILLS_DIR/$skill" ]; then
                echo -e "  ${GREEN}✓${NC} $skill"
            else
                echo -e "  ${RED}✗${NC} $skill ${YELLOW}(缺失)${NC}"
                SKILL_CHECK_STATUS=1
            fi
        done
        echo ""
        
        if [ $SKILL_CHECK_STATUS -eq 0 ]; then
            echo -e "${GREEN}✅ 所有必需技能已安装！${NC}"
        else
            echo -e "${YELLOW}⚠️  发现缺失技能，运行不带 --check-only 参数以自动安装${NC}"
        fi
    fi
else
    echo -e "${BLUE}[1/2] 检查并安装必需技能...${NC}"
    echo ""
    if ! bash "$SCRIPT_DIR/check-skills.sh"; then
        SKILL_CHECK_STATUS=1
    fi
fi

echo ""

# 第二步：检查配置参数
CONFIG_CHECK_STATUS=0
if [ "$SKIP_CONFIG" = false ]; then
    echo -e "${BLUE}[2/2] 检查技能配置参数...${NC}"
    echo ""
    if ! bash "$SCRIPT_DIR/check-configs.sh"; then
        CONFIG_CHECK_STATUS=2
    fi
else
    echo -e "${YELLOW}[跳过] 配置参数检查${NC}"
fi

echo ""
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}                      初始化完成                               ${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
echo ""

# 最终状态判断
if [ $SKILL_CHECK_STATUS -eq 0 ] && [ $CONFIG_CHECK_STATUS -eq 0 ]; then
    echo -e "${GREEN}✅ 所有检查通过！工作区初始化完成。${NC}"
    exit 0
elif [ $SKILL_CHECK_STATUS -ne 0 ] && [ $CONFIG_CHECK_STATUS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  部分技能安装失败，请检查网络或手动安装。${NC}"
    exit 1
elif [ $SKILL_CHECK_STATUS -eq 0 ] && [ $CONFIG_CHECK_STATUS -ne 0 ]; then
    echo -e "${YELLOW}⚠️  部分技能缺少配置参数，请根据提示进行设置。${NC}"
    exit 2
else
    echo -e "${YELLOW}⚠️  技能安装和配置检查均存在问题，请分别处理。${NC}"
    exit 3
fi
