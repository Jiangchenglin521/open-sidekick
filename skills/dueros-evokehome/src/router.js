/**
 * 意图路由器
 * 负责解析用户输入，确定设备和操作类型
 */

export class SkillRouter {
  constructor(deviceRegistry) {
    this.registry = deviceRegistry;
    this.initPatterns();
  }
  
  /**
   * 初始化匹配模式
   */
  initPatterns() {
    // 动作类型 → 关键词映射
    this.actionPatterns = {
      // 开关控制
      turnOn: {
        keywords: ['打开', '开启', '开', '启动'],
        subSkill: null, // 通用，根据设备类型决定
        priority: 1
      },
      turnOff: {
        keywords: ['关闭', '关掉', '关', '停止'],
        subSkill: null,
        priority: 1
      },
      
      // 灯光控制
      setBrightness: {
        keywords: ['亮度', '亮', '暗', '调到', '设置为'],
        subSkill: 'light',
        priority: 2
      },
      incrementBrightness: {
        keywords: ['亮一点', '亮点', '调亮'],
        subSkill: 'light',
        priority: 2
      },
      decrementBrightness: {
        keywords: ['暗一点', '暗点', '调暗'],
        subSkill: 'light',
        priority: 2
      },
      setColor: {
        keywords: ['颜色', '设为', '调成'],
        subSkill: 'light',
        priority: 2
      },
      setColorTemperature: {
        keywords: ['色温', '暖光', '冷光', '白光'],
        subSkill: 'light',
        priority: 2
      },
      incrementColorTemperature: {
        keywords: ['提高色温', '增加冷光', '更冷'],
        subSkill: 'light',
        priority: 2
      },
      decrementColorTemperature: {
        keywords: ['降低色温', '增加暖光', '更暖'],
        subSkill: 'light',
        priority: 2
      },
      
      // 温度控制
      setTemperature: {
        keywords: ['温度', '度', '摄氏度'],
        subSkill: 'temperature',
        priority: 2
      },
      incrementTemperature: {
        keywords: ['升温', '调高温', '热一点', '暖和点'],
        subSkill: 'temperature',
        priority: 2
      },
      decrementTemperature: {
        keywords: ['降温', '调低温', '冷一点', '凉快'],
        subSkill: 'temperature',
        priority: 2
      },
      
      // 风速控制
      setFanSpeed: {
        keywords: ['风速', '风量', '档位'],
        subSkill: 'fan',
        priority: 2
      },
      incrementFanSpeed: {
        keywords: ['风大', '强风', '大风'],
        subSkill: 'fan',
        priority: 2
      },
      decrementFanSpeed: {
        keywords: ['风小', '弱风', '小风'],
        subSkill: 'fan',
        priority: 2
      },
      
      // 模式控制
      setMode: {
        keywords: ['模式', '切换到', '调成'],
        subSkill: 'mode',
        priority: 2
      },
      
      // 窗帘控制
      setCurtainPosition: {
        keywords: ['窗帘', '开合', '拉开', '拉上'],
        subSkill: 'curtain',
        priority: 2
      },
      
      // 电视控制
      setTVChannel: {
        keywords: ['频道', '台', '换到'],
        subSkill: 'tv',
        priority: 2
      },
      incrementTVChannel: {
        keywords: ['下一个台', '换台', '下一频道'],
        subSkill: 'tv',
        priority: 2
      },
      decrementTVChannel: {
        keywords: ['上一个台', '上一频道'],
        subSkill: 'tv',
        priority: 2
      },
      
      // 音量控制
      setVolume: {
        keywords: ['音量', '声音'],
        subSkill: 'volume',
        priority: 2
      },
      incrementVolume: {
        keywords: ['大声', '响一点', '音量高'],
        subSkill: 'volume',
        priority: 2
      },
      decrementVolume: {
        keywords: ['小声', '轻一点', '音量低'],
        subSkill: 'volume',
        priority: 2
      },
      setVolumeMute: {
        keywords: ['静音', '消音'],
        subSkill: 'volume',
        priority: 2
      },
      
      // 扫地机器人
      setCleaningLocation: {
        keywords: ['清扫', '打扫', '去'],
        subSkill: 'robot',
        priority: 2
      },
      charge: {
        keywords: ['充电', '回充'],
        subSkill: 'robot',
        priority: 2
      },
      setSuction: {
        keywords: ['吸力', '强劲'],
        subSkill: 'robot',
        priority: 2
      },
      setWaterLevel: {
        keywords: ['水量', '拖地'],
        subSkill: 'robot',
        priority: 2
      },
      
      // 传感器/查询
      getStatus: {
        keywords: ['状态', '怎么样', '情况'],
        subSkill: 'sensor',
        priority: 1
      },
      getTemperature: {
        keywords: ['温度是多少', '多少度'],
        subSkill: 'sensor',
        priority: 2
      },
      getHumidity: {
        keywords: ['湿度', '湿吗'],
        subSkill: 'sensor',
        priority: 2
      },
      getPM25: {
        keywords: ['PM2.5', '空气质量'],
        subSkill: 'sensor',
        priority: 2
      }
    };
    
    // 设备类型 → 默认子技能映射
    this.deviceTypeToSkill = {
      'LIGHT': 'light',
      'DESK_LAMP': 'light',
      'AIR_CONDITION': 'temperature',
      'WATER_HEATER': 'temperature',
      'HEATER': 'temperature',
      'FAN': 'fan',
      'AIR_PURIFIER': 'fan',
      'RANGE_HOOD': 'fan',
      'CURTAIN': 'curtain',
      'WINDOW_OPENER': 'curtain',
      'TV_SET': 'tv',
      'OTT_BOX': 'tv',
      'SET_TOP_BOX': 'tv',
      'SWEEPING_ROBOT': 'robot',
      'SENSOR': 'sensor',
      'LOCK': 'lock',
      'HUMIDIFIER': 'humidity',
      'DEHUMIDIFIER': 'humidity',
      'ELEVATOR': 'elevator'
    };
  }
  
