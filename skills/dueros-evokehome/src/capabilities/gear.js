/**
 * 可控挡位类设备 - SetGear
 * 支持: 风扇、加热器等的档位控制
 */

export const GEAR_CAPABILITY = {
  name: 'gear',
  displayName: '可控挡位类设备',
  duerosNamespace: 'DuerOS.ConnectedHome.Control',
  
  actions: {
    SetGear: {
      name: 'SetGear',
      aliases: ['gear', '挡位', '档位', 'setgear', '一档', '二档', '三档'],
      params: ['gear'],
      description: '设置挡位'
    }
  },

  intentKeywords: {
    '挡位': 'SetGear',
    '档位': 'SetGear',
    '一档': 'SetGear',
    '二档': 'SetGear',
    '三档': 'SetGear',
    '低挡': 'SetGear',
    '中挡': 'SetGear',
    '高挡': 'SetGear'
  },

  paramExtractors: {
    gear: (input) => {
      if (input.includes('一') || input.includes('低')) return 1;
      if (input.includes('二') || input.includes('中')) return 2;
      if (input.includes('三') || input.includes('高')) return 3;
      const match = input.match(/(\d+)/);
      return match ? parseInt(match[1]) : null;
    }
  },

  generateMessage: (action, deviceId, params = {}) => {
    return {
      header: {
        namespace: 'DuerOS.ConnectedHome.Control',
        name: 'SetGearRequest',
        messageId: generateMessageId(),
        payloadVersion: '1'
      },
      payload: {
        accessToken: params.accessToken || '',
        appliance: {
          applianceId: deviceId,
          additionalApplianceDetails: params.deviceDetails || {}
        },
        gear: {
          value: params.gear || 1
        }
      }
    };
  }
};

function generateMessageId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export default GEAR_CAPABILITY;
