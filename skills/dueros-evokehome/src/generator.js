/**
 * 脚本生成器 - 根据设备和动作生成控制脚本
 */

import { DeviceRegistry } from './registry.js';
import { ConfigManager } from './config.js';
import { CacheManager } from './cache-manager.js';
import { LightTemplates } from './templates/light.js';
import { ACTemplates } from './templates/ac.js';
import { CurtainTemplates } from './templates/curtain.js';
import { TVTemplates } from './templates/tv.js';
import { FanTemplates } from './templates/fan.js';
import { RobotTemplates } from './templates/robot.js';
import { SensorTemplates } from './templates/sensor.js';

// 模板注册表
const TEMPLATES = {
  light: LightTemplates,
  ac: ACTemplates,
  curtain: CurtainTemplates,
  tv: TVTemplates,
  fan: FanTemplates,
  robot: RobotTemplates,
  sensor: SensorTemplates
};

export class ScriptGenerator {
  constructor() {
    this.registry = new DeviceRegistry();
    this.cache = new CacheManager();
  }

  /**
   * 生成或获取缓存脚本
   */
  generate(deviceName, action) {
    // 查找设备
    const device = this.registry.findDevice(deviceName);
    if (!device) {
      throw new Error(`未找到设备: ${deviceName}`);
    }

    // 解析动作
    const parsedAction = this.registry.parseAction(action);
    
    // 检查缓存（使用解析后的动作名）
    if (this.cache.hasCache(device.name, parsedAction)) {
      return {
        cached: true,
        path: this.cache.getScriptPath(device.name, parsedAction),
        action: parsedAction,
        device
      };
    }
    
    // 检查设备是否支持该动作
    if (!this.registry.supportsAction(device.type, parsedAction)) {
      throw new Error(`设备 ${device.name} (${device.type}) 不支持动作: ${parsedAction}`);
    }

    // 获取配置
    const config = ConfigManager.load();
    if (!config.accessToken) {
      throw new Error('未配置 Access Token，请先运行: dueros config');
    }

    // 获取模板
    const templateName = this.registry.getTemplateName(device.type);
    const templates = TEMPLATES[templateName];
    if (!templates || !templates[parsedAction]) {
      throw new Error(`未找到模板: ${templateName}.${parsedAction}`);
    }

    // 生成脚本内容
    const scriptContent = templates[parsedAction](device, config);

    // 保存缓存
    const scriptPath = this.cache.saveCache(deviceName, parsedAction, scriptContent);

    return {
      cached: false,
      path: scriptPath,
      device,
      action: parsedAction
    };
  }

  /**
   * 执行控制命令
   */
  async execute(deviceName, action, params = []) {
    // 生成或获取脚本
    const result = this.generate(deviceName, action);
    
    // 执行脚本
    const execResult = await this.cache.executeCache(
      result.cached ? deviceName : result.device?.name || deviceName,
      result.action || action,
      params
    );

    return {
      ...result,
      ...execResult
    };
  }

  /**
   * 强制重新生成脚本（用于Token更新后）
   */
  regenerate(deviceName, action) {
    // 清除缓存
    this.cache.clearDeviceCache(deviceName);
    // 重新生成
    return this.generate(deviceName, action);
  }

  /**
   * 重新生成所有缓存（Token更新后调用）
   */
  regenerateAll() {
    const stats = this.cache.getStats();
    const results = [];
    
    for (const deviceName of stats.devices) {
      this.cache.clearDeviceCache(deviceName);
      results.push({ device: deviceName, cleared: true });
    }
    
    return results;
  }
}

export default ScriptGenerator;
