#!/usr/bin/env node
/**
 * DuerOS 控制脚本
 * 设备: 台灯
 * 动作: setBrightness
 * 生成时间: 2026-03-04T09:14:07.815Z
 * 
 * 此脚本由 dueros-evokehome 自动生成，可直接执行
 */

import { exec } from '../../src/client.js';

const DEVICE_ID = 'cce0daa95ce5';
const TOKEN = '121.596850dd05f7a9a053b2288a4034959f.Y3uRVnTL80F2yl9tpfE5xKHmLpeaLNoEiTCJKXx.i5hi7w';

async function main() {
  const brightness = process.argv[2] || '50';
  const value = parseInt(brightness);
  
  if (isNaN(value) || value < 0 || value > 100) {
    console.error('❌ 亮度值需在 0-100 之间');
    process.exit(1);
  }
  
  try {
    const result = await exec('SetBrightnessPercentageRequest', DEVICE_ID, TOKEN, {
      brightness: { value },
      attribute: 'brightness',
      attributeValue: value
    });
    console.log(result.status === 0 ? '✅ 台灯亮度已调至 ' + value + '%' : '❌ 失败: ' + result.msg);
    process.exit(result.status === 0 ? 0 : 1);
  } catch (error) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  }
}

main();
