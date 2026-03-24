/**
 * 可锁定设备 - SetLockState
 * 支持: 智能门锁、抽屉锁等
 */

export const LOCK_CAPABILITY = {
  name: 'lock',
  displayName: '可锁定设备',
  duerosNamespace: 'DuerOS.ConnectedHome.Control',
  
  actions: {
    SetLockState: {
      name: 'SetLockState',
      aliases: ['lock', 'unlock', '锁定', '解锁', '上锁', '开锁', 'setlockstate'],
      params: ['lockState'],
      description: '设置锁定状态'
    }
  },

  intentKeywords: {
    '锁定': 'SetLockState',
    '解锁': 'SetLockState',
    '上锁': 'SetLockState',
    '开锁': 'SetLockState',
    '反锁': 'SetLockState'
  },

  paramExtractors: {
    lockState: (input) => {
      if (input.includes('解') || input.includes('开')) return 'UNLOCKED';
      if (input.includes('锁') || input.includes('上') || input.includes('反')) return 'LOCKED';
      return 'LOCKED';
    }
  },

  generateMessage: (action, deviceId, params = {}) => {
    return {
      header: {
        namespace: 'DuerOS.ConnectedHome.Control',
        name: 'SetLockStateRequest',
        messageId: generateMessageId(),
        payloadVersion: '1'
      },
      payload: {
        accessToken: params.accessToken || '',
        appliance: {
          applianceId: deviceId,
          additionalApplianceDetails: params.deviceDetails || {}
        },
        lockState: {
          value: params.lockState || 'LOCKED'
        }
      }
    };
  }
};

function generateMessageId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export default LOCK_CAPABILITY;
