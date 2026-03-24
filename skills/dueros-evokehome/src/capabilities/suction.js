/**
 * 可控吸力设备 - SetSuction
 * 支持: 扫地机器人、吸尘器等
 */

export const SUCTION_CAPABILITY = {
  name: 'suction',
  displayName: '可控吸力设备',
  duerosNamespace: 'DuerOS.ConnectedHome.Control',
  
  actions: {
    SetSuction: {
      name: 'SetSuction',
      aliases: ['suction', '吸力', 'setsuction', '强劲'],
      params: ['suction'],
      description: '设置吸力'
    }
  },

  intentKeywords: {
    '吸力': 'SetSuction',
    '强劲': 'SetSuction'
  },

  paramExtractors: {
    suction: (input) => {
      const match = input.match(/(\d+)/);
      return match ? parseInt(match[1]) : null;
    }
  },

  generateMessage: (action, deviceId, params = {}) => {
    return {
      header: {
        namespace: 'DuerOS.ConnectedHome.Control',
        name: 'SetSuctionRequest',
        messageId: generateMessageId(),
        payloadVersion: '1'
      },
      payload: {
        accessToken: params.accessToken || '',
        appliance: {
          applianceId: deviceId,
          additionalApplianceDetails: params.deviceDetails || {}
        },
        suction: { value: params.suction || 50 }
      }
    };
  }
};

function generateMessageId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export default SUCTION_CAPABILITY;
