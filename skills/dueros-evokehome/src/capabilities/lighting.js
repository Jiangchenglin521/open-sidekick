/**
 * 可控灯光设备 - SetBrightness/SetColor/SetColorTemperature
 * 支持: 灯、台灯、灯带等
 */

export const LIGHTING_CAPABILITY = {
  name: 'lighting',
  displayName: '可控灯光设备',
  duerosNamespace: 'DuerOS.ConnectedHome.Control',
  
  // 支持的操作（对应百度文档）
  actions: {
    // 亮度控制
    SetBrightnessPercentage: {
      name: 'SetBrightnessPercentage',
      aliases: ['brightness', '亮度', 'b', 'setbrightness'],
      params: ['percentage'],
      description: '设置亮度百分比'
    },
    IncrementBrightnessPercentage: {
      name: 'IncrementBrightnessPercentage', 
      aliases: ['亮一点', '调亮', 'incrementbrightness'],
      params: ['deltaPercentage'],
      description: '增加亮度'
    },
    DecrementBrightnessPercentage: {
      name: 'DecrementBrightnessPercentage',
      aliases: ['暗一点', '调暗', 'decrementbrightness'], 
      params: ['deltaPercentage'],
      description: '降低亮度'
    },
    
    // 颜色控制
    SetColor: {
      name: 'SetColor',
      aliases: ['color', '颜色', 'setcolor'],
      params: ['color'],
      description: '设置颜色'
    },
    
    // 色温控制
    SetColorTemperature: {
      name: 'SetColorTemperature',
      aliases: ['temp', '色温', 'temperature', 'setcolortemp'],
      params: ['colorTemperatureInKelvin'],
      description: '设置色温（Kelvin）'
    },
    IncrementColorTemperature: {
      name: 'IncrementColorTemperature',
      aliases: ['cool', '冷光', '变冷', '更冷', 'incrementcolortemp'],
      params: ['deltaPercentage'],
      description: '增加色温（更冷）'
    },
    DecrementColorTemperature: {
      name: 'DecrementColorTemperature',
      aliases: ['warm', '暖光', '变暖', '更暖', 'decrementcolortemp'],
      params: ['deltaPercentage'],
      description: '降低色温（更暖）'
    }
  },

  // 意图关键词映射
  intentKeywords: {
    '亮度': 'SetBrightnessPercentage',
    '亮': 'IncrementBrightnessPercentage',
    '暗': 'DecrementBrightnessPercentage',
    '色温': 'SetColorTemperature',
    '暖光': 'DecrementColorTemperature',
    '冷光': 'IncrementColorTemperature',
    '变暖': 'DecrementColorTemperature',
    '变冷': 'IncrementColorTemperature',
    '颜色': 'SetColor'
  },

  // 参数提取规则
  paramExtractors: {
    percentage: (input) => {
      const match = input.match(/(\d+)\s*%?/);
      return match ? parseInt(match[1]) : null;
    },
    colorTemperatureInKelvin: (input) => {
      // 检查是否显式包含 'k' 或 'K'（如 "50k" / "5000K"）
      const hasK = /k/i.test(input);
      const match = input.match(/(\d+)\s*k?/i);
      if (!match) return null;
      let val = parseInt(match[1]);
      
      // 只有当显式包含 'k' 且值小于1000时，才认为是 "50k" 简写
      if (hasK && val < 1000) {
        val *= 1000;
      }
      // 否则保持原值（支持 1-100 的设备直接设置）
      return val;
    },
    color: (input) => {
      const colors = {
        '红': 'RED', '红色': 'RED',
        '绿': 'GREEN', '绿色': 'GREEN', 
        '蓝': 'BLUE', '蓝色': 'BLUE',
        '黄': 'YELLOW', '黄色': 'YELLOW',
        '白': 'WHITE', '白色': 'WHITE'
      };
      for (const [cn, en] of Object.entries(colors)) {
        if (input.includes(cn)) return en;
      }
      return null;
    }
  },

  // 生成控制消息
  generateMessage: (action, deviceId, params = {}) => {
    const basePayload = {
      accessToken: params.accessToken || '',
      appliance: {
        applianceId: deviceId,
        additionalApplianceDetails: params.deviceDetails || {}
      }
    };

    // 根据动作类型添加特定参数
    switch(action) {
      case 'SetBrightnessPercentage':
        basePayload.brightness = { value: params.percentage || 50 };
        break;
      case 'IncrementBrightnessPercentage':
      case 'DecrementBrightnessPercentage':
        basePayload.brightness = { 
          deltaPercentage: params.deltaPercentage || 10 
        };
        break;
      case 'SetColorTemperature':
        // 直接发送 colorTemperatureInKelvin 数值（根据设备实际范围 1-100）
        basePayload.colorTemperatureInKelvin = params.colorTemperatureInKelvin || 50;
        break;
      case 'IncrementColorTemperature':
      case 'DecrementColorTemperature':
        basePayload.colorTemperature = {
          deltaPercentage: params.deltaPercentage || 10
        };
        break;
      case 'SetColor':
        basePayload.color = { hue: params.hue || 0, saturation: 1, brightness: 1 };
        break;
    }

    return {
      header: {
        namespace: 'DuerOS.ConnectedHome.Control',
        name: `${action}Request`,
        messageId: generateMessageId(),
        payloadVersion: '1'
      },
      payload: basePayload
    };
  }
};

function generateMessageId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 将 Kelvin 色温转换为设备百分比 (2700K-6500K -> 1-100)
 */
function kelvinToPercentage(kelvin) {
  const MIN_KELVIN = 2700;
  const MAX_KELVIN = 6500;
  const MIN_PERCENT = 1;
  const MAX_PERCENT = 100;
  
  // 限制在有效范围内
  const clampedKelvin = Math.max(MIN_KELVIN, Math.min(MAX_KELVIN, kelvin));
  
  // 线性映射
  const percentage = Math.round(
    ((clampedKelvin - MIN_KELVIN) / (MAX_KELVIN - MIN_KELVIN)) * (MAX_PERCENT - MIN_PERCENT) + MIN_PERCENT
  );
  
  return percentage;
}

export default LIGHTING_CAPABILITY;
