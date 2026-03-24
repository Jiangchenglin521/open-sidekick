/**
 * DuerOS 智能家居控制技能 - 主入口
 * 基于能力架构重构 - 无能力校验、执行后查状态、支持缓存
 */

import { DuerOSClient } from './client.js';
import { IntentParser } from './intent-parser.js';
import { CapabilityRegistry } from './capability-registry.js';
import { ExecutionCache } from './execution-cache.js';
import { loadConfig } from './utils.js';

/**
 * 主控制类
 */
export class EvokeHome {
  constructor() {
    this.config = loadConfig();
    this.client = new DuerOSClient(this.config);
    this.registry = new CapabilityRegistry();
    this.parser = new IntentParser();
    this.cache = new ExecutionCache();
  }

  /**
   * 执行控制命令（新流程：饱和发送 → 查状态 → 汇报 → 缓存）
   * @param {string} userInput - 用户输入
   * @returns {Promise<Object>} 执行结果
   */
  async execute(userInput) {
    console.log(`🎤 收到指令: "${userInput}"`);
    
    try {
      // 1. 解析意图（提取设备和动作，不校验能力）
      const intents = await this.parser.parse(userInput);
      console.log('🎯 解析意图:', JSON.stringify(intents, null, 2));
      
      if (!intents || intents.length === 0) {
        return {
          success: false,
          message: '❌ 无法识别指令，请重新描述'
        };
      }

      // 获取目标设备（以第一个意图的设备为准）
      const deviceName = intents[0].deviceHint;
      const device = this.registry.findDevice(deviceName);
      
      if (!device) {
        return {
          success: false,
          message: `❌ 找不到设备"${deviceName}"，请检查设备配置`
        };
      }

      console.log(`📱 目标设备: ${device.name} (${device.id})`);

      // 2. 检查缓存（直接命中则跳过解析和生成）
      const cacheKey = `${device.name}::${userInput}`;
      let messages = [];
      let fromCache = false;
      
      if (this.cache.has(device.name, userInput)) {
        const cached = this.cache.get(device.name, userInput);
        messages = cached.messages;
        fromCache = true;
        console.log('📦 命中执行缓存，直接发送缓存消息');
      } else {
        // 3. 生成消息（无能力校验，直接生成）
        messages = await this.generateMessages(intents, device);
        console.log(`📤 生成 ${messages.length} 条控制消息`);
      }

      // 4. 饱和式攻击发送（连续发送，不等待）
      console.log('⚡ 开始饱和式攻击发送...');
      await this.saturationAttack(messages);
      console.log('✅ 消息发送完成');

      // 5. 查询设备状态（关键步骤）
      console.log('🔍 查询设备状态...');
      const finalStatus = await this.client.getDeviceStatus(device.id);
      
      // 6. 验证结果并汇报
      const result = this.verifyAndReport(intents, finalStatus, device, fromCache);
      
      // 7. 缓存成功的执行（首次执行且成功才缓存）
      if (!fromCache && result.success) {
        this.cache.set(device.name, userInput, messages, finalStatus);
        console.log('💾 已缓存成功执行的指令序列');
      } else if (fromCache && result.success) {
        this.cache.incrementSuccess(device.name, userInput);
      }

      return result;

    } catch (error) {
      console.error('执行失败:', error);
      return {
        success: false,
        message: `❌ 执行失败: ${error.message}`
      };
    }
  }

  /**
   * 生成消息（无能力校验）
   */
  async generateMessages(intents, device) {
    const messages = [];
    
    for (const intent of intents) {
      const capability = await this.parser.getCapability(intent.capability);
      
      if (!capability) {
        console.warn(`⚠️ 未找到能力模块: ${intent.capability}，跳过`);
        continue;
      }

      const action = intent.action || this.getDefaultAction(intent);
      const message = capability.generateMessage(action, device.id, {
        accessToken: this.config.accessToken,
        deviceDetails: device.details || {},
        ...intent.params
      });

      messages.push(message);
    }
    
    return messages;
  }

  /**
   * 饱和式攻击发送（连续发送，不等待响应）
   */
  async saturationAttack(messages) {
    // 使用 Promise.all 并发发送，不等待响应
    const sendPromises = messages.map((msg, index) => {
      console.log(`  [${index + 1}/${messages.length}] 发送 ${msg.header.name}`);
      return this.client.sendControlMessage(msg).catch(err => {
        console.warn(`  [${index + 1}] 发送失败:`, err.message);
        return null;  // 失败也继续
      });
    });
    
    // 等待所有发送完成（不管成功与否）
    await Promise.all(sendPromises);
  }

