/**
 * 设备注册表 - 管理所有设备配置和类型映射
 */

import fs from 'fs';
import path from 'path';
import os from 'os';

const CONFIG_DIR = path.join(os.homedir(), '.config', 'dueros-evokehome');
const DEVICES_FILE = path.join(CONFIG_DIR, 'devices.json');

// 设备类型映射表
export const DEVICE_TYPES = {
  LIGHT: {
    name: '灯光',
    actions: ['turnOn', 'turnOff', 'setBrightness', 'setColorTemp', 'setMode', 'incrementBrightness', 'decrementBrightness', 'incrementColorTemp', 'decrementColorTemp'],
    template: 'light'
  },
  DESK_LAMP: {
    name: '台灯',
    actions: ['turnOn', 'turnOff', 'setBrightness', 'setColorTemp', 'setMode', 'incrementBrightness', 'decrementBrightness', 'incrementColorTemp', 'decrementColorTemp'],
    template: 'light'
  },
  AC: {
    name: '空调',
    actions: ['turnOn', 'turnOff', 'setTemperature', 'incrementTemp', 'decrementTemp', 'setMode', 'setFanSpeed'],
    template: 'ac'
  },
  AIR_CONDITION: {
    name: '空调',
    actions: ['turnOn', 'turnOff', 'setTemperature', 'incrementTemp', 'decrementTemp', 'setMode', 'setFanSpeed'],
    template: 'ac'
  },
  CURTAIN: {
    name: '窗帘',
    actions: ['open', 'close', 'setPosition', 'stop'],
    template: 'curtain'
  },
  TV: {
    name: '电视',
    actions: ['turnOn', 'turnOff', 'setChannel', 'incrementChannel', 'decrementChannel', 'setVolume', 'incrementVolume', 'decrementVolume', 'mute', 'unmute'],
    template: 'tv'
  },
  FAN: {
    name: '风扇',
    actions: ['turnOn', 'turnOff', 'setSpeed', 'incrementSpeed', 'decrementSpeed', 'swing'],
    template: 'fan'
  },
  ROBOT: {
    name: '扫地机器人',
    actions: ['start', 'stop', 'pause', 'charge', 'setSuction', 'setWaterLevel', 'cleanLocation'],
    template: 'robot'
  },
  SWEEPING_ROBOT: {
    name: '扫地机器人',
    actions: ['start', 'stop', 'pause', 'charge', 'setSuction', 'setWaterLevel', 'cleanLocation'],
    template: 'robot'
  },
  SENSOR: {
    name: '传感器',
    actions: ['getStatus', 'getTemperature', 'getHumidity', 'getPM25', 'getAirQuality'],
    template: 'sensor'
  },
  AIR_PURIFIER: {
    name: '空气净化器',
    actions: ['turnOn', 'turnOff', 'setSpeed', 'setMode', 'getStatus'],
    template: 'fan'
  },
  LOCK: {
    name: '门锁',
    actions: ['turnOn', 'turnOff', 'getStatus'],
    template: 'base'
  }
};

