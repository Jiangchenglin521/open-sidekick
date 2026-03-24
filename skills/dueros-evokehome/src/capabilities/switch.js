/**
 * 打开关闭设备 - TurnOn/TurnOff/Pause/Continue/StartUp
 * 通用能力，几乎所有设备都支持
 */

export const SWITCH_CAPABILITY = {
  name: 'switch',
  displayName: '打开关闭设备',
  duerosNamespace: 'DuerOS.ConnectedHome.Control',
  
  actions: {
    TurnOn: {
      name: 'TurnOn',
      aliases: ['on', '开', '打开', '开启', 'turnon', '启动', 'start'],
      params: [],
      description: '打开设备'
    },
    TurnOff: {
      name: 'TurnOff',
      aliases: ['off', '关', '关闭', '关掉', 'turnoff', '停止', 'stop'],
      params: [],
      description: '关闭设备'
    },
    Pause: {
      name: 'Pause',
      aliases: ['pause', '暂停', '停止'],
      params: [],
      description: '暂停设备'
    },
    Continue: {
      name: 'Continue', 
      aliases: ['continue', '继续', '恢复'],
      params: [],
      description: '继续执行'
    },
    StartUp: {
      name: 'StartUp',
      aliases: ['startup', '启动'],
      params: [],
      description: '启动设备'
    }
  },

  intentKeywords: {
    '打开': 'TurnOn',
    '开启': 'TurnOn',
    '开': 'TurnOn',
    '启动': 'TurnOn',
    '关闭': 'TurnOff',
    '关掉': 'TurnOff',
    '关': 'TurnOff',
    '暂停': 'Pause',
    '继续': 'Continue'
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

export default SWITCH_CAPABILITY;
