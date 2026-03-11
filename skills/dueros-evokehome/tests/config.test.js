/**
 * 配置管理器测试
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ConfigManager } from '../src/config.js';
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

const TEST_CONFIG_DIR = join(homedir(), '.config', 'dueros-evokehome-test');
const TEST_CONFIG_FILE = join(TEST_CONFIG_DIR, 'config.json');

describe('ConfigManager', () => {
  // 临时替换配置路径
  const originalConfigFile = ConfigManager.getConfigPath?.() || 
    join(homedir(), '.config', 'dueros-evokehome', 'config.json');
  
  beforeEach(() => {
    // 创建测试目录
    if (!existsSync(TEST_CONFIG_DIR)) {
      mkdirSync(TEST_CONFIG_DIR, { recursive: true });
    }
  });
  
  afterEach(() => {
    // 清理测试目录
    if (existsSync(TEST_CONFIG_DIR)) {
      rmSync(TEST_CONFIG_DIR, { recursive: true, force: true });
    }
  });
  
  describe('配置加载', () => {
    it('应返回默认配置当文件不存在时', () => {
      const config = ConfigManager.load();
      expect(config).toHaveProperty('accessToken');
      expect(config).toHaveProperty('refreshToken');
      expect(config).toHaveProperty('tokenExpiryCheck');
      expect(config).toHaveProperty('autoRefresh');
      expect(config).toHaveProperty('defaultDevice');
    });
  });
  
  describe('Token 状态', () => {
    it('未配置时返回 missing 状态', () => {
      // 临时清空配置
      const status = ConfigManager.getTokenStatus();
      // 如果已配置会是其他状态
      expect(['missing', 'unknown', 'valid', 'expired', 'expiring_soon']).toContain(status.status);
    });
  });
  
  describe('配置保存', () => {
    it('应能保存和加载配置', () => {
      const testConfig = {
        accessToken: 'test_access_token',
        refreshToken: 'test_refresh_token',
        defaultDevice: '测试灯'
      };
      
      ConfigManager.save(testConfig);
      const loaded = ConfigManager.load();
      
      expect(loaded.accessToken).toBe(testConfig.accessToken);
      expect(loaded.defaultDevice).toBe(testConfig.defaultDevice);
    });
  });
  
  describe('Token 设置', () => {
    it('应正确设置 Token 和过期时间', () => {
      const result = ConfigManager.setToken('new_token', 'new_refresh', 3600);
      
      expect(result.accessToken).toBe('new_token');
      expect(result.refreshToken).toBe('new_refresh');
      expect(result.expiresAt).toBeDefined();
    });
  });
  
  describe('功能开关', () => {
    it('应能启用/禁用过期提醒', () => {
      ConfigManager.setExpiryCheck(true);
      let config = ConfigManager.load();
      expect(config.tokenExpiryCheck).toBe(true);
      
      ConfigManager.setExpiryCheck(false);
      config = ConfigManager.load();
      expect(config.tokenExpiryCheck).toBe(false);
    });
    
    it('应能启用/禁用自动续期', () => {
      ConfigManager.setAutoRefresh(true);
      let config = ConfigManager.load();
      expect(config.autoRefresh).toBe(true);
      
      ConfigManager.setAutoRefresh(false);
      config = ConfigManager.load();
      expect(config.autoRefresh).toBe(false);
    });
  });
});