// 动作别名映射
export const ACTION_ALIASES = {
  // 开关
  'on': 'turnOn',
  '开': 'turnOn',
  '打开': 'turnOn',
  '开启': 'turnOn',
  'off': 'turnOff',
  '关': 'turnOff',
  '关闭': 'turnOff',
  '关掉': 'turnOff',
  
  // 亮度
  'brightness': 'setBrightness',
  '亮度': 'setBrightness',
  'b': 'setBrightness',
  '亮': 'incrementBrightness',
  '暗': 'decrementBrightness',
  '亮一点': 'incrementBrightness',
  '暗一点': 'decrementBrightness',
  
  // 色温
  'temp': 'setColorTemp',
  '色温': 'setColorTemp',
  'temperature': 'setColorTemp',
  'setcolortemp': 'setColorTemp',
  
  // 色温增减 (增加=更冷=更高Kelvin, 降低=更暖=更低Kelvin)
  'warm': 'decrementColorTemp',
  '暖光': 'decrementColorTemp',
  '变暖': 'decrementColorTemp',
  '更暖': 'decrementColorTemp',
  'cool': 'incrementColorTemp',
  '冷光': 'incrementColorTemp',
  '变冷': 'incrementColorTemp',
  '更冷': 'incrementColorTemp',
  'incrementcolortemp': 'incrementColorTemp',
  'decrementcolortemp': 'decrementColorTemp',
  
  // 模式
  'mode': 'setMode',
  '模式': 'setMode',
  'night': 'setMode',
  '夜间': 'setMode',
  'reading': 'setMode',
  '阅读': 'setMode',
  
  // 温度
  'temperature': 'setTemperature',
  '温度': 'setTemperature',
  '升温': 'incrementTemp',
  '降温': 'decrementTemp',
  
  // 窗帘
  'open': 'open',
  '打开': 'open',
  'close': 'close',
  '关闭': 'close',
  'position': 'setPosition',
  '位置': 'setPosition',
  
  // 频道
  'channel': 'setChannel',
  '频道': 'setChannel',
  '台': 'setChannel',
  'next': 'incrementChannel',
  '下一台': 'incrementChannel',
  'prev': 'decrementChannel',
  '上一台': 'decrementChannel',
  
  // 音量
  'volume': 'setVolume',
  '音量': 'setVolume',
  '大声': 'incrementVolume',
  '小声': 'decrementVolume',
  'mute': 'mute',
  '静音': 'mute',
  
  // 扫地机器人
  'start': 'start',
  '清扫': 'start',
  '打扫': 'start',
  'pause': 'pause',
  '暂停': 'pause',
  'charge': 'charge',
  '充电': 'charge',
  '回充': 'charge',
  'setsuction': 'setSuction',
  '吸力': 'setSuction',
  'setwaterlevel': 'setWaterLevel',
  '水量': 'setWaterLevel',
  'cleanlocation': 'cleanLocation',
  '去': 'cleanLocation',
  
  // 风扇
  'setspeed': 'setSpeed',
  '风速': 'setSpeed',
  'swing': 'swing',
  '摆风': 'swing',
  
  // 传感器
  'getstatus': 'getStatus',
  'status': 'getStatus',
  '状态': 'getStatus',
  'gettemperature': 'getTemperature',
  'gethumidity': 'getHumidity',
  'getpm25': 'getPM25',
  'pm25': 'getPM25',
  'getairquality': 'getAirQuality',
  '空气质量': 'getAirQuality'
};

export class DeviceRegistry {
  constructor() {
    this.ensureConfigDir();
    this.devices = this.loadDevices();
  }

  ensureConfigDir() {
    if (!fs.existsSync(CONFIG_DIR)) {
      fs.mkdirSync(CONFIG_DIR, { recursive: true });
    }
  }

  loadDevices() {
    if (!fs.existsSync(DEVICES_FILE)) {
      // 默认设备配置
      const defaultDevices = {
        '台灯': {
          id: 'cce0daa95ce5',
          type: 'DESK_LAMP',
          room: '卧室',
          brand: '小度'
        },
        '灯': {
          id: 'cce0daa95ce5',
          type: 'LIGHT',
          room: '卧室'
        }
      };
      this.saveDevices(defaultDevices);
      return defaultDevices;
    }
    return JSON.parse(fs.readFileSync(DEVICES_FILE, 'utf-8'));
  }

  saveDevices(devices) {
    this.ensureConfigDir();
    fs.writeFileSync(DEVICES_FILE, JSON.stringify(devices, null, 2), 'utf-8');
  }

  // 查找设备（支持别名、模糊匹配）
  findDevice(nameOrAlias) {
    const normalized = nameOrAlias.toLowerCase().trim();
    
    // 精确匹配
    if (this.devices[normalized]) {
      return { name: normalized, ...this.devices[normalized] };
    }
    
    // 遍历查找
    for (const [name, device] of Object.entries(this.devices)) {
      if (name.toLowerCase() === normalized || 
          device.id?.toLowerCase() === normalized) {
        return { name, ...device };
      }
    }
    
    return null;
  }

  // 添加新设备
  addDevice(name, config) {
    this.devices[name] = config;
    this.saveDevices(this.devices);
  }

  // 删除设备
  removeDevice(name) {
    delete this.devices[name];
    this.saveDevices(this.devices);
  }

  // 列出所有设备
  listDevices() {
    return Object.entries(this.devices).map(([name, device]) => ({
      name,
      ...device
    }));
  }

  // 获取设备类型配置
  getDeviceTypeConfig(type) {
    return DEVICE_TYPES[type] || null;
  }

  // 解析动作
  parseAction(actionOrAlias) {
    const normalized = actionOrAlias.toLowerCase().trim();
    return ACTION_ALIASES[normalized] || normalized;
  }

  // 检查设备是否支持某动作
  supportsAction(deviceType, action) {
    const typeConfig = this.getDeviceTypeConfig(deviceType);
    if (!typeConfig) return false;
    return typeConfig.actions.includes(action);
  }

  // 获取设备对应的模板名称
  getTemplateName(deviceType) {
    const typeConfig = this.getDeviceTypeConfig(deviceType);
    return typeConfig?.template || 'base';
  }
}

export default DeviceRegistry;
