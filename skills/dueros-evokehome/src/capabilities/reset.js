/**
 * 可复位设备 - Reset
 * 支持: 路由器、网关等需要复位的设备
 */

export const RESET_CAPABILITY = {
  name: 'reset',
  displayName: '可复位设备',
  duerosNamespace: 'DuerOS.ConnectedHome.Control',
  
  actions: {
    Reset: {
      name: 'Reset',
      aliases: ['reset', '复位', '重置', '重启'],
      params: ['resetType'],
      description: '复位设备'
    }
  },

  intentKeywords: {
    '复位': 'Reset',
    '重置': 'Reset',
    '重启': 'Reset',
    '恢复出厂': 'Reset'
  },

  paramExtractors: {
    resetType: (input) => {
      if (input.includes('出厂')) return 'FACTORY_RESET';
      if (input.includes('软') || input.includes('重启')) return 'SOFT_RESET';
      return 'RESET';
    }
  },

  generateMessage: (action, deviceId, params = {}) => {
    return {
      header: {
        namespace: 'DuerOS.ConnectedHome.Control',
        name: 'ResetRequest',
        messageId: generateMessageId(),
        payloadVersion: '1'
      },
      payload: {
        accessToken: params.accessToken || '',
        appliance: {
          applianceId: deviceId,
          additionalApplianceDetails: params.deviceDetails || {}
        },
        resetType: {
          value: params.resetType || 'RESET'
        }
      }
    };
  }
};

function generateMessageId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export default RESET_CAPABILITY;
