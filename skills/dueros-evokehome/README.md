# DuerOS EvokeHome

通过小度官方 API 控制你的智能家居设备。

## 功能特性

- ✅ 开关控制（灯、插座等）
- ✅ 亮度调节（0-100%）
- ✅ 色温调节（暖光/冷光）
- ✅ 模式切换（夜间/日间/阅读/放松）
- ✅ 设备状态查询
- ✅ 多设备支持
- ✅ Token 过期提醒
- ✅ 自动续期支持

## 安装

```bash
# 通过 npm 安装
npm install -g @openclaw/dueros-evokehome

# 或通过 OpenClaw 插件安装
openclaw plugin install dueros-evokehome
```

## 快速开始

### 1. 获取 DuerOS Token

访问百度授权页面获取 Access Token 和 Refresh Token：

```
https://openapi.baidu.com/oauth/2.0/authorize
```

或使用百度开发者工具获取。

### 2. 配置 Token

```bash
evokehome setup
# 输入你的 Access Token 和 Refresh Token
```

### 3. 开始使用

直接对助手说：
- "打开台灯"
- "把台灯调到 50%"
- "查询设备状态"

## 使用指南

### 语音指令

| 指令 | 说明 |
|------|------|
| 打开 [设备名] | 开启设备 |
| 关闭 [设备名] | 关闭设备 |
| 把 [设备名] 调到 [数字]% | 调节亮度 |
| [设备名] 状态 | 查看设备状态 |
| 列出所有设备 | 查看已绑定设备 |

### CLI 命令

```bash
# 设置 Token
evokehome setup

# 查看 Token 状态
evokehome status

# 刷新 Token
evokehome refresh

# 查看设备列表
evokehome devices

# 启用过期提醒
evokehome config --expiry-check true

# 启用自动续期
evokehome config --auto-refresh true
```

### 快速控制脚本

```bash
# 控制台灯
node control.js on          # 开灯
node control.js off         # 关灯
node control.js b 50        # 调亮度
node control.js night       # 夜间模式
node control.js warm        # 暖光
node control.js cool        # 冷光
node control.js status      # 查看状态
```

### 设备映射

编辑 `~/.config/dueros-evokehome/devices.json`：

```json
{
  "台灯": {
    "id": "cce0daa95ce5",
    "type": "LIGHT",
    "room": "卧室",
    "description": "小度智能台灯"
  },
  "客厅灯": {
    "id": "your_device_id",
    "type": "LIGHT",
    "room": "客厅"
  }
}
```

## Token 管理

### 过期提醒

```bash
# 开启提醒（Token 将在过期前 3 天提醒你）
evokehome config --expiry-check true
```

### 自动续期

```bash
# 开启自动续期（需要配置 Refresh Token）
evokehome config --auto-refresh true
```

### 手动刷新

```bash
evokehome refresh
```

## 技术说明

### API 端点

- 设备列表: `GET /devicelist`
- 设备控制: `POST /directivesend`
- Token 刷新: `POST /oauth/2.0/token`

### 支持的设备类型

| 类型 | 说明 |
|------|------|
| LIGHT | 灯具 |
| DESK_LAMP | 台灯 |
| TV_SET | 电视 |
| AIR_CONDITIONER | 空调 |
| SOCKET | 智能插座 |
| CURTAIN | 窗帘 |

### 数据存储

配置文件位置: `~/.config/dueros-evokehome/`

```
~/.config/dueros-evokehome/
├── config.json     # Token 和设置
├── devices.json    # 设备映射
└── logs/           # 运行日志
```

## 故障排除

### 设备离线

- 检查设备电源
- 检查设备 WiFi 连接
- 在小度 APP 中查看设备状态

### Token 过期

```bash
evokehome refresh
```

### 找不到设备

1. 确认设备已绑定到该账号
2. 检查 `devices.json` 中的映射
3. 运行 `evokehome devices` 刷新设备列表

### 权限问题

确保配置文件目录有正确的权限：

```bash
chmod 700 ~/.config/dueros-evokehome
chmod 600 ~/.config/dueros-evokehome/config.json
```

## 开发

```bash
# 安装依赖
npm install

# 运行测试
npm test

# 代码检查
npm run lint
```

## 项目结构

```
dueros-evokehome/
├── bin/
│   └── evokehome.js      # CLI 入口
├── src/
│   ├── index.js          # Skill 主入口
│   ├── client.js         # DuerOS API 客户端
│   ├── device-manager.js # 设备管理
│   ├── config.js         # 配置管理
│   └── *.test.js         # 测试文件
├── templates/
│   ├── config.json       # 配置模板
│   └── devices.json      # 设备映射模板
├── control.js            # 快速控制脚本
├── test.js               # 简单测试
├── SKILL.md              # Skill 文档
├── README.md             # 项目说明
├── package.json          # 包配置
└── openclaw.plugin.json  # OpenClaw 插件配置
```

## 安全说明

- Token 存储在本地 `~/.config/` 目录
- 不要将 Token 提交到代码仓库
- 定期更换 Token 以提高安全性
- 建议启用 Token 过期提醒

## 更新日志

### v1.0.0
- 初始版本
- 支持设备开关控制
- 支持亮度调节
- 支持 Token 管理

## 许可证

MIT License

## 作者

Your Name

## 相关链接

- [OpenClaw 官网](https://openclaw.ai)
- [DuerOS 开发者文档](https://dueros.baidu.com)
