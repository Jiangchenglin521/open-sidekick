/**
 * 简单测试脚本
 * 运行: node test.js
 */

import { ConfigManager } from './src/config.js';

console.log('🧪 测试 EvokeHome Skill\n');

// 测试 1: 配置加载
console.log('1. 测试配置加载...');
const config = ConfigManager.load();
console.log('   ✓ 配置加载成功');
console.log(`   - Access Token: ${config.accessToken.slice(0, 20)}...`);
console.log(`   - Token 过期检查: ${config.tokenExpiryCheck ? '已启用' : '已禁用'}`);
console.log(`   - 自动续期: ${config.autoRefresh ? '已启用' : '已禁用'}`);

// 测试 2: Token 状态
console.log('\n2. 测试 Token 状态...');
const status = ConfigManager.getTokenStatus();
console.log(`   ✓ Token 状态: ${status.status}`);
console.log(`   - ${status.message}`);

// 测试 3: 配置路径
console.log('\n3. 测试配置路径...');
const configPath = ConfigManager.getConfigPath();
console.log(`   ✓ 配置路径: ${configPath}`);

console.log('\n✅ 所有测试通过！');
console.log('\n使用方法:');
console.log('  - 语音: "打开台灯"');
console.log('  - 语音: "把台灯调到50%"');
console.log('  - 语音: "查询设备状态"');
