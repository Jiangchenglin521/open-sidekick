# 技能创建检查清单

创建新技能前，逐项确认以下事项：

## 基本信息

- [ ] 技能名称符合规范 (仅小写字母、数字、连字符)
- [ ] 技能名称长度不超过 64 个字符
- [ ] 技能文件夹名称与技能名称完全一致
- [ ] 优先使用动词开头的短语
- [ ] 按工具命名空间化 (如 `gh-xxx`, `linear-xxx`)

## Frontmatter (YAML 头部)

- [ ] 包含 `name` 字段
- [ ] 包含 `description` 字段
- [ ] description 描述技能功能
- [ ] description 包含具体触发场景/上下文
- [ ] **禁止包含其他字段** (如 version, author 等)

## 正文内容

- [ ] 使用祈使/不定式形式 (如 "Extract text" 而非 "You should extract text")
- [ ] 正文控制在 500 行以内
- [ ] 简洁为主，挑战每条信息的必要性
- [ ] 优先使用简洁示例而非冗长解释
- [ ] 链接到 references/ 文件时说明何时阅读

## 资源文件

- [ ] scripts/ - 脚本经过实际运行测试
- [ ] references/ - 文件直接从 SKILL.md 链接
- [ ] assets/ - 仅包含输出资源
- [ ] references 文件不超过一级嵌套
- [ ] 长文件 (>100行) 包含目录

## 禁止事项

- [ ] 未创建 README.md
- [ ] 未创建 INSTALLATION_GUIDE.md
- [ ] 未创建 CHANGELOG.md
- [ ] 未包含符号链接
- [ ] 信息未重复存在于 SKILL.md 和 references 中

## 设计原则

- [ ] 遵循渐进式披露 (Metadata → SKILL.md → Resources)
- [ ] 设置适当的自由度级别
- [ ] 保持上下文窗口高效利用
- [ ] 区分 "核心说明" (SKILL.md) 和 "详细参考" (references/)

## 最终检查

- [ ] 技能可以在新目录中正确创建
- [ ] 所有脚本可以正常运行
- [ ] 所有链接指向正确的文件
- [ ] 没有遗漏的必要信息
