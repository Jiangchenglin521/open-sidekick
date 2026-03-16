# 仓库规范指南

- 仓库地址: https://github.com/openclaw/openclaw
- GitHub issues/comments/PR 评论: 使用字面量多行字符串或 `-F - <<'EOF'` (或 $'...') 来处理真正的换行; 永远不要嵌入 "\\n"。

## 项目结构与模块组织

- 源代码: `src/` (CLI 连接在 `src/cli`，命令在 `src/commands`，web provider 在 `src/provider-web.ts`，基础设施在 `src/infra`，媒体管道在 `src/media`)。
- 测试: 并置的 `*.test.ts`。
- 文档: `docs/` (图片、队列、Pi 配置)。构建输出放在 `dist/`。
- 插件/扩展: 位于 `extensions/*` (工作区包)。将插件专属依赖保留在扩展的 `package.json` 中; 除非核心使用，否则不要将它们添加到根 `package.json`。
- 插件: 安装时在插件目录运行 `npm install --omit=dev`; 运行时依赖必须放在 `dependencies` 中。避免在 `dependencies` 中使用 `workspace:*` (npm install 会中断); 将 `openclaw` 放在 `devDependencies` 或 `peerDependencies` 中 (运行时通过 jiti 别名解析 `openclaw/plugin-sdk`)。
- 从 `https://openclaw.ai/*` 提供的安装程序: 位于兄弟仓库 `../openclaw.ai` (`public/install.sh`、`public/install-cli.sh`、`public/install.ps1`)。
- 消息渠道: 重构共享逻辑时始终考虑**所有**内置 + 扩展渠道 (路由、白名单、配对、命令门控、引导、文档)。
  - 核心渠道文档: `docs/channels/`
  - 核心渠道代码: `src/telegram`、`src/discord`、`src/slack`、`src/signal`、`src/imessage`、`src/web` (WhatsApp web)、`src/channels`、`src/routing`
  - 扩展 (渠道插件): `extensions/*` (例如 `extensions/msteams`、`extensions/matrix`、`extensions/zalo`、`extensions/zalouser`、`extensions/voice-call`)
- 添加渠道/扩展/应用/文档时，更新 `.github/labeler.yml` 并创建匹配的 GitHub 标签 (使用现有的渠道/扩展标签颜色)。

## 文档链接 (Mintlify)

- 文档托管在 Mintlify (docs.openclaw.ai)。
- `docs/**/*.md` 中的内部文档链接: 根相对路径，不带 `.md`/`.mdx` (例如: `[Config](/configuration)`)。
- 处理文档时，阅读 mintlify 技能文件。
- 章节交叉引用: 在根相对路径上使用锚点 (例如: `[Hooks](/configuration#hooks)`)。
- 文档标题和锚点: 避免在标题中使用破折号和撇号，因为它们会破坏 Mintlify 锚点链接。
- 当 Peter 询问链接时，回复完整的 `https://docs.openclaw.ai/...` URL (而非根相对路径)。
- 当你修改文档时，在回复末尾附上你引用的 `https://docs.openclaw.ai/...` URL。
- README (GitHub): 保留绝对文档 URL (`https://docs.openclaw.ai/...`)，以便链接在 GitHub 上正常工作。
- 文档内容必须通用: 不要有 personal 设备名称/主机名/路径; 使用占位符如 `user@gateway-host` 和 "gateway host"。

## 文档国际化 (zh-CN)

- `docs/zh-CN/**` 是生成的; 除非用户明确要求，否则不要编辑。
- 流程: 更新英文文档 → 调整词汇表 (`docs/.i18n/glossary.zh-CN.json`) → 运行 `scripts/docs-i18n` → 仅在被指示时应用有针对性的修复。
- 翻译记忆: `docs/.i18n/zh-CN.tm.jsonl` (生成的)。
- 参见 `docs/.i18n/README.md`。
- 管道可能很慢/效率低下; 如果拖慢了，在 Discord 上 ping @jospalmbier 而不是临时凑合。

## exe.dev 虚拟机操作 (通用)

