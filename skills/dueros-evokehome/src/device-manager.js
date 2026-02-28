/**
 * 设备管理器
 * 管理设备映射和控制逻辑
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

const CONFIG_DIR = join(homedir(), '.config', 'dueros-evokehome');
const DEVICES_FILE = join(CONFIG_DIR, 'devices.json');

export class DeviceManager {
  constructor(client) {
    this.client = client;
    this.devices = this.loadDeviceMap();
  }
  
  /**
   * 加载设备映射
   */
  loadDeviceMap() {
    try {
      const content = readFileSync(DEVICES_FILE, 'utf-8');
      return JSON.parse(content);
    } catch {
      // 默认设备映射
      return {
        '台灯': { id: 'cce0daa95ce5', type: 'LIGHT', room: '卧室' },
        '灯': { id: 'cce0daa95ce5', type: 'LIGHT', room: '卧室' }
      };
    }
  }
  
  /**
   * 获取设备 ID
   */
  getDeviceId(name) {
    const device = this.devices[name];
    return device ? device.id : null;
  }
  
  /**
   * 打开设备
   */
  async turnOn(deviceName) {
    const deviceId = this.getDeviceId(deviceName) || deviceName;
    await this.client.sendControl(deviceId, 'TurnOnRequest');
    return `✅ 已打开${deviceName}`;
  }
  
  /**
   * 关闭设备
   */
  async turnOff(deviceName) {
    const deviceId = this.getDeviceId(deviceName) || deviceName;
    await this.client.sendControl(deviceId, 'TurnOffRequest');
    return `✅ 已关闭${deviceName}`;
  }
  
  /**
   * 设置亮度
   */
  async setBrightness(deviceName, brightness) {
    const deviceId = this.getDeviceId(deviceName) || deviceName;
    await this.client.sendControl(deviceId, 'SetBrightnessPercentageRequest', {
      brightness: Math.min(100, Math.max(0, brightness))
    });
    return `✅ 已将${deviceName}亮度调至${brightness}%`;
  }
  
  /**
   * 获取设备状态
   */
  async getStatus(deviceName) {
    const devices = await this.client.getDeviceList();
    
    if (deviceName === 'all') {
      return this.formatAllDevicesStatus(devices);
    }
    
    const deviceId = this.getDeviceId(deviceName) || deviceName;
    const device = devices.find(d => d.applianceId === deviceId);
    
    if (!device) {
      return `❌ 找不到设备: ${deviceName}`;
    }
    
    return this.formatDeviceStatus(device);
  }
  
  /**
   * 列出所有设备
   */
  async listDevices() {
    const devices = await this.client.getDeviceList();
    
    if (devices.length === 0) {
      return '📭 暂无设备';
    }
    
    let result = '📱 已发现设备:\n';
    devices.forEach((dev, idx) => {
      const name = dev.friendlyName || '未知设备';
      const id = dev.applianceId?.slice(0, 8) + '...' || 'N/A';
      const types = dev.applianceTypes?.join(', ') || '未知类型';
      result += `${idx + 1}. ${name} (${id}) - ${types}\n`;
    });
    
    return result;
  }
  
  /**
   * 格式化单个设备状态
   */
  formatDeviceStatus(device) {
    const name = device.friendlyName || '未知设备';
    const attrs = device.attributes || {};
    
    const isOnline = attrs.connectivity?.value === 'REACHABLE';
    const isOn = ['ON', 'on'].includes(attrs.turnOnState?.value);
    const brightness = attrs.brightness?.value;
    
    const statusIcon = isOnline ? '🟢' : '🔴';
    const powerIcon = isOn ? '💡' : '⚫';
    
    let result = `${statusIcon} ${powerIcon} ${name}: `;
    result += isOnline ? '在线' : '离线';
    result += ` | ${isOn ? '开启' : '关闭'}`;
    
    if (isOn && brightness) {
      result += ` | 亮度${brightness}%`;
    }
    
    return result;
  }
  
  /**
   * 格式化所有设备状态
   */
  formatAllDevicesStatus(devices) {
    if (devices.length === 0) {
      return '📭 暂无设备';
    }
    
    const onlineCount = devices.filter(d => 
      d.attributes?.connectivity?.value === 'REACHABLE'
    ).length;
    
    let result = `📱 设备状态 (在线: ${onlineCount}/${devices.length}):\n`;
    devices.forEach(dev => {
      result += this.formatDeviceStatus(dev) + '\n';
    });
    
    return result;
  }
}
