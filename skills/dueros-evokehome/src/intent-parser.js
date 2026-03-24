/**
 * 意图解析器 - 将用户输入解析为结构化意图数组（支持复合指令）
 * 策略: 先关键词匹配，再简单NLU，支持"，"分隔的复合指令
 */

import { CAPABILITY_MAP, ALL_CAPABILITIES } from './capabilities/index.js';

export class IntentParser {
  constructor() {
    this.capabilityCache = new Map();
    this.initKeywordMap();
  }

  /**
   * 初始化关键词映射表 - 覆盖21种DuerOS官方能力类型
   */
  initKeywordMap() {
    // 动作关键词 -> 能力名称
    this.actionKeywords = {
      // 1. 开关
      '打开': 'switch', '开启': 'switch', '开': 'switch', '启动': 'switch',
      '关闭': 'switch', '关掉': 'switch', '关': 'switch', '停止': 'switch',
      '暂停': 'switch', '继续': 'switch',
      
      // 2. 灯光
      '亮度': 'lighting', '亮': 'lighting', '暗': 'lighting',
      '色温': 'lighting', '暖光': 'lighting', '冷光': 'lighting',
      '变暖': 'lighting', '变冷': 'lighting',
      
      // 3. 温度
      '温度': 'temperature', '度': 'temperature',
      '升温': 'temperature', '降温': 'temperature',
      
      // 4. 风速
      '风速': 'fanSpeed', '风量': 'fanSpeed',
      '风大': 'fanSpeed', '风小': 'fanSpeed',
      
      // 5. 速度（通用）
      '速度': 'speed', '加速': 'speed', '减速': 'speed',
      '变快': 'speed', '变慢': 'speed',
      
      // 6. 模式
      '模式': 'mode', '制冷': 'mode', '制热': 'mode',
      '除湿': 'mode', '送风': 'mode', '自动': 'mode',
      
      // 7. 电视频道
      '频道': 'tvChannel', '台': 'tvChannel',
      '下一台': 'tvChannel', '上一台': 'tvChannel',
      '换台': 'tvChannel', '回看': 'tvChannel',
      
      // 8. 音量
      '音量': 'volume', '大声': 'volume', '小声': 'volume',
      '静音': 'volume',
      
      // 9. 锁定
      '锁定': 'lock', '解锁': 'lock', '上锁': 'lock', '开锁': 'lock',
      '反锁': 'lock',
      
      // 10. 打印
      '打印': 'print',
      
      // 11. 吸力
      '吸力': 'suction',
      
      // 12. 水量
      '水量': 'waterLevel', '拖地': 'waterLevel',
      
      // 13. 充电
      '充电': 'charge', '回充': 'charge', '放电': 'charge',
      
      // 14. 方向
      '左转': 'direction', '右转': 'direction', '上转': 'direction', '下转': 'direction',
      '转向': 'direction', '方向': 'direction', '旋转': 'direction',
      
      // 15. 高度
      '升高': 'height', '降低': 'height', '升降': 'height',
      
      // 16. 定时
      '定时': 'timer', '倒计时': 'timer', '取消定时': 'timer',
      
      // 17. 复位
      '复位': 'reset', '重置': 'reset', '重启': 'reset', '恢复出厂': 'reset',
      
      // 18. 楼层
      '楼层': 'floor', '层': 'floor', '上楼': 'floor', '下楼': 'floor',
      
      // 19. 湿度
      '湿度': 'humidity', '加湿': 'humidity', '除湿': 'humidity',
      
      // 20. 挡位
      '挡位': 'gear', '档位': 'gear',
      '一档': 'gear', '二档': 'gear', '三档': 'gear',
      '低挡': 'gear', '中挡': 'gear', '高挡': 'gear',
      
      // 21. 水流
      '水流': 'flow', '流量': 'flow', '开水': 'flow', '关水': 'flow'
    };
  }

  /**
   * 解析用户输入（支持复合指令，返回意图数组）
   * @param {string} input - 用户输入
   * @returns {Array} 解析后的意图数组
   */
  async parse(input) {
    const normalized = input.toLowerCase().trim();
    
    // 拆分复合指令（按逗号、顿号、分号分隔）
    const subInputs = this.splitCompositeInput(normalized);
    
    const intents = [];
    let sharedDevice = null;  // 共享设备名（用于省略后续设备名）
    
    for (const subInput of subInputs) {
      const intent = await this.parseSingleIntent(subInput, sharedDevice);
      if (intent) {
        intents.push(intent);
        // 记录设备名供后续省略使用
        if (intent.deviceHint) {
          sharedDevice = intent.deviceHint;
        }
      }
    }
    
    return intents;
  }

  /**
   * 拆分复合指令
   */
  splitCompositeInput(input) {
    // 按逗号、顿号、分号、然后、接着拆分
    return input.split(/[,，;；、]|然后|接着/).map(s => s.trim()).filter(Boolean);
  }

  /**
   * 解析单条意图
   */
  async parseSingleIntent(input, sharedDevice = null) {
    // 第一步：关键词匹配能力
    let capabilityName = this.matchByKeywords(input);
    
    // 第二步：如果没匹配到，尝试简单NLU
    if (!capabilityName) {
      capabilityName = this.simpleNLU(input);
    }

    // 获取能力定义
    const capability = await this.getCapability(capabilityName || 'switch');
    
    // 解析具体动作
    const action = this.parseAction(input, capability);
    
    // 提取设备名称（优先从当前输入提取，否则使用共享设备）
    let deviceHint = this.extractDeviceHint(input);
    if (!deviceHint && sharedDevice) {
      deviceHint = sharedDevice;
    }
    
    if (!deviceHint) {
      return null;  // 无法识别设备
    }

    // 提取参数
    const params = this.extractParams(input, capability, action);

    return {
      raw: input,
      capability: capability?.name || capabilityName,
      capabilityDisplay: capability?.displayName,
      action,
      deviceHint,
      params,
      timestamp: Date.now()
    };
  }

