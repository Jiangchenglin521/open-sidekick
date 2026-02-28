import { DuerOSClient } from './client.js';
import { DeviceManager } from './device-manager.js';
import { ConfigManager } from './config.js';

/**
 * DuerOS EvokeHome Skill
 * 控制 DuerOS 智能家居设备
 */

let client = null;
let deviceManager = null;

/**
 * 初始化 Skill
 */
export async function init(context) {
  const config = await ConfigManager.load();
  
  if (!config.accessToken) {
    return {
      status: 'error',
      message: '未配置 DuerOS Access Token，请运行: evokehome setup'
    };
  }
  
  client = new DuerOSClient(config);
  deviceManager = new DeviceManager(client);
  
  // 检查 Token 过期
  if (config.tokenExpiryCheck) {
    await checkTokenExpiry(config);
  }
  
  return {
    status: 'ready',
    message: 'DuerOS EvokeHome 已就绪'
  };
}

/**
 * 处理控制指令
 */
export async function handle(message, context) {
  if (!client) {
    return '请先初始化 EvokeHome: evokehome setup';
  }
  
  const command = parseCommand(message);
  
  try {
    switch (command.action) {
      case 'turn_on':
        return await deviceManager.turnOn(command.device);
        
      case 'turn_off':
        return await deviceManager.turnOff(command.device);
        
      case 'set_brightness':
        return await deviceManager.setBrightness(
          command.device, 
          command.params.brightness
        );
        
      case 'status':
        return await deviceManager.getStatus(command.device);
        
      case 'list':
        return await deviceManager.listDevices();
        
      default:
        return getHelpMessage();
    }
  } catch (error) {
    console.error('EvokeHome 错误:', error);
    return `操作失败: ${error.message}`;
  }
}

/**
 * 解析自然语言指令
 */
function parseCommand(message) {
  const lower = message.toLowerCase();
  
  // 查询列表
  if (/(列表|所有设备|有什么设备)/.test(lower)) {
    return { action: 'list' };
  }
  
  // 查询状态
  if (/(状态|怎么样|亮了没|开了吗)/.test(lower)) {
    const device = extractDevice(lower) || 'all';
    return { action: 'status', device };
  }
  
  // 打开
  if (/(打开|开启|开灯)/.test(lower)) {
    const device = extractDevice(lower) || 'default';
    return { action: 'turn_on', device };
  }
  
  // 关闭
  if (/(关闭|关掉|关灯)/.test(lower)) {
    const device = extractDevice(lower) || 'default';
    return { action: 'turn_off', device };
  }
  
  // 调节亮度
  const brightnessMatch = lower.match(/(\d+)/);
  if (brightnessMatch && /(亮度|调亮|调暗|调到)/.test(lower)) {
    const device = extractDevice(lower) || 'default';
    return {
      action: 'set_brightness',
      device,
      params: { brightness: parseInt(brightnessMatch[1]) }
    };
  }
  
  return { action: 'unknown' };
}

/**
 * 提取设备名称
 */
function extractDevice(message) {
  const devices = ['台灯', '灯', '电视', '空调', '窗帘'];
  for (const device of devices) {
    if (message.includes(device)) {
      return device;
    }
  }
  return null;
}

/**
 * 检查 Token 过期
 */
async function checkTokenExpiry(config) {
  if (!config.expiresAt) return;
  
  const now = Date.now();
  const expiry = new Date(config.expiresAt).getTime();
  const daysUntilExpiry = Math.floor((expiry - now) / (1000 * 60 * 60 * 24));
  
  if (daysUntilExpiry < 3 && daysUntilExpiry > 0) {
    console.warn(`⚠️ DuerOS Token 将在 ${daysUntilExpiry} 天后过期，建议续期`);
    // 这里可以发送通知给主人
  } else if (daysUntilExpiry <= 0) {
    console.error('❌ DuerOS Token 已过期，请运行: evokehome refresh');
  }
}

/**
 * 帮助信息
 */
function getHelpMessage() {
  return `🏠 DuerOS EvokeHome 帮助

使用方法:
• "打开台灯" - 开灯
• "关闭台灯" - 关灯  
• "把台灯调到50%" - 调亮度
• "台灯状态" - 查看状态
• "列出所有设备" - 查看设备列表

设置:
• evokehome setup - 配置 Token
• evokehome refresh - 刷新 Token
• evokehome devices - 管理设备映射`;
}

export { DuerOSClient, DeviceManager, ConfigManager };