- 访问: 稳定路径是 `ssh exe.dev` 然后 `ssh vm-name` (假设 SSH 密钥已设置)。
- SSH 不稳定: 使用 exe.dev web 终端或 Shelley (web agent); 长时间操作保持 tmux 会话。
- 更新: `sudo npm i -g openclaw@latest` (全局安装需要 `/usr/lib/node_modules` 的 root 权限)。
- 配置: 使用 `openclaw config set ...`; 确保设置了 `gateway.mode=local`。
- Discord: 仅存储原始令牌 (不要 `DISCORD_BOT_TOKEN=` 前缀)。
- 重启: 停止旧 gateway 并运行:
  `pkill -9 -f openclaw-gateway || true; nohup openclaw gateway run --bind loopback --port 18789 --force > /tmp/openclaw-gateway.log 2>&1 &`
- 验证: `openclaw channels status --probe`、`ss -ltnp | rg 18789`、`tail -n 120 /tmp/openclaw-gateway.log`。

## 构建、测试和开发命令

- 运行时基线: Node **22+** (保持 Node + Bun 路径正常工作)。
- 安装依赖: `pnpm install`
- 如果缺少依赖 (例如缺少 `node_modules`、找不到 `vitest` 或 "command not found")，运行仓库的包管理器安装命令 (优先使用 lockfile/README 定义的 PM)，然后重新运行请求的确切命令一次。将此应用于测试/构建/检查/类型检查/开发命令; 如果重试仍然失败，报告命令和第一个可操作的错误。
- 提交前钩子: `prek install` (运行与 CI 相同的检查)
- 也支持: `bun install` (在修改依赖/补丁时保持 `pnpm-lock.yaml` + Bun 补丁同步)。
- 优先使用 Bun 执行 TypeScript (脚本、开发、测试): `bun <file.ts>` / `bunx <tool>`。
- 开发中运行 CLI: `pnpm openclaw ...` (bun) 或 `pnpm dev`。
- Node 仍支持运行构建输出 (`dist/*`) 和生产环境安装。
- Mac 打包 (开发): `scripts/package-mac-app.sh` 默认为当前架构。发布清单: `docs/platforms/mac/release.md`。
- 类型检查/构建: `pnpm build`
- TypeScript 检查: `pnpm tsgo`
- 检查/格式化: `pnpm check`
- 格式检查: `pnpm format` (oxfmt --check)
- 格式修复: `pnpm format:fix` (oxfmt --write)
- 测试: `pnpm test` (vitest); 覆盖率: `pnpm test:coverage`

## 代码风格与命名规范

- 语言: TypeScript (ESM)。优先使用严格类型; 避免 `any`。
- 通过 Oxlint 和 Oxfmt 进行格式化/检查; 提交前运行 `pnpm check`。
- 永远不要添加 `@ts-nocheck` 也不要禁用 `no-explicit-any`; 修复根本原因，仅在需要时更新 Oxlint/Oxfmt 配置。
- 永远不要通过原型变异共享类行为 (`applyPrototypeMixins`、在 `.prototype` 上使用 `Object.defineProperty`、或导出 `Class.prototype` 进行合并)。使用显式继承/组合 (`A extends B extends C`) 或辅助组合，以便 TypeScript 可以进行类型检查。
- 如果需要这种模式，停下来并在发布前获得明确批准; 默认行为是拆分/重构为显式类层次结构并保持成员强类型。
- 在测试中，优先使用每个实例的存根而不是原型变异 (`SomeClass.prototype.method = ...`)，除非测试明确记录了为什么需要原型级修补。
- 为棘手或非显而易见的逻辑添加简要的代码注释。
- 保持文件简洁; 提取辅助函数而不是创建 "V2" 副本。使用现有的 CLI 选项模式和通过 `createDefaultDeps` 的依赖注入。
- 目标是将文件保持在 ~700 行代码以下; 仅为指导原则 (不是硬性规定)。在提高清晰度或可测试性时拆分/重构。
- 命名: 产品/应用/文档标题使用 **OpenClaw**; CLI 命令、包/二进制文件、路径和配置键使用 `openclaw`。

## 发布渠道 (命名)

- stable: 仅标签发布 (例如 `vYYYY.M.D`)，npm dist-tag `latest`。
- beta: 预发布标签 `vYYYY.M.D-beta.N`，npm dist-tag `beta` (可能不附带 macOS 应用)。
- dev: `main` 上的移动头 (无标签; git checkout main)。

