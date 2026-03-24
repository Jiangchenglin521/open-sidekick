/**
 * 打印设备 - SubmitPrint
 * 支持: 智能打印机
 */

export const PRINT_CAPABILITY = {
  name: 'print',
  displayName: '打印设备',
  duerosNamespace: 'DuerOS.ConnectedHome.Control',
  
  actions: {
    SubmitPrint: {
      name: 'SubmitPrint',
      aliases: ['print', '打印', 'submitprint'],
      params: ['printAction'],
      description: '提交打印任务'
    }
  },

  intentKeywords: {
    '打印': 'SubmitPrint',
    '开始打印': 'SubmitPrint'
  },

  paramExtractors: {
    printAction: (input) => {
      return 'START_PRINT';
    }
  },

  generateMessage: (action, deviceId, params = {}) => {
    return {
      header: {
        namespace: 'DuerOS.ConnectedHome.Control',
        name: 'SubmitPrintRequest',
        messageId: generateMessageId(),
        payloadVersion: '1'
      },
      payload: {
        accessToken: params.accessToken || '',
        appliance: {
          applianceId: deviceId,
          additionalApplianceDetails: params.deviceDetails || {}
        },
        printAction: {
          value: params.printAction || 'START_PRINT'
        }
      }
    };
  }
};

function generateMessageId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export default PRINT_CAPABILITY;
