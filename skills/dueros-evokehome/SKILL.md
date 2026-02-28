---
name: dueros-evokehome
description: DuerOS 智能家居控制 - 语音控制小度生态设备
metadata:
  openclaw:
    emoji: 🏠
    requires:
      env: []
    config:
      - name: accessToken
        type: string
        required: true
        description: DuerOS Access Token
      - name: tokenExpiryCheck
        type: boolean
        default: false
        description: 启用 Token 过期提醒
---

# DuerOS EvokeHome

通过小度官方 API 控制你的智能家居设备。

## 功能特性

- ✅ 开关控制（灯、插座等）
- ✅ 亮度调节（0-100%）
- ✅ 设备状态查询
- ✅ 多设备支持
- ✅ Token 过期提醒（可选）
- ✅ 自动续期（可选）

## 快速开始

### 1. 获取 DuerOS Token

访问百度授权页面获取 Access Token 和 Refresh Token。

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

### 设备控制

| 指令 | 说明 |
|------|------|
| 打开 [设备名] | 开启设备 |
| 关闭 [设备名] | 关闭设备 |
| 把 [设备名] 调到 [数字]% | 调节亮度 |
| [设备名] 状态 | 查看设备状态 |
| 列出所有设备 | 查看已绑定设备 |

### 配置管理

```bash
# 设置 Token
evokehome setup

# 查看 Token 状态
evokehome status

# 刷新 Token
evokehome refresh

# 启用过期提醒
evokehome config --expiry-check true

# 启用自动续期
evokehome config --auto-refresh true
```

### 设备映射

编辑 `~/.config/dueros-evokehome/devices.json`：

```json
{
  "台灯": {
    "id": "cce0daa95ce5",
    "type": "LIGHT",
    "room": "卧室"
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

默认关闭，可手动开启：

```bash
evokehome config --expiry-check true
```

开启后，Token 将在过期前 3 天主动提醒你。

### 自动续期

默认关闭，可手动开启：

```bash
evokehome config --auto-refresh true
```

开启后，系统会在 Token 过期前自动续期。

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

- LIGHT / DESK_LAMP - 灯/台灯
- TV_SET - 电视
- AIR_CONDITIONER - 空调
- 更多见 DuerOS 官方文档

### 数据存储

配置文件位置: `~/.config/dueros-evokehome/`

- `config.json` - Token 和设置
- `devices.json` - 设备映射

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

## 安全说明

- Token 存储在本地 `~/.config/` 目录
- 不要将 Token 提交到代码仓库
- 定期更换 Token 以提高安全性

## 许可证

MIT License

## 作者

Your Name