## 测试指南

- 框架: 使用 V8 覆盖率阈值的 Vitest (70% 行/分支/函数/语句)。
- 命名: 使用 `*.test.ts` 匹配源名称; e2e 在 `*.e2e.test.ts` 中。
- 在推送涉及逻辑的修改时运行 `pnpm test` (或 `pnpm test:coverage`)。
- 不要设置超过 16 个测试工作线程; 已经尝试过。
- 实机测试 (真实密钥): OpenClaw 专用 `CLAWDBOT_LIVE_TEST=1 pnpm test:live` 或包含 provider 实机测试的 `LIVE=1 pnpm test:live`。Docker: `pnpm test:docker:live-models`、`pnpm test:docker:live-gateway`。Docker 引导 E2E: `pnpm test:docker:onboard`。
- 完整套件 + 覆盖内容: `docs/testing.md`。
- 变更日志: 仅面向用户的更改; 无内部/元注释 (版本对齐、appcast 提醒、发布流程)。
- 纯测试添加/修复通常**不需要**变更日志条目，除非它们改变了面向用户的行为或用户要求。
- 移动端: 使用模拟器之前，检查已连接的真实设备 (iOS + Android) 并在可用时优先使用它们。

## 提交与拉取请求指南

**完整维护者 PR 工作流 (可选):** 如果你想要仓库的端到端维护者工作流 (分类顺序、质量标准、变基规则、提交/变更日志约定、共同贡献者政策，以及 `review-pr` > `prepare-pr` > `merge-pr` 管道)，参见 `.agents/skills/PR_WORKFLOW.md`。维护者可以使用其他工作流; 当维护者指定工作流时，遵循该工作流。如果没有指定工作流，默认为 PR_WORKFLOW。

- 使用 `scripts/committer "<msg>" <file...>` 创建提交; 避免手动 `git add`/`git commit`，以便暂存保持范围限定。
- 遵循简洁、面向动作的提交信息 (例如 `CLI: add verbose flag to send`)。
- 分组相关更改; 避免捆绑不相关的重构。
- PR 提交模板 (规范): `.github/pull_request_template.md`
- Issue 提交模板 (规范): `.github/ISSUE_TEMPLATE/`

## 简写命令

- `sync`: 如果工作区不干净，提交所有更改 (选择一个合理的 Conventional Commit 信息)，然后 `git pull --rebase`; 如果变基冲突无法解决，停止; 否则 `git push`。

## Git 注意事项

- 如果 `git branch -d/-D <branch>` 被策略阻止，直接删除本地引用: `git update-ref -d refs/heads/<branch>`。
- 批量 PR 关闭/重开安全: 如果关闭操作会影响超过 5 个 PR，首先要求明确用户确认，包括确切的 PR 数量和目标范围/查询。

## 安全与配置提示

- Web provider 将凭证存储在 `~/.openclaw/credentials/`; 如果登出，重新运行 `openclaw login`。
- Pi 会话默认位于 `~/.openclaw/sessions/` 下; 基础目录不可配置。
- 环境变量: 参见 `~/.profile`。
- 永远不要提交或发布真实电话号码、视频或实时配置值。在文档、测试和示例中使用明显虚假的占位符。
- 发布流程: 任何发布工作前始终阅读 `docs/reference/RELEASING.md` 和 `docs/platforms/mac/release.md`; 一旦这些文档回答了，就不要问常规问题。

## GHSA (仓库公告) 补丁/发布

- 获取: `gh api /repos/openclaw/openclaw/security-advisories/<GHSA>`
- 最新 npm: `npm view openclaw version --userconfig "$(mktemp)"`
- 私有 fork PR 必须关闭:
  `fork=$(gh api /repos/openclaw/openclaw/security-advisories/<GHSA> | jq -r .private_fork.full_name)`
  `gh pr list -R "$fork" --state open` (必须为空)