  /**
   * 验证结果并生成汇报
   */
  verifyAndReport(intents, finalStatus, device, fromCache) {
    const cacheTag = fromCache ? ' [缓存]' : '';
    
    // 检查设备是否在线
    if (!finalStatus || finalStatus.connectivity?.value !== 'REACHABLE') {
      return {
        success: false,
        message: `❌${cacheTag} 设备"${device.name}"离线或无法获取状态`
      };
    }

    // 根据意图验证状态
    const expectedStates = this.extractExpectedStates(intents);
    const actualStates = this.extractActualStates(finalStatus);
    
    // 对比预期和实际状态
    const mismatches = [];
    for (const [key, expected] of Object.entries(expectedStates)) {
      const actual = actualStates[key];
      if (actual !== undefined && actual !== expected) {
        mismatches.push(`${key}: 期望${expected}, 实际${actual}`);
      }
    }

    // 生成汇报消息
    if (mismatches.length === 0) {
      // 成功
      const stateDesc = this.formatStateDescription(actualStates);
      return {
        success: true,
        message: `✅${cacheTag} ${device.name} ${stateDesc}`,
        data: { status: finalStatus, states: actualStates }
      };
    } else {
      // 失败（可能是设备不支持）
      return {
        success: false,
        message: `❌${cacheTag} ${device.name} 执行结果不符: ${mismatches.join(', ')}。该设备可能不支持此操作`,
        data: { status: finalStatus, expected: expectedStates, actual: actualStates }
      };
    }
  }

  /**
   * 从意图提取预期状态
   */
  extractExpectedStates(intents) {
    const states = {};
    
    for (const intent of intents) {
      switch(intent.action) {
        case 'TurnOn':
          states.turnOnState = 'ON';
          break;
        case 'TurnOff':
          states.turnOnState = 'OFF';
          break;
        case 'SetBrightnessPercentage':
          states.brightness = intent.params.percentage;
          break;
        case 'SetColorTemperature':
          states.colorTemperature = intent.params.colorTemperatureInKelvin;
          break;
        case 'SetTemperature':
          states.temperature = intent.params.targetTemperature;
          break;
        case 'SetDirection':
          states.direction = intent.params.direction;
          break;
      }
    }
    
    return states;
  }

  /**
   * 从状态响应提取实际状态
   */
  extractActualStates(status) {
    const attrs = status.attributes || {};
    return {
      turnOnState: attrs.turnOnState?.value,
      brightness: attrs.brightness?.value,
      colorTemperature: attrs.colorTemperature?.value,
      temperature: attrs.temperature?.value,
      mode: attrs.mode?.value,
      direction: attrs.direction?.value
    };
  }

  /**
   * 格式化状态描述
   */
  formatStateDescription(states) {
    const parts = [];
    if (states.turnOnState) parts.push(states.turnOnState === 'ON' ? '已开启' : '已关闭');
    if (states.brightness !== undefined) parts.push(`亮度${states.brightness}%`);
    if (states.colorTemperature !== undefined) parts.push(`色温${states.colorTemperature}K`);
    if (states.temperature !== undefined) parts.push(`温度${states.temperature}°C`);
    if (states.mode) parts.push(`模式${states.mode}`);
    return parts.join('，') || '状态正常';
  }

  /**
   * 获取默认动作
   */
  getDefaultAction(intent) {
    if (intent.raw.includes('开') || intent.raw.includes('打开')) {
      return 'TurnOn';
    }
    if (intent.raw.includes('关') || intent.raw.includes('关闭')) {
      return 'TurnOff';
    }
    return 'TurnOn';
  }

  /**
   * 查询设备状态（独立方法）
   */
  async queryStatus(deviceName) {
    const device = this.registry.findDevice(deviceName);
    if (!device) {
      return {
        success: false,
        message: `❌ 找不到设备"${deviceName}"`
      };
    }

    try {
      const status = await this.client.getDeviceStatus(device.id);
      const states = this.extractActualStates(status);
      return {
        success: true,
        message: `📱 ${device.name}: ${this.formatStateDescription(states)}`,
        data: status
      };
    } catch (error) {
      return {
        success: false,
        message: `❌ 查询失败: ${error.message}`
      };
    }
  }

  /**
   * 列出所有设备
   */
  async listDevices() {
    const devices = this.registry.listDevices();
    return {
      success: true,
      message: `📱 共 ${devices.length} 个设备`,
      data: devices
    };
  }

  /**
   * 获取缓存统计
   */
  getCacheStats() {
    return this.cache.getStats();
  }

  /**
   * 清除缓存
   */
  clearCache() {
    const stats = this.cache.getStats();
    // 重新初始化空缓存
    this.cache = new ExecutionCache();
    return {
      success: true,
      message: `✅ 已清除 ${stats.total} 条缓存`
    };
  }
}

// 便捷导出
export async function execute(userInput) {
  const evoke = new EvokeHome();
  return evoke.execute(userInput);
}

export async function queryStatus(deviceName) {
  const evoke = new EvokeHome();
  return evoke.queryStatus(deviceName);
}

export async function listDevices() {
  const evoke = new EvokeHome();
  return evoke.listDevices();
}

export default EvokeHome;
