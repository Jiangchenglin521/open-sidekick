/**
 * 可控方向设备 - SetDirection/SetCleaningLocation/SetComplexActions
 * 支持: 摄像头、云台、扫地机器人等
 */

export const DIRECTION_CAPABILITY = {
  name: 'direction',
  displayName: '可控方向设备',
  duerosNamespace: 'DuerOS.ConnectedHome.Control',
  
  actions: {
    SetDirection: {
      name: 'SetDirection',
      aliases: ['direction', '方向', '转向', '左转', '右转', '上转', '下转', 'setdirection'],
      params: ['direction'],
      description: '设置方向'
    },
    SetCleaningLocation: {
      name: 'SetCleaningLocation', 
      aliases: ['location', '位置', '去', '清扫', 'cleanlocation'],
      params: ['location'],
      description: '设置清扫/移动位置'
    },
    SetComplexActions: {
      name: 'SetComplexActions',
      aliases: ['action', '动作', '执行', 'complexaction'],
      params: ['actionName'],
      description: '执行复杂动作'
    }
  },

  intentKeywords: {
    '左转': 'SetDirection',
    '右转': 'SetDirection', 
    '上转': 'SetDirection',
    '下转': 'SetDirection',
    '转向': 'SetDirection',
    '方向': 'SetDirection',
    '去': 'SetCleaningLocation',
    '位置': 'SetCleaningLocation',
    '清扫': 'SetCleaningLocation'
  },

  paramExtractors: {
    direction: (input) => {
      if (input.includes('左')) return 'LEFT';
      if (input.includes('右')) return 'RIGHT';
      if (input.includes('上')) return 'UP';
      if (input.includes('下')) return 'DOWN';
      if (input.includes('前')) return 'FORWARD';
      if (input.includes('后')) return 'BACKWARD';
      return null;
    },
    location: (input) => {
      const locations = {
        '客厅': 'LIVING_ROOM',
        '主卧': 'MASTER_BEDROOM', 
        '次卧': 'SECOND_BEDROOM',
        '书房': 'STUDY',
        '厨房': 'KITCHEN',
        '卫生间': 'BATHROOM',
        '阳台': 'BALCONY'
      };
      for (const [cn, en] of Object.entries(locations)) {
        if (input.includes(cn)) return en;
      }
      return null;
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
      case 'SetDirection':
        basePayload.direction = { value: params.direction || 'LEFT' };
        break;
      case 'SetCleaningLocation':
        basePayload.cleaningLocation = { value: params.location || 'LIVING_ROOM' };
        break;
      case 'SetComplexActions':
        basePayload.actionName = params.actionName || '';
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

export default DIRECTION_CAPABILITY;