  /**
   * 解析用户输入为意图对象
   */
  parseIntent(input) {
    const normalized = input.toLowerCase().trim();
    
    // 1. 提取设备名称（去掉动作词后的内容）
    const deviceHint = this.extractDeviceHint(normalized);
    
    // 2. 匹配动作类型
    const actionType = this.matchActionType(normalized);
    
    // 3. 提取参数（数值、百分比等）
    const params = this.extractParams(normalized);
    
    return {
      raw: input,
      deviceHint,
      actionType,
      params,
      timestamp: Date.now()
    };
  }
  
  /**
   * 提取设备名称提示
   */
  extractDeviceHint(input) {
    // 常见的设备名称模式
    const devicePatterns = [
      // 把/将 XX 调到/设为
      /[把将]([^调到设为]+)[调到设为]/,
      // XX 亮/暗/温度/模式
      /([^\s]+(?:灯|台灯|灯泡|空调|风扇|电视|窗帘|机器人|加湿器|净化器))/,
      // 打开/关闭 XX
      /(?:打开|关闭|开启|关掉)\s*([^\s]+)/,
      // XX 状态
      /([^\s]+(?:灯|空调|风扇|电视))\s*(?:状态|怎么样)/
    ];
    
    for (const pattern of devicePatterns) {
      const match = input.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }
    
    // 默认返回整个输入（可能是设备别名）
    return input.replace(/[打开关闭开关调设置到为的]/g, '').trim();
  }
  
  /**
   * 匹配动作类型
   */
  matchActionType(input) {
    for (const [actionType, config] of Object.entries(this.actionPatterns)) {
      for (const keyword of config.keywords) {
        if (input.includes(keyword)) {
          return actionType;
        }
      }
    }
    
    // 默认：根据关键词猜测
    if (input.includes('开')) return 'turnOn';
    if (input.includes('关')) return 'turnOff';
    
    return 'getStatus'; // 默认查询状态
  }
  
  /**
   * 提取参数
   */
  extractParams(input) {
    const params = {};
    
    // 提取百分比/数值
    const percentMatch = input.match(/(\d+)\s*%?/);
    if (percentMatch) {
      params.value = parseInt(percentMatch[1]);
      params.percentage = params.value;
    }
    
    // 提取模式名称
    const modePatterns = {
      'NIGHT': ['夜间', '睡眠', '睡觉'],
      'DAY': ['日间', '白天'],
      'READING': ['阅读', '看书', '读书'],
      'RELAX': ['休闲', '放松'],
      'COOL': ['制冷', '冷风'],
      'HEAT': ['制热', '暖风', '热风'],
      'AUTO': ['自动'],
      'FAN': ['送风'],
      'DEHUMIDIFICATION': ['除湿']
    };
    
    for (const [mode, keywords] of Object.entries(modePatterns)) {
      if (keywords.some(k => input.includes(k))) {
        params.mode = mode;
        break;
      }
    }
    
    // 提取颜色
    const colorPatterns = {
      'RED': ['红'],
      'GREEN': ['绿'],
      'BLUE': ['蓝'],
      'YELLOW': ['黄'],
      'WHITE': ['白'],
      'WARM': ['暖'],
      'COOL': ['冷']
    };
    
    for (const [color, keywords] of Object.entries(colorPatterns)) {
      if (keywords.some(k => input.includes(k))) {
        params.color = color;
        break;
      }
    }
    
    // 提取位置（扫地机器人）
    const locationPatterns = {
      'MASTER_BEDROOM': ['主卧', '主卧室'],
      'SECOND_BEDROOM': ['次卧', '次卧室'],
      'LIVING_ROOM': ['客厅'],
      'KITCHEN': ['厨房'],
      'STUDY': ['书房']
    };
    
    for (const [location, keywords] of Object.entries(locationPatterns)) {
      if (keywords.some(k => input.includes(k))) {
        params.location = location;
        break;
      }
    }
    
    return params;
  }
  
  /**
   * 根据设备类型和动作获取子技能
   */
  getSubSkillForDevice(deviceType, actionType) {
    // 1. 先看动作是否指定了子技能
    const actionConfig = this.actionPatterns[actionType];
    if (actionConfig?.subSkill) {
      return actionConfig.subSkill;
    }
    
    // 2. 根据设备类型映射
    const skillName = this.deviceTypeToSkill[deviceType];
    if (skillName) {
      return skillName;
    }
    
    // 3. 通用动作（开关）根据设备类型决定
    if (['turnOn', 'turnOff'].includes(actionType)) {
      return this.deviceTypeToSkill[deviceType] || null;
    }
    
    return null;
  }
  
  /**
   * 添加自定义路由规则
   */
  addRoute(deviceType, skillName) {
    this.deviceTypeToSkill[deviceType] = skillName;
  }
}
