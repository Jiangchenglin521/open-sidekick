import fs from 'fs';
import path from 'path';
import os from 'os';

const CONFIG_DIR = path.join(os.homedir(), '.config', 'dueros-evokehome');
const CONFIG_PATH = path.join(CONFIG_DIR, 'config.json');
const DEVICES_PATH = path.join(CONFIG_DIR, 'devices.json');

/**
 * 加载配置
 */
export function loadConfig() {
  try {
    const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
    
    // 尝试加载设备配置
    let devices = {};
    try {
      devices = JSON.parse(fs.readFileSync(DEVICES_PATH, 'utf-8'));
    } catch (e) {
      // 设备文件可能不存在
    }
    
    return {
      ...config,
      devices
    };
  } catch (e) {
    throw new Error('加载配置失败: ' + e.message);
  }
}

/**
 * 保存配置
 */
export function saveConfig(config) {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
}

/**
 * 保存设备配置
 */
export function saveDevices(devices) {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }
  fs.writeFileSync(DEVICES_PATH, JSON.stringify(devices, null, 2));
}
