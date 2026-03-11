#!/usr/bin/env node
/**
 * DuerOS 控制脚本
 * 设备: 台灯
 * 动作: decrementColorTemp
 * 生成时间: 2026-03-04
 */

import { exec } from '../../src/client.js';

const DEVICE_ID = 'cce0daa95ce5';
const TOKEN = '121.596850dd05f7a9a053b2288a4034959f.Y3uRVnTL80F2yl9tpfE5xKHmLpeaLNoEiTCJKXx.i5hi7w';

async function main() {
  const delta = process.argv[2] || '10';
  const deltaValue = parseFloat(delta);
  
  if (isNaN(deltaValue) || deltaValue <= 0 || deltaValue > 100) {
    console.error('❌ 百分比减量需在 1-100 之间');
    process.exit(1);
  }
  
  try {
    const result = await exec('DecrementColorTemperatureRequest', DEVICE_ID, TOKEN, {
      deltaPercentage: { value: deltaValue }
    });
    console.log(result.status === 0 ? '✅ 台灯色温已降低（更暖）' : '❌ 失败: ' + result.msg);
    process.exit(result.status === 0 ? 0 : 1);
  } catch (error) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  }
}

main();
