/**
 * 可控水流类设备 - SetFlow
 * 支持: 智能水龙头、灌溉系统等
 */

export const FLOW_CAPABILITY = {
  name: 'flow',
  displayName: '可控水流类设备',
  duerosNamespace: 'DuerOS.ConnectedHome.Control',
  
  actions: {
    SetFlow: {
      name: 'SetFlow',
      aliases: ['flow', '水流', '流量', 'setflow'],
      params: ['flow'],
      description: '设置水流'
    }
  },

  intentKeywords: {
    '水流': 'SetFlow',
    '流量': 'SetFlow',
    '开水': 'SetFlow',
    '关水': 'SetFlow'
  },

  paramExtractors: {
    flow: (input) => {
      const match = input.match(/(\d+)/);
      if (match) return parseInt(match[1]);
      if (input.includes('开')) return 100;
      if (input.includes('关')) return 0;
      return null;
    }
  },

  generateMessage: (action, deviceId, params = {}) => {
    return {
      header: {
        namespace: 'DuerOS.ConnectedHome.Control',
        name: 'SetFlowRequest',
        messageId: generateMessageId(),
        payloadVersion: '1'
      },
      payload: {
        accessToken: params.accessToken || '',
        appliance: {
          applianceId: deviceId,
          additionalApplianceDetails: params.deviceDetails || {}
        },
        flow: {
          value: params.flow || 50
        }
      }
    };
  }
};

function generateMessageId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export default FLOW_CAPABILITY;
