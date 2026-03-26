#!/bin/bash
# check-configs.sh - 检查已安装技能的配置参数是否完整

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

# 检查配置文件是否存在
if [ ! -f "$CONFIG_FILE" ]; then
    echo -e "${RED}✗ 错误：找不到配置文件 $CONFIG_FILE${NC}"
    exit 1
fi

# 检查 Python 是否可用
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}✗ 错误：需要安装 python3 来解析 JSON${NC}"
    exit 1
fi

echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}              技能配置参数检查工具                             ${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
echo ""

# 获取已安装的技能列表
echo -e "${BLUE}🔍 扫描已安装技能...${NC}"
INSTALLED_SKILLS=()
for dir in "$SKILLS_DIR"/*/; do
    if [ -d "$dir" ]; then
        skill_name=$(basename "$dir")
        INSTALLED_SKILLS+=("$skill_name")
    fi
done

if [ ${#INSTALLED_SKILLS[@]} -eq 0 ]; then
    echo -e "${YELLOW}⚠️ 未发现已安装的技能${NC}"
    exit 0
fi

echo -e "  发现 ${#INSTALLED_SKILLS[@]} 个已安装技能"
echo ""

# 从 config.json 读取配置要求
echo -e "${BLUE}🔐 检查各技能配置参数...${NC}"
echo ""

SKILLS_WITH_CONFIG=()
SKILLS_CONFIG_OK=()
declare -a SKILLS_CONFIG_MISSING
declare -a MISSING_COUNTS
declare -a MISSING_DETAILS

for skill in "${INSTALLED_SKILLS[@]}"; do
    # 使用 Python 检查该技能是否有配置要求
    has_config=$(python3 -c "
import json
import sys
try:
    with open('$CONFIG_FILE', 'r', encoding='utf-8') as f:
        config = json.load(f)
        skill_configs = config.get('skillConfigs', {})
        if '$skill' in skill_configs:
            configs = skill_configs['$skill'].get('configs', [])
            print(len(configs))
        else:
            print(0)
except Exception as e:
    print(0)
")
    
    if [ "$has_config" -eq 0 ]; then
        continue
    fi
    
    SKILLS_WITH_CONFIG+=("$skill")
    
    # 使用 Python 直接检查所有配置项
    missing_result=$(python3 << EOF
import json
import os

config_file = "$CONFIG_FILE"
skill = "$skill"
home = os.path.expanduser("~")

with open(config_file, 'r', encoding='utf-8') as f:
    config = json.load(f)

skill_config = config.get('skillConfigs', {}).get(skill, {})
configs = skill_config.get('configs', [])

missing = []
for cfg in configs:
    if not cfg.get('required', False):
        continue
    
    key = cfg.get('key', '')
    check_type = cfg.get('checkType', 'env')
    
    exists = False
    
    if check_type == 'env':
        # 检查环境变量
        if os.environ.get(key):
            exists = True
    elif check_type == 'file':
        # 检查文件
        file_path = cfg.get('filePath', '').replace('~', home)
        pattern = cfg.get('pattern', '')

        if os.path.exists(file_path):
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                    if pattern:
                        # 检查 pattern 是否存在且值不为空
                        import re
                        # 匹配 "pattern": "value" 格式 (JSON)
                        match = re.search(r'"' + re.escape(pattern) + r'"\s*:\s*"([^"]*)"', content)
                        if match:
                            value = match.group(1)
                            if value and value.strip():  # 值不为空
                                exists = True
                        elif pattern in content:
                            # 尝试匹配 KEY=value 格式 (.env 文件)
                            key_name = pattern.replace('=', '')
                            match = re.search(re.escape(key_name) + r'\s*=\s*(.+)', content)
                            if match:
                                value = match.group(1).strip()
                                if value and value.strip() and not value.strip().startswith('YOUR_'):
                                    exists = True
            except:
                pass
    
    if not exists:
        missing.append({
            'key': key,
            'name': cfg.get('name', key),
            'description': cfg.get('description', ''),
            'setupCommand': cfg.get('setupCommand', '')
        })

# 输出结果
print(f"MISSING_COUNT:{len(missing)}")
for m in missing:
    print(f"MISSING:{m['name']}|{m['description']}|{m['setupCommand']}")
EOF
)
    
    # 解析结果
    missing_count=$(echo "$missing_result" | grep "MISSING_COUNT:" | cut -d: -f2)
    missing_details=$(echo "$missing_result" | grep "^MISSING:" | sed 's/^MISSING://')
    
    if [ -z "$missing_count" ]; then
        missing_count=0
    fi
    
    if [ "$missing_count" -eq 0 ]; then
        echo -e "  ${GREEN}✓${NC} $skill (配置完整)"
        SKILLS_CONFIG_OK+=("$skill")
    else
        echo -e "  ${YELLOW}⚠${NC} $skill ${YELLOW}(缺少 ${missing_count} 项配置)${NC}"
        SKILLS_CONFIG_MISSING+=("$skill")
        MISSING_COUNTS+=("$missing_count")
        MISSING_DETAILS+=("$missing_details")
    fi
done

echo ""

# 如果有缺失配置，显示详细信息
if [ ${#SKILLS_CONFIG_MISSING[@]} -gt 0 ]; then
    echo -e "${YELLOW}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${YELLOW}║           ⚠️  以下技能需要配置参数才能正常使用              ║${NC}"
    echo -e "${YELLOW}╚════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    for i in "${!SKILLS_CONFIG_MISSING[@]}"; do
        skill="${SKILLS_CONFIG_MISSING[$i]}"
        
        # 获取技能显示名称
        skill_name=$(python3 -c "
import json
with open('$CONFIG_FILE', 'r', encoding='utf-8') as f:
    config = json.load(f)
    skill_config = config.get('skillConfigs', {}).get('$skill', {})
    print(skill_config.get('name', '$skill'))
")
        
        echo -e "${CYAN}▶ $skill_name${NC}"
        echo ""
        
        # 显示每个缺失的配置
        details="${MISSING_DETAILS[$i]}"
        while IFS='|' read -r name desc setup; do
            [ -z "$name" ] && continue
            echo -e "    ${YELLOW}• $name${NC}"
            echo -e "      说明: $desc"
            if [ -n "$setup" ]; then
                echo -e "      设置: ${CYAN}$setup${NC}"
            fi
            echo ""
        done <<< "$details"
    done
    
    echo -e "${YELLOW}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${YELLOW}提示：配置完成后，相关技能即可正常使用。${NC}"
    echo ""
fi

# 输出总结
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}                      配置检查结果汇总                         ${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
echo ""

TOTAL_INSTALLED=${#INSTALLED_SKILLS[@]}
TOTAL_WITH_CONFIG=${#SKILLS_WITH_CONFIG[@]}
TOTAL_CONFIG_OK=${#SKILLS_CONFIG_OK[@]}
TOTAL_CONFIG_MISSING=${#SKILLS_CONFIG_MISSING[@]}

echo -e "  ${BLUE}统计摘要：${NC}"
echo -e "    已安装技能总数: ${TOTAL_INSTALLED}"
echo -e "    需要配置的技能: ${TOTAL_WITH_CONFIG}"
echo -e "    配置完整: ${GREEN}${TOTAL_CONFIG_OK}${NC}"

if [ $TOTAL_CONFIG_MISSING -gt 0 ]; then
    echo -e "    缺少配置: ${YELLOW}${TOTAL_CONFIG_MISSING}${NC}"
fi

# 显示配置完整的技能列表
if [ $TOTAL_CONFIG_OK -gt 0 ]; then
    echo ""
    echo -e "  ${GREEN}配置完整的技能：${NC}"
    for skill in "${SKILLS_CONFIG_OK[@]}"; do
        skill_name=$(python3 -c "
import json
with open('$CONFIG_FILE', 'r', encoding='utf-8') as f:
    config = json.load(f)
    skill_config = config.get('skillConfigs', {}).get('$skill', {})
    print(skill_config.get('name', '$skill'))
")
        echo -e "    ${GREEN}✓${NC} $skill_name"
    done
fi

echo ""

if [ $TOTAL_CONFIG_MISSING -gt 0 ]; then
    echo -e "${YELLOW}⚠️  注意：部分技能缺少配置参数，请根据上方提示进行设置。${NC}"
    exit 2
else
    echo -e "${GREEN}✅ 所有技能配置检查完成，所有参数均已配置！${NC}"
    exit 0
fi
