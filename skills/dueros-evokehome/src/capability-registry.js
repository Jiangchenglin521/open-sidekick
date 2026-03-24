/**
 * 设备注册中心 - 简化版（无能力校验）
 * 只负责设备查找，不校验能力
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONFIG_DIR = path.join(__dirname, '..', 'config');
const DEVICES_FILE = path.join(CONFIG_DIR, 'devices.json');

export class CapabilityRegistry {
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
      return {};
    }
    return JSON.parse(fs.readFileSync(DEVICES_FILE, 'utf-8'));
  }

  saveDevices(devices) {
    this.ensureConfigDir();
    fs.writeFileSync(DEVICES_FILE, JSON.stringify(devices, null, 2), 'utf-8');
    this.devices = devices;
  }

  /**
   * 查找设备（核心功能）
   * @param {string} nameOrAlias - 设备名称或别名
   * @returns {Object|null} 设备信息
   */
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

  /**
   * 添加新设备
   */
  addDevice(name, config) {
    this.devices[name] = config;
    this.saveDevices(this.devices);
  }

  /**
   * 删除设备
   */
  removeDevice(name) {
    delete this.devices[name];
    this.saveDevices(this.devices);
  }

  /**
   * 列出所有设备
   */
  listDevices() {
    return Object.entries(this.devices).map(([name, device]) => ({
      name,
      ...device
    }));
  }
}

export default CapabilityRegistry;
