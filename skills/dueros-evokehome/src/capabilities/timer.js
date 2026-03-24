/**
 * 可控定时设备 - SetTimer/TimingCancel
 * 支持: 几乎所有设备的定时功能
 */

export const TIMER_CAPABILITY = {
  name: 'timer',
  displayName: '可控定时设备',
  duerosNamespace: 'DuerOS.ConnectedHome.Control',
  
  actions: {
    SetTimer: {
      name: 'SetTimer',
      aliases: ['timer', '定时', '倒计时', 'settimer'],
      params: ['timer'],
      description: '设置定时'
    },
    TimingCancel: {
      name: 'TimingCancel',
      aliases: ['cancel', '取消定时', '清除定时', 'timingcancel'],
      params: [],
      description: '取消定时'
    }
  },

  intentKeywords: {
    '定时': 'SetTimer',
    '倒计时': 'SetTimer',
    '取消定时': 'TimingCancel',
    '清除定时': 'TimingCancel'
  },

  paramExtractors: {
    timer: (input) => {
      // 提取分钟数
      const match = input.match(/(\d+)\s*分钟?/);
      if (match) return parseInt(match[1]) * 60;
      // 提取小时
      const hourMatch = input.match(/(\d+)\s*小时?/);
      if (hourMatch) return parseInt(hourMatch[1]) * 3600;
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

    if (action === 'SetTimer') {
      // 官方文档要求 timestamp.value 为秒级时间戳
      const seconds = params.timer || 300;
      const timestampSeconds = Math.floor(Date.now() / 1000) + seconds;
      basePayload.timestamp = { value: timestampSeconds };
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

export default TIMER_CAPABILITY;
