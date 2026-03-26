/**
 * 配置管理器 - 管理 Token 和全局配置
 * 从统一 .env 文件读取配置
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 统一配置文件路径
const WORKSPACE_ENV = path.join(os.homedir(), '.openclaw', 'workspace', '.env');

const DEFAULT_CONFIG = {
  accessToken: '',
  refreshToken: '',
  expiresAt: null,
  tokenExpiryCheck: true,
  autoRefresh: false,
  defaultDevice: '台灯'
};

/**
 * 从 .env 文件解析配置
 */
function parseEnvFile(filePath) {
  const config = {};
  if (!fs.existsSync(filePath)) {
    return config;
  }
  
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  
  for (const line of lines) {
    const trimmed = line.trim();
    // 跳过注释和空行
    if (!trimmed || trimmed.startsWith('#')) continue;
    
    const eqIndex = trimmed.indexOf('=');
    if (eqIndex > 0) {
      const key = trimmed.substring(0, eqIndex).trim();
      const value = trimmed.substring(eqIndex + 1).trim();
      config[key] = value;
    }
  }
  
  return config;
}

export class ConfigManager {
  static getEnvPath() {
    return WORKSPACE_ENV;
  }

  static load() {
    const envConfig = parseEnvFile(WORKSPACE_ENV);
    
    return {
      accessToken: envConfig.DUEROS_ACCESS_TOKEN || DEFAULT_CONFIG.accessToken,
      refreshToken: envConfig.DUEROS_REFRESH_TOKEN || DEFAULT_CONFIG.refreshToken,
      expiresAt: envConfig.DUEROS_EXPIRES_AT || DEFAULT_CONFIG.expiresAt,
      tokenExpiryCheck: envConfig.DUEROS_TOKEN_EXPIRY_CHECK === 'true' || DEFAULT_CONFIG.tokenExpiryCheck,
      autoRefresh: envConfig.DUEROS_AUTO_REFRESH === 'true' || DEFAULT_CONFIG.autoRefresh,
      defaultDevice: envConfig.DUEROS_DEFAULT_DEVICE || DEFAULT_CONFIG.defaultDevice
    };
  }

  static save(config) {
    // 不再写入 config.json，而是提示用户手动编辑 .env
    throw new Error('请直接编辑 ~/.openclaw/workspace/.env 文件来修改配置');
  }

  static setToken(accessToken, refreshToken = null, expiresIn = 2592000) {
    throw new Error('请直接编辑 ~/.openclaw/workspace/.env 文件，设置 DUEROS_ACCESS_TOKEN=' + accessToken);
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
    throw new Error('请直接编辑 ~/.openclaw/workspace/.env 文件，设置 DUEROS_TOKEN_EXPIRY_CHECK=' + enabled);
  }

  static setAutoRefresh(enabled) {
    throw new Error('请直接编辑 ~/.openclaw/workspace/.env 文件，设置 DUEROS_AUTO_REFRESH=' + enabled);
  }
}

export default ConfigManager;
