/**
 * 脚本缓存管理器 - 管理生成的控制脚本
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCRIPTS_DIR = path.join(__dirname, '..', 'scripts');

export class CacheManager {
  constructor() {
    this.ensureScriptsDir();
  }

  ensureScriptsDir() {
    if (!fs.existsSync(SCRIPTS_DIR)) {
      fs.mkdirSync(SCRIPTS_DIR, { recursive: true });
    }
  }

  // 获取缓存脚本路径
  getScriptPath(deviceName, action) {
    const safeName = deviceName.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_');
    const deviceDir = path.join(SCRIPTS_DIR, safeName);
    return path.join(deviceDir, `${action}.js`);
  }

  // 检查缓存是否存在
  hasCache(deviceName, action) {
    const scriptPath = this.getScriptPath(deviceName, action);
    return fs.existsSync(scriptPath);
  }

  // 保存缓存脚本
  saveCache(deviceName, action, scriptContent) {
    const scriptPath = this.getScriptPath(deviceName, action);
    const deviceDir = path.dirname(scriptPath);
    
    if (!fs.existsSync(deviceDir)) {
      fs.mkdirSync(deviceDir, { recursive: true });
    }
    
    const header = `#!/usr/bin/env node
/**
 * DuerOS 控制脚本
 * 设备: ${deviceName}
 * 动作: ${action}
 * 生成时间: ${new Date().toISOString()}
 * 
 * 此脚本由 dueros-evokehome 自动生成，可直接执行
 */

`;
    
    fs.writeFileSync(scriptPath, header + scriptContent, 'utf-8');
    fs.chmodSync(scriptPath, 0o755); // 添加执行权限
    
    return scriptPath;
  }

  // 读取缓存脚本
  readCache(deviceName, action) {
    const scriptPath = this.getScriptPath(deviceName, action);
    if (!fs.existsSync(scriptPath)) {
      return null;
    }
    return fs.readFileSync(scriptPath, 'utf-8');
  }

  // 执行缓存脚本
  async executeCache(deviceName, action, params = []) {
    const scriptPath = this.getScriptPath(deviceName, action);
    
    if (!fs.existsSync(scriptPath)) {
      return { success: false, error: '缓存脚本不存在' };
    }
    
    try {
      // 使用 child_process 执行脚本，确保 process.argv 正确传递
      const { execFile } = await import('child_process');
      const { promisify } = await import('util');
      const execFileAsync = promisify(execFile);
      
      const { stdout, stderr } = await execFileAsync('node', [scriptPath, ...params.map(String)]);
      return { success: true, output: stdout, error: stderr };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // 清除指定设备的缓存
  clearDeviceCache(deviceName) {
    const safeName = deviceName.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_');
    const deviceDir = path.join(SCRIPTS_DIR, safeName);
    
    if (fs.existsSync(deviceDir)) {
      fs.rmSync(deviceDir, { recursive: true });
      return true;
    }
    return false;
  }

  // 清除所有缓存
  clearAllCache() {
    if (fs.existsSync(SCRIPTS_DIR)) {
      const items = fs.readdirSync(SCRIPTS_DIR);
      for (const item of items) {
        const itemPath = path.join(SCRIPTS_DIR, item);
        const stat = fs.statSync(itemPath);
        if (stat.isDirectory()) {
          fs.rmSync(itemPath, { recursive: true });
        }
      }
      return true;
    }
    return false;
  }

  // 列出所有缓存
  listCache() {
    const result = [];
    if (!fs.existsSync(SCRIPTS_DIR)) return result;
    
    const devices = fs.readdirSync(SCRIPTS_DIR);
    for (const device of devices) {
      const deviceDir = path.join(SCRIPTS_DIR, device);
      const stat = fs.statSync(deviceDir);
      if (stat.isDirectory()) {
        const scripts = fs.readdirSync(deviceDir)
          .filter(f => f.endsWith('.js'))
          .map(f => ({
            action: f.replace('.js', ''),
            path: path.join(deviceDir, f),
            mtime: fs.statSync(path.join(deviceDir, f)).mtime
          }));
        result.push({ device, scripts });
      }
    }
    return result;
  }

  // 获取缓存统计
  getStats() {
    const cache = this.listCache();
    const totalScripts = cache.reduce((sum, d) => sum + d.scripts.length, 0);
    return {
      deviceCount: cache.length,
      scriptCount: totalScripts,
      devices: cache.map(d => d.device)
    };
  }
}

export default CacheManager;
