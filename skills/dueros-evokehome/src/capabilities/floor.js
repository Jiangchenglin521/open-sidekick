/**
 * 可控楼层设备 - SetFloor/IncrementFloor/DecrementFloor
 * 支持: 电梯、智能车库等
 */

export const FLOOR_CAPABILITY = {
  name: 'floor',
  displayName: '可控楼层设备',
  duerosNamespace: 'DuerOS.ConnectedHome.Control',
  
  actions: {
    SetFloor: {
      name: 'SetFloor',
      aliases: ['floor', '楼层', '到', '去', 'setfloor'],
      params: ['floor'],
      description: '设置楼层'
    },
    IncrementFloor: {
      name: 'IncrementFloor',
      aliases: ['上楼', '上一层', 'incrementfloor'],
      params: ['deltaFloor'],
      description: '上楼'
    },
    DecrementFloor: {
      name: 'DecrementFloor',
      aliases: ['下楼', '下一层', 'decrementfloor'],
      params: ['deltaFloor'],
      description: '下楼'
    }
  },

  intentKeywords: {
    '楼层': 'SetFloor',
    '层': 'SetFloor',
    '上楼': 'IncrementFloor',
    '上一层': 'IncrementFloor',
    '下楼': 'DecrementFloor',
    '下一层': 'DecrementFloor'
  },

  paramExtractors: {
    floor: (input) => {
      const match = input.match(/(\d+)\s*层?/);
      return match ? parseInt(match[1]) : null;
    },
    deltaFloor: (input) => {
      const match = input.match(/(\d+)\s*层?/);
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
      case 'SetFloor':
        basePayload.floor = { value: params.floor || 1 };
        break;
      case 'IncrementFloor':
      case 'DecrementFloor':
        basePayload.deltaValue = { value: params.deltaFloor || 1 };
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

export default FLOOR_CAPABILITY;
