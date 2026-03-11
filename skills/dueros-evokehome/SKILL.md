---
name: dueros-evokehome
description: DuerOS 智能家居控制技能 - 支持小度生态设备的分层级控制，具备脚本缓存复用机制，支持灯光、空调、窗帘等多种设备类型
homepage: https://github.com/openclaw/dueros-evokehome
metadata: {"clawdbot":{"emoji":"🏠","requires":{"bins":["node"],"env":["DUEROS_TOKEN"]},"primaryEnv":"DUEROS_TOKEN"}}
---

# DuerOS EvokeHome

小度智能家居控制技能，支持脚本缓存复用机制，首次使用后自动生成专用控制脚本，后续调用直接复用。

## 特性

- 🚀 **脚本缓存** - 首次使用生成专用脚本，后续直接复用
- 🔧 **多设备支持** - 灯光、空调、窗帘、电视等设备类型
- 📝 **动作别名** - 支持中英文别名（on/开/off/关/brightness/亮度）
- 🏠 **设备管理** - 轻松添加、删除、管理多个设备
- 📊 **状态查询** - 实时查看设备在线状态和参数

## 快速开始

### 1. 配置 Token

```bash
# 编辑配置文件添加 Token
~/.config/dueros-evokehome/config.json
```

```json
{
  "accessToken": "your_access_token_here",
  "refreshToken": "your_refresh_token_here",
  "defaultDevice": "台灯"
}
```

### 2. 配置设备

```bash
# 编辑设备配置文件
~/.config/dueros-evokehome/devices.json
```

```json
{
  "台灯": {
    "id": "cce0daa95ce5",
    "type": "DESK_LAMP",
    "room": "卧室"
  },
  "客厅灯": {
    "id": "abc123def456",
    "type": "LIGHT",
    "room": "客厅"
  }
}
```

### 3. 控制设备

```bash
# 开灯
node {baseDir}/bin/dueros.js 台灯 on

# 关灯
node {baseDir}/bin/dueros.js 台灯 off

# 设置亮度
node {baseDir}/bin/dueros.js 台灯 brightness 50

# 设置色温（单位：Kelvin）
# 注意：每个设备的色温范围不同（通常在 1K-100K 之间），建议先查询设备状态获取支持范围
node {baseDir}/bin/dueros.js 台灯 temp 55

# 色温调节（按百分比增量/减量）
node {baseDir}/bin/dueros.js 台灯 warm 20   # 变暖 20%
node {baseDir}/bin/dueros.js 台灯 cool 10   # 变冷 10%

# 夜间模式
node {baseDir}/bin/dueros.js 台灯 mode night
```

## CLI 命令

### 设备控制

```bash
dueros <设备> <动作> [参数...]
```

| 设备类型 | 支持动作 | 示例 |
|----------|----------|------|
| LIGHT/DESK_LAMP | on, off, brightness, temp, mode | `dueros 台灯 temp 5500` |
| AC/AIR_CONDITION | on, off, temperature, mode | `dueros 空调 temp 26` |
| CURTAIN | open, close, position | `dueros 窗帘 position 50` |
| TV | on, off, channel, volume | `dueros 电视 channel 5` |

### 动作别名

| 动作 | 别名 | 参数说明 |
|------|------|---------|
| turnOn | on, 开, 打开, 开启 | - |
| turnOff | off, 关, 关闭, 关掉 | - |
| setBrightness | brightness, b, 亮度 | 0-100 (百分比) |
| setColorTemp | temp, temperature, 色温 | 设备相关范围 (通常 1K-100K，请先查询设备状态获取具体范围) |
| incrementColorTemp | cool, 冷光, 变冷, 更冷 | 1-100 (百分比增量, 默认10%) |
| decrementColorTemp | warm, 暖光, 变暖, 更暖 | 1-100 (百分比减量, 默认10%) |
| setMode | mode, 模式, night, 夜间 | 模式名称 |

### 设备管理

```bash
# 列出所有设备
dueros list

# 查看设备状态
dueros status 台灯

# 添加设备（编辑配置文件）
dueros device add

# 删除设备
dueros device remove 台灯
```

#### 关于色温范围

每个设备的色温范围不同（通常在 1K-100K 之间）。设置色温时，脚本会自动查询设备状态获取支持的色温范围并进行校验。如果输入值超出范围，会提示该设备支持的有效范围。

示例：
```bash
# 尝试设置超出范围的值
dueros 台灯 temp 200
# 输出: ❌ 该设备支持的色温范围为 1-100K
```

### 缓存管理

```bash
# 查看缓存统计
dueros cache list

# 清空所有缓存
dueros cache clear

# 清空指定设备缓存
dueros cache clear 台灯
```

## 工作原理

### 脚本缓存机制

```
第一次执行: dueros 台灯 on
  ↓ 检查: scripts/台灯/turnOn.js 是否存在?
  ↓ 不存在
  ↓ 生成: 从 light 模板 + 设备ID 创建专用脚本
  ↓ 执行: 开灯
  
第二次执行: dueros 台灯 on
  ↓ 检查: scripts/台灯/turnOn.js 已存在
  ↓ 直接执行缓存脚本（更快）
```

### 缓存位置

```
scripts/
├── 台灯/
│   ├── turnOn.js
│   ├── turnOff.js
│   ├── setBrightness.js
│   ├── setColorTemp.js
│   ├── incrementColorTemp.js
│   └── decrementColorTemp.js
└── 客厅灯/
    ├── turnOn.js
    └── ...
```

## 配置

### Token 配置

位置: `~/.config/dueros-evokehome/config.json`

```json
{
  "accessToken": "xxx",
  "refreshToken": "xxx",
  "expiresAt": "2026-04-04T15:30:00Z",
  "tokenExpiryCheck": true,
  "autoRefresh": false,
  "defaultDevice": "台灯"
}
```

### 设备配置

位置: `~/.config/dueros-evokehome/devices.json`

```json
{
  "台灯": {
    "id": "设备ID",
    "type": "DESK_LAMP",
    "room": "卧室"
  }
}
```

支持的设备类型:
- `LIGHT` - 普通灯
- `DESK_LAMP` - 台灯
- `AIR_CONDITION` - 空调
- `CURTAIN` - 窗帘
- `TV` - 电视
- `FAN` - 风扇
- `ROBOT` - 扫地机器人

## 扩展开发

添加新设备类型:

1. 在 `src/templates/` 创建模板文件
2. 在 `src/registry.js` 注册设备类型和动作
3. 重新生成缓存脚本即可使用

## 依赖

- Node.js >= 18
- DuerOS Access Token

## License

MIT
