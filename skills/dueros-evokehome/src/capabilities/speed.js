/**
 * 可控速度设备 - SetSpeed/IncrementSpeed/DecrementSpeed
 * 支持: 跑步机、按摩椅等（区别于风扇速度）
 */

export const SPEED_CAPABILITY = {
  name: 'speed',
  displayName: '可控速度设备',
  duerosNamespace: 'DuerOS.ConnectedHome.Control',
  
  actions: {
    SetSpeed: {
      name: 'SetSpeed',
      aliases: ['speed', '速度', 'setspeed'],
      params: ['speed'],
      description: '设置速度'
    },
    IncrementSpeed: {
      name: 'IncrementSpeed',
      aliases: ['加速', '变快', 'incrementspeed'],
      params: ['deltaPercentage'],
      description: '加速'
    },
    DecrementSpeed: {
      name: 'DecrementSpeed',
      aliases: ['减速', '变慢', 'decrementspeed'],
      params: ['deltaPercentage'],
      description: '减速'
    }
  },

  intentKeywords: {
    '速度': 'SetSpeed',
    '加速': 'IncrementSpeed',
    '变快': 'IncrementSpeed',
    '减速': 'DecrementSpeed',
    '变慢': 'DecrementSpeed'
  },

  paramExtractors: {
    speed: (input) => {
      const match = input.match(/(\d+)/);
      return match ? parseInt(match[1]) : null;
    },
    deltaPercentage: (input) => {
      const match = input.match(/(\d+)/);
      return match ? parseInt(match[1]) : 10;
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

    switch(action) {
      case 'SetSpeed':
        basePayload.speed = { value: params.speed || 50 };
        break;
      case 'IncrementSpeed':
      case 'DecrementSpeed':
        basePayload.deltaValue = { value: params.deltaPercentage || 10 };
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

export default SPEED_CAPABILITY;