  /**
   * 关键词匹配
   */
  matchByKeywords(input) {
    for (const [keyword, capability] of Object.entries(this.actionKeywords)) {
      if (input.includes(keyword)) {
        return capability;
      }
    }
    return null;
  }

  /**
   * 简单NLU - 当关键词匹配失败时使用
   * 基于语义理解的能力推断（覆盖21种能力类型）
   */
  simpleNLU(input) {
    // 灯光相关语义
    if (/灯|光|照明/.test(input)) {
      if (/亮|暗|色温|暖|冷/.test(input)) return 'lighting';
      return 'switch';
    }
    
    // 温度相关语义
    if (/温|冷|热|空调|暖气|地暖|热水器/.test(input)) {
      if (/度|调|升|降/.test(input)) return 'temperature';
      return 'switch';
    }
    
    // 摄像头/方向相关语义
    if (/摄像头|云台|转向|旋转|左|右/.test(input)) {
      return 'direction';
    }
    
    // 电视/频道相关语义
    if (/频道|换台|上一台|下一台|电视.*台/.test(input)) {
      return 'tvChannel';
    }
    
    // 锁定相关语义
    if (/锁|门|解锁|上锁|反锁/.test(input)) {
      return 'lock';
    }
    
    // 打印相关语义
    if (/打印/.test(input)) {
      return 'print';
    }
    
    // 定时相关语义
    if (/定时|倒计时|延迟/.test(input)) {
      return 'timer';
    }
    
    // 复位相关语义
    if (/复位|重置|恢复出厂|重启.*路由|重启.*网关/.test(input)) {
      return 'reset';
    }
    
    // 湿度相关语义
    if (/湿度|加湿|除湿|恒湿/.test(input)) {
      return 'humidity';
    }
    
    // 高度/升降相关语义
    if (/升降|升高|降低|桌子.*高|桌子.*低/.test(input)) {
      return 'height';
    }
    
    // 楼层/电梯相关语义
    if (/楼层|电梯|上楼|下楼|到.*层/.test(input)) {
      return 'floor';
    }
    
    // 速度相关语义（非风扇）
    if (/跑步机|按摩椅|速度|加速|减速/.test(input)) {
      return 'speed';
    }
    
    // 水流相关语义
    if (/水流|水龙头|灌溉|浇水/.test(input)) {
      return 'flow';
    }
    
    // 默认返回开关能力
    return 'switch';
  }

  /**
   * 解析具体动作
   */
  parseAction(input, capability) {
    if (!capability || !capability.actions) return null;
    
    // 遍历能力的动作，看哪个匹配
    for (const [actionName, actionDef] of Object.entries(capability.actions)) {
      for (const alias of actionDef.aliases) {
        if (input.includes(alias.toLowerCase())) {
          return actionName;
        }
      }
    }
    
    // 尝试从意图关键词匹配
    if (capability.intentKeywords) {
      for (const [keyword, action] of Object.entries(capability.intentKeywords)) {
        if (input.includes(keyword)) {
          return action;
        }
      }
    }
    
    // 默认动作
    if (input.includes('开') || input.includes('打开')) {
      return 'TurnOn';
    }
    if (input.includes('关') || input.includes('关闭')) {
      return 'TurnOff';
    }
    
    return null;
  }

  /**
   * 提取设备名称提示
   */
  extractDeviceHint(input) {
    // 先尝试精确设备名匹配（避免把动词也抓进去）
    const exactDevicePatterns = /(台灯|灯|空调|风扇|电视|窗帘|机器人|摄像头|门锁|扫地机|净化器|加湿器|电梯|打印机|水龙头|路由器|网关)/;
    const exactMatch = input.match(exactDevicePatterns);
    if (exactMatch) {
      return exactMatch[1];
    }

    // 常见的设备名称模式
    const patterns = [
      // 把/将 XX 调到/设为
      /[把将]([^调到设为]+)[调到设为]/,
      // XX 的 亮度/温度/色温（匹配"台灯"、"卧室的灯"这类）
      /([^\s的]*(?:灯|台灯|灯泡|空调|风扇|电视|窗帘|机器人|加湿器|净化器|摄像头|门锁|电梯|打印机|水龙头))/
    ];

    for (const pattern of patterns) {
      const match = input.match(pattern);
      if (match) {
        // 清理可能包含的动词前缀
        const cleaned = match[1].trim().replace(/^(打开|开启|启动|关闭|关掉|关)/, '');
        if (cleaned) return cleaned;
      }
    }

    return null;
  }

  /**
   * 提取参数
   */
  extractParams(input, capability, action) {
    const params = {};
    
    if (!capability || !capability.paramExtractors) return params;
    
    // 使用能力的参数提取器
    for (const [paramName, extractor] of Object.entries(capability.paramExtractors)) {
      const value = extractor(input);
      if (value !== null) {
        params[paramName] = value;
      }
    }
    
    return params;
  }

  /**
   * 获取能力定义（带缓存）
   */
  async getCapability(name) {
    if (this.capabilityCache.has(name)) {
      return this.capabilityCache.get(name);
    }
    
    const loader = CAPABILITY_MAP[name];
    if (!loader) return null;
    
    try {
      const capability = await loader();
      this.capabilityCache.set(name, capability);
      return capability;
    } catch (err) {
      console.error(`加载能力 ${name} 失败:`, err);
      return null;
    }
  }

  /**
   * 获取所有支持的能力
   */
  getAllCapabilities() {
    return ALL_CAPABILITIES;
  }
}

export default IntentParser;
