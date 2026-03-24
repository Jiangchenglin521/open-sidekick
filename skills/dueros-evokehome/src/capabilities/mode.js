/**
 * 设备模式设置 - SetMode/UnsetMode
 * 支持: 空调、净化器等
 */

export const MODE_CAPABILITY = {
  name: 'mode',
  displayName: '设备模式设置',
  duerosNamespace: 'DuerOS.ConnectedHome.Control',
  
  actions: {
    SetMode: {
      name: 'SetMode',
      aliases: ['mode', '模式', 'setmode'],
      params: ['mode'],
      description: '设置模式'
    },
    UnsetMode: {
      name: 'UnsetMode',
      aliases: ['unsetmode', '取消模式'],
      params: ['mode'],
      description: '取消模式'
    }
  },

  intentKeywords: {
    '模式': 'SetMode',
    '制冷': 'SetMode',
    '制热': 'SetMode',
    '除湿': 'SetMode',
    '送风': 'SetMode',
    '自动': 'SetMode',
    '睡眠': 'SetMode'
  },

  paramExtractors: {
    mode: (input) => {
      const modes = {
        '制冷': 'COOL', '冷风': 'COOL', '冷': 'COOL',
        '制热': 'HEAT', '暖风': 'HEAT', '热': 'HEAT',
        '除湿': 'DEHUMIDIFICATION',
        '送风': 'FAN',
        '自动': 'AUTO',
        '睡眠': 'SLEEP', '夜间': 'NIGHT',
        '阅读': 'READING',
        '休闲': 'RELAX'
      };
      for (const [cn, en] of Object.entries(modes)) {
        if (input.includes(cn)) return en;
      }
      return null;
    }
  },

  generateMessage: (action, deviceId, params = {}) => {
    const basePayload = {
      accessToken: params.accessToken || '',
      appliance: {
        applianceId: deviceId,
        additionalApplianceDetails: params.deviceDetails || {}
      }
    };

    if (action === 'SetMode') {
      basePayload.mode = { value: params.mode || 'AUTO' };
    } else {
      basePayload.mode = { value: params.mode || 'AUTO' };
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

export default MODE_CAPABILITY;