- 描述换行陷阱: 通过 heredoc 将 Markdown 写入 `/tmp/ghsa.desc.md` (无 `"\\n"` 字符串)
- 通过 jq 构建补丁 JSON: `jq -n --rawfile desc /tmp/ghsa.desc.md '{summary,severity,description:$desc,vulnerabilities:[...]}' > /tmp/ghsa.patch.json`
- 补丁 + 发布: `gh api -X PATCH /repos/openclaw/openclaw/security-advisories/<GHSA> --input /tmp/ghsa.patch.json` (发布 = 包含 `"state":"published"`; 无 `/publish` 端点)
- 如果发布失败 (HTTP 422): 缺少 `severity`/`description`/`vulnerabilities[]`，或私有 fork 有打开的 PR
- 验证: 重新获取; 确保 `state=published`、`published_at` 已设置; `jq -r .description | rg '\\\\n'` 返回空

## 故障排查

- 更名/迁移问题或旧配置/服务警告: 运行 `openclaw doctor` (参见 `docs/gateway/doctor.md`)。

## Agent 专用说明

- 词汇: "makeup" = "mac app"。
- 永远不要编辑 `node_modules` (全局/Homebrew/npm/git 安装也是如此)。更新会覆盖。技能说明放在 `tools.md` 或 `AGENTS.md`。
- 在任何仓库中添加新的 `AGENTS.md` 时，还要添加指向它的 `CLAUDE.md` 符号链接 (示例: `ln -s AGENTS.md CLAUDE.md`)。
- Signal: "update fly" => `fly ssh console -a flawd-bot -C "bash -lc 'cd /data/clawd/openclaw && git pull --rebase origin main'"` 然后 `fly machines restart e825232f34d058 -a flawd-bot`。
- 处理 GitHub Issue 或 PR 时，在任务末尾打印完整 URL。
- 回答问题时，仅回复高可信度的答案: 在代码中验证; 不要猜测。
- 永远不要更新 Carbon 依赖。
- 任何带有 `pnpm.patchedDependencies` 的依赖必须使用精确版本 (无 `^`/`~`)。
- 修补依赖 (pnpm 补丁、覆盖或供应商更改) 需要明确批准; 默认不要这样做。
- CLI 进度: 使用 `src/cli/progress.ts` (`osc-progress` + `@clack/prompts` 转轮); 不要手动创建转轮/进度条。
- 状态输出: 保留表格 + ANSI 安全换行 (`src/terminal/table.ts`); `status --all` = 只读/可复制，`status --deep` = 探测。
- Gateway 目前仅作为菜单栏应用运行; 没有安装单独的 LaunchAgent/辅助标签。通过 OpenClaw Mac 应用或 `scripts/restart-mac.sh` 重启; 使用 `launchctl print gui/$UID | grep openclaw` 验证/终止，而不是假设固定标签。**在 macOS 上调试时，通过应用启动/停止 gateway，而不是临时 tmux 会话; 交接前终止任何临时隧道。**
- macOS 日志: 使用 `./scripts/clawlog.sh` 查询 OpenClaw 子系统的统一日志; 它支持 follow/tail/类别过滤器，并期望密码免输入 sudo 用于 `/usr/bin/log`。
- 如果本地有可用的共享 guardrails，请审阅它们; 否则遵循本仓库的指南。
- SwiftUI 状态管理 (iOS/macOS): 优先使用 `Observation` 框架 (`@Observable`、`@Bindable`) 而非 `ObservableObject`/`@StateObject`; 除非需要兼容性，否则不要引入新的 `ObservableObject`，并在接触相关代码时迁移现有用法。
- 连接 provider: 添加新连接时，更新每个 UI 界面和文档 (macOS 应用、web UI、移动端如适用、引导/概述文档) 并添加匹配的状态 + 配置表单，以便 provider 列表和设置保持同步。
- 版本位置: `package.json` (CLI)、`apps/android/app/build.gradle.kts` (versionName/versionCode)、`apps/ios/Sources/Info.plist` + `apps/ios/Tests/Info.plist` (CFBundleShortVersionString/CFBundleVersion)、`apps/macos/Sources/OpenClaw/Resources/Info.plist` (CFBundleShortVersionString/CFBundleVersion)、`docs/install/updating.md` (固定 npm 版本)、`docs/platforms/mac/release.md` (APP_VERSION/APP_BUILD 示例)、Peekaboo Xcode 项目/Info.plists (MARKETING_VERSION/CURRENT_PROJECT_VERSION)。
- "随处升级版本" 意味着上述**所有**版本位置**除了** `appcast.xml` (仅在发布新 macOS Sparkle 发布时触碰 appcast)。
- **重启应用:** "重启 iOS/Android 应用" 意味着重建 (重新编译/安装) 并重新启动，不仅仅是终止/启动。
- **设备检查:** 测试前，在使用模拟器/仿真器之前验证已连接的真实设备 (iOS/Android)。
- iOS Team ID 查找: `security find-identity -p codesigning -v` → 使用 Apple Development (…) TEAMID。备用: `defaults read com.apple.dt.Xcode IDEProvisioningTeamIdentifiers`。
- A2UI 包哈希: `src/canvas-host/a2ui/.bundle.hash` 是自动生成的; 忽略意外更改，仅在需要时通过 `pnpm canvas:a2ui:bundle` (或 `scripts/bundle-a2ui.sh`) 重新生成。将哈希作为单独提交提交。
- 发布签名/公证密钥在仓库外部管理; 遵循内部发布文档。
- Notary 认证环境变量 (`APP_STORE_CONNECT_ISSUER_ID`、`APP_STORE_CONNECT_KEY_ID`、`APP_STORE_CONNECT_API_KEY_P8`) 应在你的环境中 (根据内部发布文档)。
- **多 Agent 安全:** **不要**创建/应用/删除 `git stash` 条目，除非明确要求 (这包括 `git pull --rebase --autostash`)。假设其他 agent 可能在工作; 保持无关的 WIP 不动，避免跨领域状态更改。
- **多 Agent 安全:** 当用户说 "push" 时，你可以 `git pull --rebase` 来集成最新更改 (永远不要丢弃其他 agent 的工作)。当用户说 "commit" 时，范围限定为你的更改。当用户说 "commit all" 时，分组提交所有内容。
- **多 Agent 安全:** **不要**创建/删除/修改 `git worktree` 检出 (或编辑 `.worktrees/*`)，除非明确要求。
- **多 Agent 安全:** **不要**切换分支 / 检出不同分支，除非明确要求。
- **多 Agent 安全:** 运行多个 agent 是可以的，只要每个 agent 有自己的会话。
- **多 Agent 安全:** 当你看到不认识的文件时，继续; 专注于你的更改，仅提交那些。
- 检查/格式化变动:
  - 如果暂存+未暂存差异仅涉及格式化，自动解决，无需询问。
  - 如果已请求提交/推送，自动暂存并在同一提交中包含仅格式化的后续操作 (或如有需要，一个微小的后续提交)，无需额外确认。
  - 仅在更改是语义性的 (逻辑/数据/行为) 时才询问。
