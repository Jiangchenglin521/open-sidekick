#!/usr/bin/env node
/**
 * DuerOS 设备快速控制脚本
 * 支持：开关、亮度、模式、状态查询、设备列表
 * 
 * 用法: node scripts/control.js <命令> [参数]
 */

import fs from 'fs';
import path from 'path';
import os from 'os';

const BASE_URL = 'https://xiaodu.baidu.com/saiya/smarthome';
const CONFIG_DIR = path.join(os.homedir(), '.config', 'dueros-evokehome');
const configPath = path.join(CONFIG_DIR, 'config.json');
const devicesPath = path.join(CONFIG_DIR, 'devices.json');

// 加载配置
let config, devices;
try {
  config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  devices = JSON.parse(fs.readFileSync(devicesPath, 'utf-8'));
} catch (e) {
  console.error('❌ 读取配置失败:', e.message);
  console.error('请确保已运行配置初始化，或手动创建 ~/.config/dueros-evokehome/config.json');
  process.exit(1);
}

const deviceId = devices['台灯']?.id || 'cce0daa95ce5';
const accessToken = config.accessToken;

// 发送控制指令
async function sendControl(action, params = {}) {
  const body = {
    header: {
      namespace: 'DuerOS.ConnectedHome.Control',
      name: action,
      payloadVersion: 3
    },
    payload: {
      applianceId: deviceId,
      parameters: { proxyConnectStatus: false, ...params },
      appliance: { applianceId: [deviceId] }
    }
  };

  // 亮度调节特殊处理
  if (action === 'SetBrightnessPercentageRequest' && params.brightness) {
    body.payload.brightness = { value: params.brightness };
    body.payload.parameters.attribute = 'brightness';
    body.payload.parameters.attributeValue = params.brightness;
  }

  // 模式切换特殊处理
  if (action === 'SetModeRequest' && params.mode) {
    body.payload.mode = { value: params.mode };
  }

  // 色温调节特殊处理 - 使用相对值 1-100
  if (action === 'SetColorTemperatureRequest' && params.colorTemperature) {
    body.payload.colorTemperature = { value: params.colorTemperature };
    body.payload.parameters.attribute = 'colorTemperature';
    body.payload.parameters.attributeValue = params.colorTemperature;
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

// 获取设备列表
async function getDeviceList() {
  const response = await fetch(`${BASE_URL}/devicelist?from=h5_control`, {
    headers: { 'Cookie': `AUTHORIZATION=access-${accessToken}` }
  });
  return response.json();
}

// 获取设备状态
async function getDeviceStatus() {
  const data = await getDeviceList();
  if (data.status !== 0) throw new Error(data.msg);
  
  const device = data.data?.appliances?.find(d => d.applianceId === deviceId);
  if (!device) return '❌ 找不到设备';
  
  const attrs = device.attributes || {};
  const isOnline = attrs.connectivity?.value === 'REACHABLE';
  const isOn = ['ON', 'on'].includes(attrs.turnOnState?.value);
  const brightness = attrs.brightness?.value;
  const colorTemp = attrs.colorTemperatureInKelvin?.value;
  
  let result = isOnline ? '🟢 在线' : '🔴 离线';
  result += ` | ${isOn ? '💡 开启' : '⚫ 关闭'}`;
  if (isOn && brightness) result += ` | 亮度 ${brightness}%`;
  if (isOn && colorTemp) result += ` | 色温 ${colorTemp}/100`;
  return result;
}

// 主函数
async function main() {
  const cmd = process.argv[2];
  const arg = process.argv[3];

  try {
    switch (cmd) {
      case 'on':
      case '开': {
        const data = await sendControl('TurnOnRequest');
        console.log(data.status === 0 ? '✅ 台灯已打开！' : `❌ ${data.msg}`);
        break;
      }
      
      case 'off':
      case '关': {
        const data = await sendControl('TurnOffRequest');
        console.log(data.status === 0 ? '✅ 台灯已关闭！' : `❌ ${data.msg}`);
        break;
      }
      
      case 'brightness':
      case 'b': {
        const value = parseInt(arg);
        if (isNaN(value) || value < 0 || value > 100) {
          console.log('用法: control.js brightness <0-100>');
          process.exit(1);
        }
        const data = await sendControl('SetBrightnessPercentageRequest', { brightness: value });
        console.log(data.status === 0 ? `✅ 亮度已调至 ${value}%` : `❌ ${data.msg}`);
        break;
      }
      
      case 'mode':
      case 'm': {
        const mode = arg?.toUpperCase();
        if (!mode) {
          console.log('用法: control.js mode <night|day|reading|relax>');
          process.exit(1);
        }
        const data = await sendControl('SetModeRequest', { mode });
        console.log(data.status === 0 ? `✅ 已切换到 ${mode} 模式` : `❌ ${data.msg}`);
        break;
      }
      
      case 'night':
      case '夜间': {
        const data = await sendControl('SetModeRequest', { mode: 'NIGHT' });
        console.log(data.status === 0 ? '✅ 已切换到夜间阅读模式 🌙' : `❌ ${data.msg}`);
        break;
      }

      case 'temp':
      case 'temperature':
      case '色温': {
        const value = parseInt(arg);
        if (isNaN(value) || value < 1 || value > 100) {
          console.log('用法: control.js temp <1-100> (相对值)');
          console.log('  1 = 最暖（偏黄）');
          console.log('  50 = 中性光');
          console.log('  100 = 最冷（偏白）');
          process.exit(1);
        }
        const data = await sendControl('SetColorTemperatureRequest', { colorTemperature: value });
        console.log(data.status === 0 ? `✅ 色温已调至 ${value}/100` : `❌ ${data.msg}`);
        break;
      }

      case 'warm':
      case '暖光': {
        const data = await sendControl('SetColorTemperatureRequest', { colorTemperature: 20 });
        console.log(data.status === 0 ? '✅ 已切换为暖光 🔶' : `❌ ${data.msg}`);
        break;
      }

      case 'cool':
      case '冷光': {
        const data = await sendControl('SetColorTemperatureRequest', { colorTemperature: 80 });
        console.log(data.status === 0 ? '✅ 已切换为冷光 💠' : `❌ ${data.msg}`);
        break;
      }
      
      case 'status':
      case 's':
      case '状态': {
        const status = await getDeviceStatus();
        console.log(status);
        break;
      }
      
      case 'list':
      case 'l':
      case '列表': {
        const data = await getDeviceList();
        if (data.status !== 0) {
          console.log('❌ 获取设备列表失败:', data.msg);
          break;
        }
        const appliances = data.data?.appliances || [];
        console.log(`📱 已发现 ${appliances.length} 个设备:`);
        appliances.forEach((dev, idx) => {
          const name = dev.friendlyName || '未知设备';
          const id = dev.applianceId?.slice(0, 8) + '...';
          const types = dev.applianceTypes?.join(', ');
          console.log(`  ${idx + 1}. ${name} (${id}) - ${types}`);
        });
        break;
      }
      
      default: {
        console.log(`
🏠 DuerOS 台灯控制脚本

用法: node scripts/control.js <命令> [参数]

命令:
  on / 开              打开台灯
  off / 关             关闭台灯
  brightness <0-100>   设置亮度 (可简写为 b)
  mode <模式>          切换模式: night/day/reading/relax (可简写为 m)
  night / 夜间         快速切换到夜间模式
  temp <1-100>         设置色温相对值 (可简写为 t)
  warm / 暖光          快速切换暖光 (20/100)
  cool / 冷光          快速切换冷光 (80/100)
  status / s / 状态    查看设备状态
  list / l / 列表      列出所有设备

示例:
  node scripts/control.js on
  node control.js b 50
  node control.js night
  node control.js temp 50
  node control.js warm
  node control.js status
        `);
      }
    }
  } catch (error) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  }
}

main();
