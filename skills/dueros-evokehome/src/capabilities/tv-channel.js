/**
 * 电视频道设置 - SetTVChannel/IncrementTVChannel/DecrementTVChannel/ReturnTVChannel
 * 支持: 电视、机顶盒等
 */

export const TV_CHANNEL_CAPABILITY = {
  name: 'tvChannel',
  displayName: '电视频道设置',
  duerosNamespace: 'DuerOS.ConnectedHome.Control',
  
  actions: {
    SetTVChannel: {
      name: 'SetTVChannel',
      aliases: ['channel', '频道', '台', 'settvchannel'],
      params: ['channel'],
      description: '设置频道'
    },
    IncrementTVChannel: {
      name: 'IncrementTVChannel',
      aliases: ['下一台', '下一个频道', '频道+', 'incrementchannel'],
      params: [],
      description: '下一频道'
    },
    DecrementTVChannel: {
      name: 'DecrementTVChannel',
      aliases: ['上一台', '上一个频道', '频道-', 'decrementchannel'],
      params: [],
      description: '上一频道'
    },
    ReturnTVChannel: {
      name: 'ReturnTVChannel',
      aliases: ['返回', '回看', 'returntvchannel'],
      params: [],
      description: '返回上一频道'
    }
  },

  intentKeywords: {
    '频道': 'SetTVChannel',
    '台': 'SetTVChannel',
    '下一台': 'IncrementTVChannel',
    '下一个': 'IncrementTVChannel',
    '上一台': 'DecrementTVChannel',
    '上一个': 'DecrementTVChannel',
    '返回': 'ReturnTVChannel',
    '回看': 'ReturnTVChannel'
  },

  paramExtractors: {
    channel: (input) => {
      const match = input.match(/(\d+)/);
      return match ? parseInt(match[1]) : null;
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

    if (action === 'SetTVChannel') {
      basePayload.tvChannel = { value: params.channel || 1 };
    } else if (action === 'IncrementTVChannel' || action === 'DecrementTVChannel') {
      basePayload.deltaValue = { value: 1 };
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

export default TV_CHANNEL_CAPABILITY;
