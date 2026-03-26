---
name: dueros-evokehome
description: |
  DuerOS智能家居控制，支持小度设备的开关、亮度、色温等21种能力控制。
  Use when: (1) 用户要求控制智能家居设备, (2) 操作小度音箱/台灯/摄像头等, (3) 语音控制家电, (4) 查询设备状态。
---

# DuerOS EvokeHome

小度智能家居控制技能，采用**饱和式攻击执行架构**，与百度 DuerOS 官方规范完全对齐。

## 核心特性

- ⚡ **饱和式攻击** - 复合指令连续发送，不阻塞、不等待确认
- 🔍 **状态验证** - 执行后查询设备状态，向用户汇报实际结果
- 💾 **执行缓存** - 成功指令自动缓存，下次直接复用提高效率
- 🎯 **能力驱动** - 按「可控灯光设备」「可控方向设备」等21种能力分类
- 🔧 **智能解析** - 先关键词匹配，后简单NLU，支持复合指令
- 📝 **模板化控制** - 自动生成标准DuerOS控制消息

---

## 执行原则

### 1. 饱和式攻击（发送阶段）

对于复合指令（包含多个操作的指令），采用**连续发送、不等待确认**的策略。

| 原则 | 说明 |
|------|------|
| **连续发射** | 多个操作命令连续发送，不等待每个命令的响应 |
| **不做状态检查** | 发送过程中不查询设备状态 |
| **不人为阻塞** | 命令之间不添加sleep或等待，一口气发完 |
| **无能力校验** | 不预先检查设备是否支持该能力，直接发送 |

**示例：**
```
发送 开灯 → 不等 → 发送 亮度100 → 不等 → 发送 色温1000 → 完成（发送阶段）
```

### 2. 状态查询与汇报（结束阶段）

**发送完成后必须查询设备状态，向用户汇报实际结果。**

| 步骤 | 操作 | 目的 |
|------|------|------|
| 1 | 饱和式发送所有指令 | 快速下达命令 |
| 2 | 查询设备当前状态 | 获取实际执行结果 |
| 3 | 对比预期vs实际状态 | 判断是否成功 |
| 4 | 向用户汇报结果 | 告知成功或失败 |

**成功示例：**
```
用户: "开启台灯，亮度最高"
系统:
  → 发送 TurnOn + SetBrightness(100)
  → 查询状态: 台灯已开启，亮度100%
  → 汇报: ✅ 台灯已开启，亮度已调至最高
```

**失败示例（设备不支持）：**
```
用户: "台灯右转"
系统:
  → 发送 SetDirection(RIGHT)  // 不关心是否支持，直接发
  → 查询状态: 台灯状态无变化
  → 汇报: ❌ 台灯不支持转向操作
```

### 3. 执行缓存机制

**缓存规则：**
- 执行成功（状态验证通过）的指令序列会被缓存
- 下次收到相同指令时，直接复用缓存的消息体
- 缓存位置: `.cache/execution-cache.json`

**执行流程对比：**

| 阶段 | 首次执行 | 缓存命中 |
|------|---------|---------|
| 意图解析 | 解析指令 | ❌ 跳过 |
| 消息生成 | 生成消息 | ❌ 跳过 |
| 饱和发送 | 发送消息 | ✅ 直接发送缓存消息 |
| 状态查询 | 查询验证 | ✅ 查询验证 |
| 汇报结果 | 汇报用户 | ✅ 汇报用户 |

---

## 快速开始

### 1. 配置 Token

编辑统一配置文件 `~/.openclaw/workspace/.env`：

```bash
# DuerOS 配置
DUEROS_ACCESS_TOKEN=your_access_token_here
DUEROS_REFRESH_TOKEN=optional_refresh_token
DUEROS_DEFAULT_DEVICE=台灯
```

**注意**：不再使用 `config/config.json`，请迁移到统一 `.env` 文件。

