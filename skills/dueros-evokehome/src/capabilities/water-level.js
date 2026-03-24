/**
 * 可控水量设备 - SetWaterLevel
 * 支持: 扫地机器人、浇花器等
 */

export const WATER_LEVEL_CAPABILITY = {
  name: 'waterLevel',
  displayName: '可控水量设备',
  duerosNamespace: 'DuerOS.ConnectedHome.Control',
  
  actions: {
    SetWaterLevel: {
      name: 'SetWaterLevel',
      aliases: ['waterlevel', '水量', 'setwaterlevel', '拖地'],
      params: ['waterLevel'],
      description: '设置水量'
    }
  },

  intentKeywords: {
    '水量': 'SetWaterLevel',
    '拖地': 'SetWaterLevel'
  },

  paramExtractors: {
    waterLevel: (input) => {
      const match = input.match(/(\d+)/);
      return match ? parseInt(match[1]) : null;
    }
  },

  generateMessage: (action, deviceId, params = {}) => {
    return {
      header: {
        namespace: 'DuerOS.ConnectedHome.Control',
        name: 'SetWaterLevelRequest',
        messageId: generateMessageId(),
        payloadVersion: '1'
      },
      payload: {
        accessToken: params.accessToken || '',
        appliance: {
          applianceId: deviceId,
          additionalApplianceDetails: params.deviceDetails || {}
        },
        waterLevel: { value: params.waterLevel || 50 }
      }
    };
  }
};

function generateMessageId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export default WATER_LEVEL_CAPABILITY;
