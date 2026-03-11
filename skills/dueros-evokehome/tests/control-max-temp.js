#!/usr/bin/env node
/**
 * 控制脚本 - 将台灯色温调到最高
 * 严格按照 DuerOS EvokeHome 文档格式
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
 * 严格遵循 DuerOS ConnectedHome Control 消息格式
 */
async function sendCommand(actionName, payload = {}) {
  const body = {
    header: {
      namespace: 'DuerOS.ConnectedHome.Control',
      name: actionName,
      payloadVersion: 3
    },
    payload: {
      applianceId: deviceId,
      parameters: { proxyConnectStatus: false, ...payload },
      appliance: { applianceId: [deviceId] }
    }
  };

  // 根据文档添加特殊参数
  if (payload.colorTemperature) {
    body.payload.colorTemperature = payload.colorTemperature;
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
 * 获取设备状态
 */
async function getDeviceStatus() {
  const response = await fetch(`${BASE_URL}/devicelist?from=h5_control`, {
    headers: { 'Cookie': `AUTHORIZATION=access-${accessToken}` }
  });
  
  const data = await response.json();
  if (data.status !== 0) throw new Error(data.msg);
  
  const device = data.data?.appliances?.find(d => d.applianceId === deviceId);
  if (!device) return null;
  
  const attrs = device.attributes || {};
  return {
    name: device.friendlyName,
    online: attrs.connectivity?.value === 'REACHABLE',
    on: ['ON', 'on'].includes(attrs.turnOnState?.value),
    brightness: attrs.brightness?.value,
    colorTemperature: attrs.colorTemperatureInKelvin?.value,
    mode: attrs.mode?.value
  };
}

/**
 * 主函数：将色温调到最高（100）
 */
async function main() {
  try {
    // 根据文档：设置色温使用 SetColorTemperatureRequest
    // 参数范围：1-100，1=最暖，100=最冷
    // "最高"对应 100（最冷）
    const result = await sendCommand('SetColorTemperatureRequest', {
      colorTemperature: { value: 100 },
      attribute: 'colorTemperature',
      attributeValue: 100
    });

    if (result.status === 0) {
      console.log('✅ 台灯色温已调至最高（100/100）');
    } else {
      console.log('❌ 调节失败:', result.msg);
    }

    // 查询设备状态
    const status = await getDeviceStatus();
    if (status) {
      console.log('\n📱 设备状态:');
      console.log(`   名称: ${status.name}`);
      console.log(`   在线: ${status.online ? '是' : '否'}`);
      console.log(`   开关: ${status.on ? '开启' : '关闭'}`);
      console.log(`   亮度: ${status.brightness}%`);
      console.log(`   色温: ${status.colorTemperature}/100`);
      console.log(`   模式: ${status.mode || '无'}`);
    }
  } catch (error) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  }
}

main();
