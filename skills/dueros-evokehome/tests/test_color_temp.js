#!/usr/bin/env node
/**
 * 测试色温控制 API
 */

import fs from 'fs';
import path from 'path';
import os from 'os';

const BASE_URL = 'https://xiaodu.baidu.com/saiya/smarthome';
const CONFIG_DIR = path.join(os.homedir(), '.config', 'dueros-evokehome');
const configPath = path.join(CONFIG_DIR, 'config.json');
const devicesPath = path.join(CONFIG_DIR, 'devices.json');

const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
const devices = JSON.parse(fs.readFileSync(devicesPath, 'utf-8'));
const deviceId = devices['台灯']?.id || 'cce0daa95ce5';
const accessToken = config.accessToken;

// 测试不同色温 API 格式
async function testColorTemp() {
  const tests = [
    // 方法1: 当前实现
    {
      name: '方法1: SetColorTemperatureRequest',
      action: 'SetColorTemperatureRequest',
      body: {
        header: { namespace: 'DuerOS.ConnectedHome.Control', name: 'SetColorTemperatureRequest', payloadVersion: 3 },
        payload: {
          applianceId: deviceId,
          parameters: { proxyConnectStatus: false, attribute: 'colorTemperature', attributeValue: 100 },
          appliance: { applianceId: [deviceId] },
          colorTemperature: { value: 100 }
        }
      }
    },
    // 方法2: 类似亮度的格式
    {
      name: '方法2: 类似亮度格式',
      action: 'SetColorTemperatureRequest',
      body: {
        header: { namespace: 'DuerOS.ConnectedHome.Control', name: 'SetColorTemperatureRequest', payloadVersion: 3 },
        payload: {
          applianceId: deviceId,
          parameters: { proxyConnectStatus: false },
          appliance: { applianceId: [deviceId] },
          colorTemperatureInKelvin: { value: 100 }
        }
      }
    },
    // 方法3: 使用 SetColorRequest
    {
      name: '方法3: SetColorRequest',
      action: 'SetColorRequest',
      body: {
        header: { namespace: 'DuerOS.ConnectedHome.Control', name: 'SetColorRequest', payloadVersion: 3 },
        payload: {
          applianceId: deviceId,
          parameters: { proxyConnectStatus: false },
          appliance: { applianceId: [deviceId] },
          color: { temperatureK: 100 }
        }
      }
    },
    // 方法4: 使用 Increase/Decrease
    {
      name: '方法4: DecreaseColorTemperatureRequest',
      action: 'DecreaseColorTemperatureRequest',
      body: {
        header: { namespace: 'DuerOS.ConnectedHome.Control', name: 'DecreaseColorTemperatureRequest', payloadVersion: 3 },
        payload: {
          applianceId: deviceId,
          parameters: { proxyConnectStatus: false },
          appliance: { applianceId: [deviceId] }
        }
      }
    }
  ];

  for (const test of tests) {
    console.log(`\n🧪 ${test.name}`);
    console.log('请求:', JSON.stringify(test.body, null, 2));
    
    try {
      const response = await fetch(`${BASE_URL}/directivesend?from=inside`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': `AUTHORIZATION=access-${accessToken}`
        },
        body: JSON.stringify(test.body)
      });
      
      const data = await response.json();
      console.log('响应:', JSON.stringify(data, null, 2));
      
      if (data.status === 0) {
        console.log('✅ API 返回成功');
      } else {
        console.log(`❌ API 返回错误: ${data.msg} (status: ${data.status})`);
      }
    } catch (e) {
      console.log(`❌ 请求失败: ${e.message}`);
    }
  }
}

testColorTemp();
