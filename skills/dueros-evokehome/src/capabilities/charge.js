/**
 * 可控电量设备 - Charge/Discharge
 * 支持: 储能设备、机器人等
 */

export const CHARGE_CAPABILITY = {
  name: 'charge',
  displayName: '可控电量设备',
  duerosNamespace: 'DuerOS.ConnectedHome.Control',
  
  actions: {
    Charge: {
      name: 'Charge',
      aliases: ['charge', '充电', '回充'],
      params: [],
      description: '开始充电'
    },
    Discharge: {
      name: 'Discharge',
      aliases: ['discharge', '放电'],
      params: [],
      description: '开始放电'
    }
  },

  intentKeywords: {
    '充电': 'Charge',
    '回充': 'Charge',
    '放电': 'Discharge'
  },

  paramExtractors: {},

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
        }
      }
    };
  }
};

function generateMessageId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export default CHARGE_CAPABILITY;
