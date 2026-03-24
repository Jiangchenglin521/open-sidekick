/**
 * 可控温度设备 - SetTemperature/IncrementTemperature/DecrementTemperature
 * 支持: 空调、暖气、热水器等
 */

export const TEMPERATURE_CAPABILITY = {
  name: 'temperature',
  displayName: '可控温度设备', 
  duerosNamespace: 'DuerOS.ConnectedHome.Control',
  
  actions: {
    SetTemperature: {
      name: 'SetTemperature',
      aliases: ['temperature', '温度', 'settemperature', 'temp'],
      params: ['targetTemperature'],
      description: '设置目标温度'
    },
    IncrementTemperature: {
      name: 'IncrementTemperature',
      aliases: ['升温', '调高温', '热一点', 'incrementtemp'],
      params: ['deltaTemperature'],
      description: '升高温度'
    },
    DecrementTemperature: {
      name: 'DecrementTemperature',
      aliases: ['降温', '调低温', '冷一点', 'decrementtemp'],
      params: ['deltaTemperature'],
      description: '降低温度'
    }
  },

  intentKeywords: {
    '温度': 'SetTemperature',
    '度': 'SetTemperature',
    '升温': 'IncrementTemperature',
    '调高温': 'IncrementTemperature',
    '热一点': 'IncrementTemperature',
    '降温': 'DecrementTemperature',
    '调低温': 'DecrementTemperature',
    '冷一点': 'DecrementTemperature'
  },

  paramExtractors: {
    targetTemperature: (input) => {
      const match = input.match(/(\d+)\s*度?/);
      return match ? parseInt(match[1]) : null;
    },
    deltaTemperature: (input) => {
      const match = input.match(/(\d+)\s*度?/);
      return match ? parseInt(match[1]) : 1;
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
      case 'SetTemperature':
        basePayload.targetTemperature = { 
          value: params.targetTemperature || 26,
          scale: 'CELSIUS'
        };
        break;
      case 'IncrementTemperature':
      case 'DecrementTemperature':
        basePayload.deltaValue = { 
          value: params.deltaTemperature || 1,
          scale: 'CELSIUS'
        };
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

export default TEMPERATURE_CAPABILITY;
