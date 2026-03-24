/**
 * 可控音量设备 - SetVolume/IncrementVolume/DecrementVolume/SetVolumeMute
 * 支持: 电视、音箱等
 */

export const VOLUME_CAPABILITY = {
  name: 'volume',
  displayName: '可控音量设备',
  duerosNamespace: 'DuerOS.ConnectedHome.Control',
  
  actions: {
    SetVolume: {
      name: 'SetVolume',
      aliases: ['volume', '音量', 'setvolume'],
      params: ['volume'],
      description: '设置音量'
    },
    IncrementVolume: {
      name: 'IncrementVolume',
      aliases: ['大声', '响一点', '音量高', 'incrementvolume'],
      params: ['deltaVolume'],
      description: '增大音量'
    },
    DecrementVolume: {
      name: 'DecrementVolume',
      aliases: ['小声', '轻一点', '音量低', 'decrementvolume'],
      params: ['deltaVolume'],
      description: '减小音量'
    },
    SetVolumeMute: {
      name: 'SetVolumeMute',
      aliases: ['mute', '静音', '消音', 'setvolumemute'],
      params: ['mute'],
      description: '静音/取消静音'
    }
  },

  intentKeywords: {
    '音量': 'SetVolume',
    '大声': 'IncrementVolume',
    '响一点': 'IncrementVolume',
    '小声': 'DecrementVolume',
    '轻一点': 'DecrementVolume',
    '静音': 'SetVolumeMute'
  },

  paramExtractors: {
    volume: (input) => {
      const match = input.match(/(\d+)/);
      return match ? parseInt(match[1]) : null;
    },
    deltaVolume: (input) => {
      const match = input.match(/(\d+)/);
      return match ? parseInt(match[1]) : 10;
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
      case 'SetVolume':
        basePayload.volume = { value: params.volume || 50 };
        break;
      case 'IncrementVolume':
      case 'DecrementVolume':
        basePayload.deltaValue = { value: params.deltaVolume || 10 };
        break;
      case 'SetVolumeMute':
        basePayload.mute = { value: params.mute !== false };
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

export default VOLUME_CAPABILITY;
