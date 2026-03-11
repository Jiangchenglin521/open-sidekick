/**
 * DuerOS 智能家居主技能入口
 * 负责意图解析、设备识别、子技能路由
 */

import { DuerOSClient } from './client.js';
import { SkillRouter } from './router.js';
import { DeviceRegistry } from './device-registry.js';
import { loadConfig } from './utils.js';

// 子技能导入（动态加载）
const skillModules = {};

/**
 * 动态加载子技能
 * 支持本地路径和npm包两种方式
 */
async function loadSubSkill(skillName) {
  if (skillModules[skillName]) {
    return skillModules[skillName];
  }
  
  // 尝试从本地路径加载（相对于当前目录的skills文件夹）
  try {
    const localPath = `../../dueros-${skillName}/index.js`;
    const module = await import(localPath);
    skillModules[skillName] = module.default || module;
    return skillModules[skillName];
  } catch (localError) {
    // 本地加载失败，尝试npm包
    try {
      const module = await import(`@openclaw/dueros-${skillName}`);
      skillModules[skillName] = module.default || module;
      return skillModules[skillName];
    } catch (npmError) {
      console.error(`子技能 ${skillName} 加载失败:`, localError.message);
      return null;
    }
  }
}

/**
 * 主技能处理器
 */
export async function processIntent(userInput, context = {}) {
  const config = loadConfig();
  const client = new DuerOSClient(config);
  const registry = new DeviceRegistry(config.devices || {});
  const router = new SkillRouter(registry);
  
  // 1. 解析用户意图
  const intent = router.parseIntent(userInput);
  console.log('🎯 识别意图:', intent);
  
  // 2. 确定目标设备
  const device = registry.findDevice(intent.deviceHint, context.room);
  if (!device) {
    return {
      success: false,
      message: `❌ 找不到设备"${intent.deviceHint}"，请检查设备名称或运行"evokehome devices"查看可用设备。`
    };
  }
  console.log('📱 目标设备:', device.name, `(${device.type})`);
  
  // 3. 确定子技能
  const subSkillName = router.getSubSkillForDevice(device.type, intent.actionType);
  if (!subSkillName) {
    return {
      success: false,
      message: `❌ 设备类型"${device.type}"暂不支持"${intent.actionType}"操作。`
    };
  }
  console.log('🔧 路由到子技能:', subSkillName);
  
  // 4. 加载并执行子技能
  const subSkill = await loadSubSkill(subSkillName);
  if (!subSkill) {
    return {
      success: false,
      message: `❌ 子技能"${subSkillName}"加载失败，请检查是否已安装。`
    };
  }
  
  // 5. 执行控制
  try {
    const result = await subSkill.execute({
      device,
      intent,
      client,
      params: intent.params
    });
    
    return {
      success: true,
      message: result.message || '✅ 操作成功',
      data: result.data
    };
  } catch (error) {
    return {
      success: false,
      message: `❌ 操作失败: ${error.message}`
    };
  }
}

/**
 * 查询设备状态（通用）
 */
export async function queryDeviceStatus(deviceName, context = {}) {
  const config = loadConfig();
  const client = new DuerOSClient(config);
  const registry = new DeviceRegistry(config.devices || {});
  
  const device = registry.findDevice(deviceName, context.room);
  if (!device) {
    return { success: false, message: `❌ 找不到设备"${deviceName}"` };
  }
  
  try {
    const status = await client.getDeviceStatus(device.id);
    return {
      success: true,
      message: formatStatusMessage(device, status),
      data: status
    };
  } catch (error) {
    return { success: false, message: `❌ 查询失败: ${error.message}` };
  }
}

/**
 * 格式化状态消息
 */
function formatStatusMessage(device, status) {
  const attrs = status.attributes || {};
  const parts = [`📱 ${device.name}`];
  
  if (attrs.connectivity) {
    parts.push(attrs.connectivity.value === 'REACHABLE' ? '🟢 在线' : '🔴 离线');
  }
  
  if (attrs.turnOnState) {
    parts.push(['ON', 'on'].includes(attrs.turnOnState.value) ? '💡 开启' : '⚫ 关闭');
  }
  
  if (attrs.brightness) {
    parts.push(`亮度 ${attrs.brightness.value}%`);
  }
  
  if (attrs.temperature) {
    parts.push(`温度 ${attrs.temperature.value}°C`);
  }
  
  if (attrs.mode) {
    parts.push(`模式 ${attrs.mode.value}`);
  }
  
  return parts.join(' | ');
}

/**
 * 列出所有设备
 */
export async function listDevices() {
  const config = loadConfig();
  const client = new DuerOSClient(config);
  
  try {
    const devices = await client.getDeviceList();
    return {
      success: true,
      message: `📱 发现 ${devices.length} 个设备`,
      data: devices
    };
  } catch (error) {
    return { success: false, message: `❌ 获取失败: ${error.message}` };
  }
}

// 默认导出
export default { processIntent, queryDeviceStatus, listDevices };