**获取 Token 方法：**
1. 访问 [小度官网](https://xiaodu.baidu.com) 并登录
2. F12 打开开发者工具 → Network 标签
3. 操作任意设备，找到 `directivesend` 请求
4. 在 Headers 的 Cookie 中找到 `AUTHORIZATION=access-` 后的字符串

### 2. 配置设备

编辑 `config/devices.json`，**只需要设备ID**：

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

**注意：** 不需要声明 `capabilities` 能力列表，系统会直接执行指令，通过执行后查询状态来验证成功与否。

### 3. 控制设备

```bash
# 简单指令
evokehome "打开台灯"

# 复合指令（自动拆分饱和发送）
evokehome "开启台灯，亮度最高，色温最低"

# 连续操作
evokehome "连续开关台灯3次"

# 控制摄像头
evokehome "摄像头左转"
evokehome "开启摄像头，右转90度"

# 空调控制
evokehome "空调温度调到26度"
```

---

## 21种设备能力类型

根据 [百度 DuerOS 官方文档](https://dueros.baidu.com/didp/doc/dueros-bot-platform/dbp-smart-home/protocol/control-message_markdown)：

### 基础控制类

| 序号 | 能力名称 | 配置名 | 支持的操作 | 示例设备 |
|-----|---------|--------|-----------|---------|
| 1 | **打开关闭设备** | `switch` | TurnOn/TurnOff/Pause/Continue | 几乎所有设备 |
| 2 | **可控灯光设备** | `lighting` | SetBrightness/SetColor/SetColorTemperature | 灯、台灯 |
| 3 | **可控温度设备** | `temperature` | SetTemperature/Increment/Decrement | 空调、暖气 |

### 环境控制类

| 序号 | 能力名称 | 配置名 | 支持的操作 | 示例设备 |
|-----|---------|--------|-----------|---------|
| 4 | **可控风速设备** | `fanSpeed` | SetFanSpeed/Increment/Decrement | 风扇、空调 |
| 5 | **可控速度设备** | `speed` | SetSpeed/Increment/Decrement | 跑步机、按摩椅 |
| 6 | **设备模式设置** | `mode` | SetMode/UnsetMode | 空调、净化器 |
| 7 | **可控湿度类设备** | `humidity` | SetHumidity | 加湿器、除湿器 |

### 媒体控制类

| 序号 | 能力名称 | 配置名 | 支持的操作 | 示例设备 |
|-----|---------|--------|-----------|---------|
| 8 | **电视频道设置** | `tvChannel` | SetTVChannel/Increment/Decrement/Return | 电视、机顶盒 |
| 9 | **可控音量设备** | `volume` | SetVolume/Increment/Decrement/Mute | 电视、音箱 |

### 运动控制类

| 序号 | 能力名称 | 配置名 | 支持的操作 | 示例设备 |
|-----|---------|--------|-----------|---------|
| 10 | **可控方向设备** | `direction` | SetDirection/SetCleaningLocation | 摄像头、云台 |
| 11 | **可控高度设备** | `height` | IncrementHeight/DecrementHeight | 升降桌 |
| 12 | **可控楼层设备** | `floor` | SetFloor/Increment/Decrement | 电梯 |

### 设备特性类

| 序号 | 能力名称 | 配置名 | 支持的操作 | 示例设备 |
|-----|---------|--------|-----------|---------|
| 13 | **可控吸力设备** | `suction` | SetSuction | 扫地机、吸尘器 |
| 14 | **可控水量设备** | `waterLevel` | SetWaterLevel | 扫地机、浇花器 |
| 15 | **可控电量设备** | `charge` | Charge/Discharge | 储能设备、机器人 |
| 16 | **可控挡位类设备** | `gear` | SetGear | 风扇、加热器 |
| 17 | **可控水流类设备** | `flow` | SetFlow | 智能水龙头、灌溉系统 |

### 功能控制类

| 序号 | 能力名称 | 配置名 | 支持的操作 | 示例设备 |
|-----|---------|--------|-----------|---------|
| 18 | **可锁定设备** | `lock` | SetLockState | 智能门锁 |
| 19 | **打印设备** | `print` | SubmitPrint | 智能打印机 |
| 20 | **可控定时设备** | `timer` | SetTimer/TimingCancel | 几乎所有设备 |
| 21 | **可复位设备** | `reset` | Reset | 路由器、网关 |

---

## CLI 命令

### 设备控制

```bash
# 执行自然语言指令
evokehome "打开台灯"
evokehome "开启台灯，亮度最高"
evokehome "摄像头左转"

# 查询设备状态
evokehome status 台灯
evokehome status 摄像头
```

### 设备管理

```bash
# 列出所有设备
evokehome list

# 查看执行缓存统计
evokehome cache

# 清除执行缓存
evokehome cache clear
```

### 能力查看

```bash
# 列出所有21种能力类型
evokehome capabilities
```

---

## 工作原理

### 执行流程图

```
用户输入: "开启台灯，亮度最高"
    ↓
意图解析器 (IntentParser)
    ├── 拆分复合指令: ["开启台灯", "亮度最高"]
    ├── 关键词匹配能力
    └── 解析设备名、动作、参数
    ↓
意图数组:
  [{capability: "switch", action: "TurnOn", device: "台灯"},
   {capability: "lighting", action: "SetBrightness", device: "台灯", params: {percentage: 100}}]
    ↓
检查执行缓存
    ├── 命中缓存 → 直接使用缓存的消息体
    └── 未命中 → 生成新的消息
    ↓
饱和式攻击发送
    ├── 发送 TurnOnRequest（不等响应）
    └── 发送 SetBrightnessPercentageRequest（不等响应）
    ↓
查询设备状态
    └── GET /设备状态
    ↓
验证结果
    ├── 对比预期状态 vs 实际状态
    └── 判断是否成功
    ↓
汇报用户
    ├── 成功: ✅ 台灯已开启，亮度100%
    └── 失败: ❌ 执行失败原因
    ↓
更新缓存（首次成功）
    └── 保存到 .cache/execution-cache.json
```

### 控制消息格式

每个能力模块生成标准的 DuerOS 消息：

```javascript
{
  header: {
    namespace: 'DuerOS.ConnectedHome.Control',
    name: 'SetBrightnessPercentageRequest',
    messageId: '1710685740123-abc123',
    payloadVersion: '1'
  },
  payload: {
    accessToken: 'xxx',
    appliance: {
      applianceId: 'device_id',
      additionalApplianceDetails: {}
    },
    brightness: { value: 100 }
  }
}
```

---

## 项目结构

```
dueros-evokehome/
├── bin/
│   └── evokehome.js          # CLI 入口
├── src/
│   ├── index.js              # 主入口（EvokeHome类）
│   ├── client.js             # DuerOS API 客户端
│   ├── intent-parser.js      # 意图解析器（支持复合指令）
│   ├── capability-registry.js # 设备注册中心（无能力校验）
│   ├── execution-cache.js    # 执行缓存管理
│   ├── config.js             # 配置管理
│   ├── utils.js              # 工具函数
│   └── capabilities/         # 21种能力模块
│       ├── index.js          # 能力导出中心
│       ├── switch.js         # 1. 打开关闭设备
│       ├── lighting.js       # 2. 可控灯光设备
│       ├── temperature.js    # 3. 可控温度设备
│       ├── fan-speed.js      # 4. 可控风速设备
│       ├── speed.js          # 5. 可控速度设备
│       ├── mode.js           # 6. 设备模式设置
│       ├── tv-channel.js     # 7. 电视频道设置
│       ├── volume.js         # 8. 可控音量设备
│       ├── lock.js           # 9. 可锁定设备
│       ├── print.js          # 10. 打印设备
│       ├── suction.js        # 11. 可控吸力设备
│       ├── water-level.js    # 12. 可控水量设备
│       ├── charge.js         # 13. 可控电量设备
│       ├── direction.js      # 14. 可控方向设备
│       ├── height.js         # 15. 可控高度设备
│       ├── timer.js          # 16. 可控定时设备
│       ├── reset.js          # 17. 可复位设备
│       ├── floor.js          # 18. 可控楼层设备
│       ├── humidity.js       # 19. 可控湿度类设备
│       ├── gear.js           # 20. 可控挡位类设备
│       └── flow.js           # 21. 可控水流类设备
├── config/
│   ├── config.json           # Token 配置
│   └── devices.json          # 设备列表（只需ID）
├── templates/
│   ├── config.json           # 配置模板
│   └── devices.json          # 设备模板
├── tests/                    # 测试文件
├── SKILL.md                  # 本文件
├── README.md                 # 项目说明
└── package.json              # 包配置
```

---

## 依赖

- Node.js >= 18
- DuerOS Access Token

## License

MIT