- Lobster 接缝: 使用 `src/terminal/palette.ts` 中的共享 CLI 调色板 (无硬编码颜色); 将调色板应用于引导/配置提示和其他 TTY UI 输出。
- **多 Agent 安全:** 焦点报告在你的编辑上; 除非真正受阻，否则避免 guard-rail 免责声明; 当多个 agent 接触同一文件时，如果安全就继续; 仅在相关时以简短的 "其他文件存在" 注释结束。
- Bug 调查: 在得出结论前阅读相关 npm 依赖的源代码和所有相关本地代码; 目标是高可信度的根本原因。
- 代码风格: 为棘手逻辑添加简要注释; 尽可能将文件保持在 ~500 行代码以下 (按需拆分/重构)。
- 工具 schema guardrails (google-antigravity): 避免在工具输入 schema 中使用 `Type.Union`; 无 `anyOf`/`oneOf`/`allOf`。对字符串列表使用 `stringEnum`/`optionalStringEnum` (Type.Unsafe enum)，对可选使用 `Type.Optional(...)` 而不是 `... | null`。保持顶级工具 schema 为 `type: "object"` 和 `properties`。
- 工具 schema guardrails: 避免在工具 schema 中使用原始 `format` 属性名; 一些验证器将 `format` 视为保留关键字并拒绝该 schema。
- 当被要求打开 "session" 文件时，打开 Pi 会话日志 `~/.openclaw/agents/<agentId>/sessions/*.jsonl` (使用系统提示 Runtime 行中的 `agent=<id>` 值; 除非给定特定 ID，否则是最新的)，而不是默认的 `sessions.json`。如果需要来自另一台机器的日志，通过 Tailscale SSH 并读取相同路径。
- 不要通过 SSH 重建 macOS 应用; 重建必须直接在 Mac 上运行。
- 永远不要向外部消息界面 (WhatsApp、Telegram) 发送流式/部分回复; 只应发送最终回复。流式/工具事件仍可能进入内部 UI/控制通道。
- 语音唤醒转发提示:
  - 命令模板应保持 `openclaw-mac agent --message "${text}" --thinking low`; `VoiceWakeForwarder` 已经对 `${text}` 进行 shell 转义。不要添加额外引号。
  - launchd PATH 最小; 确保应用的启动代理 PATH 包含标准系统路径加上你的 pnpm bin (通常是 `$HOME/Library/pnpm`)，以便在通过 `openclaw-mac` 调用时 `pnpm`/`openclaw` 二进制文件能解析。
