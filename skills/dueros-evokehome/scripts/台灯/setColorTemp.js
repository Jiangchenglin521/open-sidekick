#!/usr/bin/env node
/**
 * DuerOS 控制脚本
 * 设备: 台灯
 * 动作: setColorTemp
 * 生成时间: 2026-03-04T08:57:13.122Z
 * 
 * 此脚本由 dueros-evokehome 自动生成，可直接执行
 */

import { exec, getDeviceStatus } from '../../src/client.js';

const DEVICE_ID = 'cce0daa95ce5';
const TOKEN = '121.596850dd05f7a9a053b2288a4034959f.Y3uRVnTL80F2yl9tpfE5xKHmLpeaLNoEiTCJKXx.i5hi7w';

async function main() {
  const temp = process.argv[2] || '4000';
  const value = parseInt(temp);
  
  if (isNaN(value) || value < 1 || value > 100000) {
    console.error('❌ 色温值需在 1-100000 Kelvin 之间');
    process.exit(1);
  }
  
  try {
    // 获取设备状态以确定设备的色温范围
    const deviceStatus = await getDeviceStatus(DEVICE_ID, TOKEN);
    const colorTempAttr = deviceStatus?.raw?.colorTemperatureInKelvin;
    const minValue = colorTempAttr?.minimumValue || 1;
    const maxValue = colorTempAttr?.maximumValue || 100000;
    
    if (value < minValue || value > maxValue) {
      console.error(`❌ 该设备支持的色温范围为 ${minValue}-${maxValue}K`);
      process.exit(1);
    }
    
    const result = await exec('SetColorTemperatureRequest', DEVICE_ID, TOKEN, {
      colorTemperatureInKelvin: value
    });
    console.log(result.status === 0 ? '✅ 台灯色温已调至 ' + value + 'K' : '❌ 失败: ' + result.msg);
    process.exit(result.status === 0 ? 0 : 1);
  } catch (error) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  }
}

main();
