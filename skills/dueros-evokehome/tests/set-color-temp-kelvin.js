#!/usr/bin/env node
/**
 * 控制脚本 - 调节台灯色温
 * 严格按照 DuerOS ConnectedHome Control 消息协议文档编写
 * 
 * 参考文档章节：可控灯光设备 - 色温控制
 */

import fs from 'fs';
import path from 'path';
import os from 'os';

const BASE_URL = 'https://xiaodu.baidu.com/saiya/smarthome';
const CONFIG_DIR = path.join(os.homedir(), '.config', 'dueros-evokehome');
const configPath = path.join(CONFIG_DIR, 'config.json');
const devicesPath = path.join(CONFIG_DIR, 'devices.json');

// 加载配置
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
const devices = JSON.parse(fs.readFileSync(devicesPath, 'utf-8'));

const deviceId = devices['台灯']?.id;
const accessToken = config.accessToken;

/**
 * 发送控制指令
 * 严格遵循 DuerOS ConnectedHome.Control 命名空间消息格式
 */
async function sendControlRequest(actionName, payloadExt = {}) {
  const body = {
    header: {
      namespace: 'DuerOS.ConnectedHome.Control',
      name: actionName,
      messageId: generateMessageId(),
      payloadVersion: '1'
    },
    payload: {
      accessToken: accessToken,
      appliance: {
        applianceId: deviceId,
        additionalApplianceDetails: {}
      }
    }
  };

  // 根据文档添加特定参数
  if (payloadExt.colorTemperatureInKelvin !== undefined) {
    body.payload.colorTemperatureInKelvin = payloadExt.colorTemperatureInKelvin;
  }
  if (payloadExt.deltaPercentage !== undefined) {
    body.payload.deltaPercentage = payloadExt.deltaPercentage;
  }

  const response = await fetch(`${BASE_URL}/directivesend?from=inside`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': `AUTHORIZATION=access-${accessToken}`
    },
    body: JSON.stringify(body)
  });

  return response.json();
}

/**
 * 生成消息ID
 */
function generateMessageId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * 获取设备状态（查询属性）
 * 使用 DiscoverAppliances 或设备列表接口
 */
async function getDeviceState() {
  const response = await fetch(`${BASE_URL}/devicelist?from=h5_control`, {
    headers: { 'Cookie': `AUTHORIZATION=access-${accessToken}` }
  });
  
  const data = await response.json();
  if (data.status !== 0) throw new Error(data.msg);
  
  const device = data.data?.appliances?.find(d => d.applianceId === deviceId);
  if (!device) return null;
  
  // 从 attributes 中提取设备属性（按照文档格式）
  const attrs = device.attributes || {};
  
  // 查找 colorTemperatureInKelvin 属性
  const colorTempAttr = attrs.find?.(a => a.name === 'colorTemperatureInKelvin') || 
                        attrs.colorTemperatureInKelvin ||
                        attrs.colorTemperature;
  
  const brightnessAttr = attrs.find?.(a => a.name === 'brightness') || attrs.brightness;
  const turnOnStateAttr = attrs.find?.(a => a.name === 'turnOnState') || attrs.turnOnState;
  const connectivityAttr = attrs.find?.(a => a.name === 'connectivity') || attrs.connectivity;
  const modeAttr = attrs.find?.(a => a.name === 'mode') || attrs.mode;
  
  return {
    name: device.friendlyName,
    online: connectivityAttr?.value === 'REACHABLE' || device.isReachable,
    on: turnOnStateAttr?.value === 'ON' || ['ON', 'on'].includes(attrs.turnOnState?.value),
    brightness: brightnessAttr?.value,
    colorTemperatureInKelvin: colorTempAttr?.value,
    mode: modeAttr?.value
  };
}

/**
 * 主函数：调节色温到最高
 * 
 * 根据文档：
 * - SetColorTemperatureRequest 使用 colorTemperatureInKelvin 参数
 * - 色温范围：1000-10000 K（根据属性定义）
 * - 常见值：2200(暖色), 2700(明亮), 4000(白光), 5500(日光), 7000(冷白光)
 * - "最高"色温 = 最冷 = 最大 Kelvin 值 = 10000
 */
async function main() {
  try {
    console.log('🎯 执行 SetColorTemperatureRequest...');
    
    // 严格按照文档 SetColorTemperatureRequest 格式
    // colorTemperatureInKelvin: 色温值（单位：Kelvin）
    const result = await sendControlRequest('SetColorTemperatureRequest', {
      colorTemperatureInKelvin: 10000  // 最高色温 = 最冷 = 10000K
    });

    if (result.status === 0) {
      console.log('✅ SetColorTemperatureConfirmation 成功');
    } else {
      console.log('❌ 控制失败:', result.msg || result);
    }

    // 查询设备状态
    console.log('\n📊 查询设备状态...');
    const state = await getDeviceState();
    
    if (state) {
      console.log('\n📱 设备状态报告:');
      console.log(`   设备名称: ${state.name}`);
      console.log(`   在线状态: ${state.online ? '🟢 REACHABLE' : '🔴 UNREACHABLE'}`);
      console.log(`   开关状态: ${state.on ? 'ON' : 'OFF'}`);
      console.log(`   亮度: ${state.brightness !== undefined ? state.brightness + '%' : '未知'}`);
      console.log(`   色温: ${state.colorTemperatureInKelvin !== undefined ? state.colorTemperatureInKelvin + ' K' : '未知'}`);
      console.log(`   模式: ${state.mode || '未设置'}`);
    } else {
      console.log('❌ 无法获取设备状态');
    }
    
  } catch (error) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  }
}

main();
