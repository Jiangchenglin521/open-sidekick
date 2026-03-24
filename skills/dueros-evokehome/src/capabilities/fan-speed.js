/**
 * 可控风速设备 - SetFanSpeed/IncrementFanSpeed/DecrementFanSpeed
 * 支持: 风扇、空调等
 */

export const FAN_SPEED_CAPABILITY = {
  name: 'fanSpeed',
  displayName: '可控风速设备',
  duerosNamespace: 'DuerOS.ConnectedHome.Control',
  
  actions: {
    SetFanSpeed: {
      name: 'SetFanSpeed',
      aliases: ['fanspeed', '风速', '风量', 'setfanspeed'],
      params: ['fanSpeed'],
      description: '设置风速'
    },
    IncrementFanSpeed: {
      name: 'IncrementFanSpeed',
      aliases: ['风大', '强风', '大风', 'incrementfanspeed'],
      params: ['deltaPercentage'],
      description: '增大风速'
    },
    DecrementFanSpeed: {
      name: 'DecrementFanSpeed',
      aliases: ['风小', '弱风', '小风', 'decrementfanspeed'],
      params: ['deltaPercentage'],
      description: '减小风速'
    }
  },

  intentKeywords: {
    '风速': 'SetFanSpeed',
    '风量': 'SetFanSpeed',
    '风大': 'IncrementFanSpeed',
    '强风': 'IncrementFanSpeed',
    '风小': 'DecrementFanSpeed',
    '弱风': 'DecrementFanSpeed'
  },

  paramExtractors: {
    fanSpeed: (input) => {
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
      case 'SetFanSpeed':
        basePayload.fanSpeed = { value: params.fanSpeed || 50 };
        break;
      case 'IncrementFanSpeed':
      case 'DecrementFanSpeed':
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

export default FAN_SPEED_CAPABILITY;
