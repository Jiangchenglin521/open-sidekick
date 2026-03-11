/**
 * 配置管理器 - 管理 Token 和全局配置
 */

import fs from 'fs';
import path from 'path';
import os from 'os';

const CONFIG_DIR = path.join(os.homedir(), '.config', 'dueros-evokehome');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

const DEFAULT_CONFIG = {
  accessToken: '',
  refreshToken: '',
  expiresAt: null,
  tokenExpiryCheck: true,
  autoRefresh: false,
  defaultDevice: '台灯'
};

export class ConfigManager {
  static getConfigPath() {
    return CONFIG_FILE;
  }

  static ensureConfigDir() {
    if (!fs.existsSync(CONFIG_DIR)) {
      fs.mkdirSync(CONFIG_DIR, { recursive: true });
    }
  }

  static load() {
    this.ensureConfigDir();
    if (!fs.existsSync(CONFIG_FILE)) {
      this.save(DEFAULT_CONFIG);
      return { ...DEFAULT_CONFIG };
    }
    return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
  }

  static save(config) {
    this.ensureConfigDir();
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8');
  }

  static setToken(accessToken, refreshToken = null, expiresIn = 2592000) {
    const config = this.load();
    config.accessToken = accessToken;
    config.refreshToken = refreshToken;
    config.expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();
    this.save(config);
    return config;
  }

  static getTokenStatus() {
    const config = this.load();
    
    if (!config.accessToken) {
      return { status: 'missing', message: '未配置 Token' };
    }
    
    if (!config.expiresAt) {
      return { status: 'unknown', message: '过期时间未知' };
    }
    
    const expiresAt = new Date(config.expiresAt);
    const now = new Date();
    const daysLeft = Math.ceil((expiresAt - now) / (1000 * 60 * 60 * 24));
    
    if (daysLeft < 0) {
      return { status: 'expired', message: 'Token 已过期', daysLeft };
    }
    if (daysLeft <= 7) {
      return { status: 'expiring_soon', message: 'Token 即将过期', daysLeft };
    }
    return { status: 'valid', message: 'Token 有效', daysLeft };
  }

  static isExpired() {
    const status = this.getTokenStatus();
    return status.status === 'expired';
  }

  static setExpiryCheck(enabled) {
    const config = this.load();
    config.tokenExpiryCheck = enabled;
    this.save(config);
  }

  static setAutoRefresh(enabled) {
    const config = this.load();
    config.autoRefresh = enabled;
    this.save(config);
  }
}

export default ConfigManager;
