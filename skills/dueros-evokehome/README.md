# DuerOS EvokeHome

小度智能家居控制技能，采用**饱和式攻击执行架构**，支持21种设备能力类型，执行后状态验证，执行缓存复用。

## 核心特性

- ⚡ **饱和式攻击** - 复合指令连续发送，不阻塞、不等待确认
- 🔍 **状态验证** - 执行后查询设备状态，向用户汇报实际结果
- 💾 **执行缓存** - 成功指令自动缓存，下次直接复用
- 🎯 **21种能力** - 完整覆盖 DuerOS 智能家居协议
- 🔧 **智能解析** - 关键词匹配 + NLU，支持复合指令
- 📝 **自然语言** - 像说话一样控制设备

## 安装

```bash
# 克隆或复制到 OpenClaw skills 目录
cd ~/.openclaw/workspace/skills/dueros-evokehome

# 安装依赖
npm install
```

## 快速开始

### 1. 获取 Token

1. 访问 [小度官网](https://xiaodu.baidu.com) 登录
2. F12 打开开发者工具 → Network 标签
3. 操作任意设备，找到 `directivesend` 请求
4. 复制 Headers 中 Cookie 的 `AUTHORIZATION=access-` 后的字符串

### 2. 配置

```bash
# 编辑 Token 配置
nano config/config.json
```

```json
{
  "accessToken": "your_token_here"
}
```

```bash
# 编辑设备配置
nano config/devices.json
```

```json
{
  "台灯": {
    "id": "your_device_id",
    "room": "卧室"
  }
}
```

### 3. 开始使用

```bash
# 简单控制
./bin/evokehome.js "打开台灯"

# 复合指令（自动拆分饱和发送）
./bin/evokehome.js "开启台灯，亮度最高，色温最低"

# 连续操作
./bin/evokehome.js "连续开关台灯3次"

# 查询状态
./bin/evokehome.js status 台灯
```

## 使用示例

### 台灯控制

```bash
# 开灯
evokehome "打开台灯"

# 调节亮度
evokehome "台灯亮度调到50"
evokehome "台灯亮度最高"

# 调节色温
evokehome "台灯色温调到4000"
evokehome "台灯暖光"
evokehome "台灯冷光"

# 复合指令
evokehome "开启台灯，亮度最高，色温最低"
```

### 摄像头控制

```bash
# 开启
evokehome "打开摄像头"

# 转向
evokehome "摄像头左转"
evokehome "摄像头右转"
evokehome "摄像头上转"
evokehome "摄像头下转"

# 复合指令
evokehome "开启摄像头，右转90度"
```

### 空调控制

```bash
# 开关
evokehome "打开空调"
evokehome "关闭空调"

# 温度
evokehome "空调温度调到26度"
evokehome "空调升温"
evokehome "空调降温"

# 模式
evokehome "空调制冷模式"
evokehome "空调制热模式"
```

## CLI 命令

```bash
# 执行自然语言指令
evokehome "<指令>"

# 查询设备状态
evokehome status <设备名>

# 列出所有设备
evokehome list

# 查看执行缓存
evokehome cache

# 清除执行缓存
evokehome cache clear

# 查看支持的21种能力
evokehome capabilities
```

## 执行架构

### 饱和式攻击流程

```
用户: "开启台灯，亮度最高"
    ↓
[解析] 拆分为: [TurnOn, SetBrightness(100)]
    ↓
[检查缓存] 命中? 直接使用缓存消息 : 生成新消息
    ↓
[饱和发送] 连续发送2条消息（不等响应）
    ↓
[查询状态] GET 设备当前状态
    ↓
[验证结果] 对比预期 vs 实际状态
    ↓
[汇报] ✅ 台灯已开启，亮度100%
    ↓
[缓存] 首次成功则缓存指令序列
```

### 与旧架构的区别

| 特性 | 旧架构 | 新架构（当前） |
|------|--------|---------------|
| 执行方式 | 逐个发送，等待响应 | 饱和式攻击，连续发送 |
| 能力校验 | 发送前检查 capabilities | 不检查，直接发送 |
| 状态检查 | 发送过程中检查 | 发送后统一查询验证 |
| 失败处理 | 发送失败即停止 | 发完再查状态汇报 |
| 缓存机制 | 脚本缓存 | 执行缓存（消息体级别） |

## 支持的21种能力

| 类别 | 能力 | 说明 |
|------|------|------|
| 基础 | switch | 打开关闭设备 |
| 基础 | lighting | 可控灯光设备（亮度、色温） |
| 基础 | temperature | 可控温度设备 |
| 环境 | fanSpeed | 可控风速设备 |
| 环境 | speed | 可控速度设备 |
| 环境 | mode | 设备模式设置 |
| 环境 | humidity | 可控湿度类设备 |
| 媒体 | tvChannel | 电视频道设置 |
| 媒体 | volume | 可控音量设备 |
| 运动 | direction | 可控方向设备（摄像头） |
| 运动 | height | 可控高度设备 |
| 运动 | floor | 可控楼层设备 |
| 特性 | suction | 可控吸力设备 |
| 特性 | waterLevel | 可控水量设备 |
| 特性 | charge | 可控电量设备 |
| 特性 | gear | 可控挡位类设备 |
| 特性 | flow | 可控水流类设备 |
| 功能 | lock | 可锁定设备 |
| 功能 | print | 打印设备 |
| 功能 | timer | 可控定时设备 |
| 功能 | reset | 可复位设备 |

## 项目结构

```
dueros-evokehome/
├── bin/
│   └── evokehome.js           # CLI 入口
├── src/
│   ├── index.js               # 主入口
│   ├── client.js              # DuerOS API 客户端
│   ├── intent-parser.js       # 意图解析器
│   ├── capability-registry.js # 设备注册中心
│   ├── execution-cache.js     # 执行缓存
│   └── capabilities/          # 21种能力模块
│       ├── switch.js
│       ├── lighting.js
│       ├── temperature.js
│       └── ... (共21个)
├── config/
│   ├── config.json            # Token配置
│   └── devices.json           # 设备列表
├── templates/                 # 配置模板
├── tests/                     # 测试文件
└── SKILL.md                   # 详细文档
```

## 配置说明

### config.json

```json
{
  "accessToken": "your_access_token",
  "refreshToken": "optional_refresh_token"
}
```

### devices.json

**注意：** 只需要设备ID，不需要声明 capabilities

```json
{
  "台灯": {
    "id": "device_id_here",
    "room": "卧室"
  },
  "摄像头": {
    "id": "device_id_here",
    "room": "客厅"
  }
}
```

## 故障排除

### 设备离线

- 检查设备电源
- 检查设备 WiFi 连接
- 在小度 APP 中查看设备状态

### Token 过期

- 重新按照"获取 Token"步骤获取新 Token
- 更新 config/config.json

### 找不到设备

- 检查 devices.json 中的设备名和 ID
- 运行 `evokehome list` 确认设备配置正确

### 指令执行失败

- 系统会自动查询状态并汇报失败原因
- 检查设备是否支持该操作（如台灯不支持转向）
- 查看执行缓存: `evokehome cache`

## 技术说明

### API 端点

- 设备控制: `POST /directivesend`
- 设备状态: `GET /devicestate`

### 执行缓存位置

```
.cache/execution-cache.json
```

缓存格式:
```json
{
  "台灯::开启台灯亮度最高": {
    "deviceName": "台灯",
    "messages": [...],
    "successCount": 5,
    "lastUsed": 1710685740123
  }
}
```

## 开发

```bash
# 运行测试
npm test

# 清除缓存
rm .cache/execution-cache.json
```

## 依赖

- Node.js >= 18
- DuerOS Access Token

## License

MIT

## 相关链接

- [DuerOS 官方文档](https://dueros.baidu.com/didp/doc/dueros-bot-platform/dbp-smart-home/protocol/control-message_markdown)