- 对于包含 `!` 的手动 `openclaw message send` 消息，使用下面提到的 heredoc 模式以避免 Bash 工具的转义。
- 发布 guardrails: 未经操作员明确同意不要更改版本号; 在运行任何 npm 发布/发布步骤前始终询问许可。

## NPM + 1Password (发布/验证)

- 使用 1password 技能; 所有 `op` 命令必须在新的 tmux 会话中运行。
- 登录: `eval "$(op signin --account my.1password.com)"` (应用已解锁 + 集成开启)。
- OTP: `op read 'op://Private/Npmjs/one-time password?attribute=otp'`。
- 发布: `npm publish --access public --otp="<otp>"` (从包目录运行)。
- 无本地 npmrc 副作用验证: `npm view <pkg> version --userconfig "$(mktemp)"`。
- 发布后终止 tmux 会话。

## 插件发布快速路径 (无核心 `openclaw` 发布)

- 仅发布已在 npm 上的插件。源列表在 `docs/reference/RELEASING.md` 的 "Current npm plugin list" 下。
- 在 tmux 中运行所有 CLI `op` 调用和 `npm publish` 以避免挂起/中断:
  - `tmux new -d -s release-plugins-$(date +%Y%m%d-%H%M%S)`
  - `eval "$(op signin --account my.1password.com)"`
- 1Password 辅助:
  - `npm login` 使用的密码:
    `op item get Npmjs --format=json | jq -r '.fields[] | select(.id=="password").value'`
  - OTP:
    `op read 'op://Private/Npmjs/one-time password?attribute=otp'`
- 快速发布循环 (本地辅助脚本在 `/tmp` 中可以; 保持仓库干净):
  - 比较本地插件 `version` 和 `npm view <name> version`
  - 仅在版本不同时运行 `npm publish --access public --otp="<otp>"`
  - 如果包在 npm 上缺失或版本已匹配则跳过。
- 保持 `openclaw` 不动: 除非明确要求，否则不要从仓库根目录运行发布。
- 每个发布的发布检查:
  - 每个插件: `npm view @openclaw/<name> version --userconfig "$(mktemp)"` 应该是 `2026.2.17`
  - 核心守卫: `npm view openclaw version --userconfig "$(mktemp)"` 应保持在以前的版本，除非明确要求。

## 变更日志发布说明

- 当使用 beta GitHub 预发布进行 mac 发布时:
  - 从发布提交创建标签 `vYYYY.M.D-beta.N` (示例: `v2026.2.15-beta.1`)。
  - 创建标题为 `openclaw YYYY.M.D-beta.N` 的预发布。
  - 使用来自 `CHANGELOG.md` 版本部分的发布说明 (`Changes` + `Fixes`，无标题重复)。
  - 至少附加 `OpenClaw-YYYY.M.D.zip` 和 `OpenClaw-YYYY.M.D.dSYM.zip`; 如有可用，包含 `.dmg`。

- 保持 `CHANGELOG.md` 中的顶级版本条目按影响排序:
  - 先 `### Changes`。
  - 去重并排序 `### Fixes`，面向用户的修复优先。
- 在标记/发布前运行:
  - `node --import tsx scripts/release-check.ts`
  - `pnpm release:check`
  - `pnpm test:install:smoke` 或 `OPENCLAW_INSTALL_SMOKE_SKIP_NONROOT=1 pnpm test:install:smoke` 用于非 root 冒烟路径。
