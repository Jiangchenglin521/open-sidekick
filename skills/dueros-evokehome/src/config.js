/**
 * 配置管理器
 * 处理 Token 存储和续期提醒
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

const CONFIG_DIR = join(homedir(), '.config', 'dueros-evokehome');
const CONFIG_FILE = join(CONFIG_DIR, 'config.json');
const DEFAULT_CONFIG = {
  accessToken: '',
  refreshToken: '',
  expiresAt: null,
  tokenExpiryCheck: false,  // 默认关闭续期提醒
  autoRefresh: false,       // 默认关闭自动续期
  defaultDevice: '台灯'
};

export class ConfigManager {
  /**
   * 确保配置目录存在
   */
  static ensureConfigDir() {
    if (!existsSync(CONFIG_DIR)) {
      mkdirSync(CONFIG_DIR, { recursive: true });
    }
  }
  
  /**
   * 加载配置
   */
  static load() {
    this.ensureConfigDir();
    
    try {
      const content = readFileSync(CONFIG_FILE, 'utf-8');
      const saved = JSON.parse(content);
      return { ...DEFAULT_CONFIG, ...saved };
    } catch {
      return { ...DEFAULT_CONFIG };
    }
  }
  
  /**
   * 保存配置
   */
  static save(config) {
    this.ensureConfigDir();
    writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
  }
  
  /**
   * 设置 Token
   */
  static setToken(accessToken, refreshToken = null, expiresIn = 2592000) {
    const config = this.load();
    config.accessToken = accessToken;
    config.refreshToken = refreshToken;
    config.expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();
    this.save(config);
    return config;
  }
  
  /**
   * 启用/禁用 Token 过期提醒
   */
  static setExpiryCheck(enabled) {
    const config = this.load();
    config.tokenExpiryCheck = enabled;
    this.save(config);
    return config.tokenExpiryCheck;
  }
  
  /**
   * 启用/禁用自动续期
   */
  static setAutoRefresh(enabled) {
    const config = this.load();
    config.autoRefresh = enabled;
    this.save(config);
    return config.autoRefresh;
  }
  
  /**
   * 获取 Token 状态信息
   */
  static getTokenStatus() {
    const config = this.load();
    
    if (!config.accessToken) {
      return { status: 'missing', message: '未配置 Token' };
    }
    
    if (!config.expiresAt) {
      return { status: 'unknown', message: 'Token 过期时间未知' };
    }
    
    const expiry = new Date(config.expiresAt).getTime();
    const now = Date.now();
    const daysLeft = Math.floor((expiry - now) / (1000 * 60 * 60 * 24));
    
    if (daysLeft < 0) {
      return { 
        status: 'expired', 
        message: 'Token 已过期',
        daysLeft: 0
      };
    }
    
    if (daysLeft < 3) {
      return {
        status: 'expiring_soon',
        message: `Token 即将过期，剩余 ${daysLeft} 天`,
        daysLeft
      };
    }
    
    return {
      status: 'valid',
      message: `Token 有效，剩余 ${daysLeft} 天`,
      daysLeft
    };
  }
  
  /**
   * 获取配置路径
   */
  static getConfigPath() {
    return CONFIG_FILE;
  }
}
