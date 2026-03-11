#!/usr/bin/env node
/**
 * DuerOS 控制脚本
 * 设备: 主卧空调
 * 动作: turnOn
 * 生成时间: 2026-03-04T08:20:05.503Z
 * 
 * 此脚本由 dueros-evokehome 自动生成，可直接执行
 */

import { exec } from '../../src/client.js';

const DEVICE_ID = 'test-ac-001';
const TOKEN = '121.596850dd05f7a9a053b2288a4034959f.Y3uRVnTL80F2yl9tpfE5xKHmLpeaLNoEiTCJKXx.i5hi7w';

async function main() {
  try {
    const result = await exec('TurnOnRequest', DEVICE_ID, TOKEN);
    console.log(result.status === 0 ? '✅ 主卧空调已开启' : '❌ 失败: ' + result.msg);
    process.exit(result.status === 0 ? 0 : 1);
  } catch (error) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  }
}

main();
