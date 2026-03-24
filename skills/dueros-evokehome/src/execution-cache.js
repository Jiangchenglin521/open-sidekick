/**
 * 执行缓存管理器 - 缓存成功的指令序列
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CACHE_DIR = path.join(__dirname, '..', '.cache');
const CACHE_FILE = path.join(CACHE_DIR, 'execution-cache.json');

export class ExecutionCache {
  constructor() {
    this.ensureCacheDir();
    this.cache = this.loadCache();
  }

  ensureCacheDir() {
    if (!fs.existsSync(CACHE_DIR)) {
      fs.mkdirSync(CACHE_DIR, { recursive: true });
    }
  }

  loadCache() {
    if (!fs.existsSync(CACHE_FILE)) {
      return {};
    }
    try {
      return JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'));
    } catch {
      return {};
    }
  }

  saveCache() {
    fs.writeFileSync(CACHE_FILE, JSON.stringify(this.cache, null, 2), 'utf-8');
  }

  /**
   * 获取缓存键
   */
  getCacheKey(deviceName, rawInput) {
    return `${deviceName}::${rawInput.toLowerCase().trim()}`;
  }

  /**
   * 检查是否有缓存
   */
  has(deviceName, rawInput) {
    const key = this.getCacheKey(deviceName, rawInput);
    return !!this.cache[key];
  }

  /**
   * 获取缓存
   */
  get(deviceName, rawInput) {
    const key = this.getCacheKey(deviceName, rawInput);
    const cached = this.cache[key];
    if (cached) {
      cached.lastUsed = Date.now();
      this.saveCache();
    }
    return cached;
  }

  /**
   * 保存缓存
   * @param {string} deviceName - 设备名
   * @param {string} rawInput - 原始输入
   * @param {Array} messages - 消息数组
   * @param {Object} finalState - 最终状态
   */
  set(deviceName, rawInput, messages, finalState) {
    const key = this.getCacheKey(deviceName, rawInput);
    
    // 只缓存成功的执行
    this.cache[key] = {
      deviceName,
      rawInput,
      messages,        // 缓存完整消息体
      finalState,      // 预期最终状态
      createdAt: Date.now(),
      lastUsed: Date.now(),
      successCount: 1
    };
    
    this.saveCache();
  }

  /**
   * 更新成功计数
   */
  incrementSuccess(deviceName, rawInput) {
    const key = this.getCacheKey(deviceName, rawInput);
    if (this.cache[key]) {
      this.cache[key].successCount++;
      this.cache[key].lastUsed = Date.now();
      this.saveCache();
    }
  }

  /**
   * 清除过期缓存（超过30天未使用）
   */
  cleanup() {
    const thirtyDays = 30 * 24 * 60 * 60 * 1000;
    const now = Date.now();
    
    for (const [key, value] of Object.entries(this.cache)) {
      if (now - value.lastUsed > thirtyDays) {
        delete this.cache[key];
      }
    }
    
    this.saveCache();
  }

  /**
   * 获取统计信息
   */
  getStats() {
    const entries = Object.values(this.cache);
    return {
      total: entries.length,
      totalSuccess: entries.reduce((sum, e) => sum + e.successCount, 0)
    };
  }
}

export default ExecutionCache;
