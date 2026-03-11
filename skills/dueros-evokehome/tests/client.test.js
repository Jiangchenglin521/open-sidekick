/**
 * DuerOS API 客户端测试
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { DuerOSClient } from '../src/client.js';

describe('DuerOSClient', () => {
  let client;
  
  beforeEach(() => {
    client = new DuerOSClient({
      accessToken: 'test_token',
      refreshToken: 'refresh_token',
      expiresAt: new Date(Date.now() + 86400000).toISOString()
    });
  });
  
  describe('构造函数', () => {
    it('应该正确初始化配置', () => {
      expect(client.accessToken).toBe('test_token');
      expect(client.refreshToken).toBe('refresh_token');
      expect(client.expiresAt).toBeDefined();
    });
  });
  
  describe('Token 过期检查', () => {
    it('未过期时返回 false', () => {
      expect(client.isTokenExpired()).toBe(false);
    });
    
    it('过期时返回 true', () => {
      client.expiresAt = new Date(Date.now() - 1000).toISOString();
      expect(client.isTokenExpired()).toBe(true);
    });
    
    it('无过期时间时返回 false', () => {
      client.expiresAt = null;
      expect(client.isTokenExpired()).toBe(false);
    });
  });
  
  describe('获取剩余天数', () => {
    it('应返回正数天数', () => {
      const days = client.getTokenRemainingDays();
      expect(days).toBeGreaterThan(0);
      expect(days).toBeLessThanOrEqual(30);
    });
    
    it('过期后返回负数', () => {
      client.expiresAt = new Date(Date.now() - 86400000).toISOString();
      const days = client.getTokenRemainingDays();
      expect(days).toBeLessThan(0);
    });
    
    it('无过期时间时返回 null', () => {
      client.expiresAt = null;
      expect(client.getTokenRemainingDays()).toBeNull();
    });
  });
});
