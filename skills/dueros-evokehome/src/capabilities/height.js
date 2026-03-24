/**
 * 可控高度设备 - IncrementHeight/DecrementHeight
 * 支持: 升降桌、升降床等
 */

export const HEIGHT_CAPABILITY = {
  name: 'height',
  displayName: '可控高度设备',
  duerosNamespace: 'DuerOS.ConnectedHome.Control',
  
  actions: {
    IncrementHeight: {
      name: 'IncrementHeight',
      aliases: ['升高', '上升', 'incrementheight'],
      params: ['deltaHeight'],
      description: '升高'
    },
    DecrementHeight: {
      name: 'DecrementHeight',
      aliases: ['降低', '下降', 'decrementheight'],
      params: ['deltaHeight'],
      description: '降低'
    }
  },

  intentKeywords: {
    '升高': 'IncrementHeight',
    '上升': 'IncrementHeight',
    '降低': 'DecrementHeight',
    '下降': 'DecrementHeight'
  },

  paramExtractors: {
    deltaHeight: (input) => {
      const match = input.match(/(\d+)/);
      return match ? parseInt(match[1]) : 10;
    }
  },

  generateMessage: (action, deviceId, params = {}) => {
    return {
      header: {
        namespace: 'DuerOS.ConnectedHome.Control',
        name: `${action}Request`,
        messageId: generateMessageId(),
        payloadVersion: '1'
      },
      payload: {
        accessToken: params.accessToken || '',
        appliance: {
          applianceId: deviceId,
          additionalApplianceDetails: params.deviceDetails || {}
        },
        deltaValue: { value: params.deltaHeight || 10 }
      }
    };
  }
};

function generateMessageId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export default HEIGHT_CAPABILITY;
