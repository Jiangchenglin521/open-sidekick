/**
 * 可控湿度类设备 - SetHumidity
 * 支持: 加湿器、除湿器等
 */

export const HUMIDITY_CAPABILITY = {
  name: 'humidity',
  displayName: '可控湿度类设备',
  duerosNamespace: 'DuerOS.ConnectedHome.Control',
  
  actions: {
    SetHumidity: {
      name: 'SetHumidity',
      aliases: ['humidity', '湿度', 'sethumidity'],
      params: ['humidity'],
      description: '设置湿度'
    }
  },

  intentKeywords: {
    '湿度': 'SetHumidity',
    '加湿': 'SetHumidity',
    '除湿': 'SetHumidity'
  },

  paramExtractors: {
    humidity: (input) => {
      const match = input.match(/(\d+)\s*%?/);
      return match ? parseInt(match[1]) : null;
    }
  },

  generateMessage: (action, deviceId, params = {}) => {
    return {
      header: {
        namespace: 'DuerOS.ConnectedHome.Control',
        name: 'SetHumidityRequest',
        messageId: generateMessageId(),
        payloadVersion: '1'
      },
      payload: {
        accessToken: params.accessToken || '',
        appliance: {
          applianceId: deviceId,
          additionalApplianceDetails: params.deviceDetails || {}
        },
        humidity: {
          value: params.humidity || 50
        }
      }
    };
  }
};

function generateMessageId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export default HUMIDITY_CAPABILITY;
