import { processIntent } from './src/index.js';
import { SkillRouter } from './src/router.js';
import { DeviceRegistry } from './src/device-registry.js';
import { loadConfig } from './src/utils.js';

// 测试：开启台灯
const userInput = '开启台灯';

console.log('🎤 用户指令:', userInput);
console.log('');

// 1. 加载配置
const config = loadConfig();
const registry = new DeviceRegistry(config.devices || {});
const router = new SkillRouter(registry);

// 2. 解析意图
const intent = router.parseIntent(userInput);
console.log('🎯 意图解析结果:');
console.log('   设备提示:', intent.deviceHint);
console.log('   动作类型:', intent.actionType);
console.log('   参数:', JSON.stringify(intent.params));
console.log('');

// 3. 查找设备
const device = registry.findDevice(intent.deviceHint);
console.log('📱 设备查找结果:');
console.log('   名称:', device.name);
console.log('   ID:', device.id);
console.log('   类型:', device.type);
console.log('   房间:', device.room);
console.log('');

// 4. 路由决策
const subSkillName = router.getSubSkillForDevice(device.type, intent.actionType);
console.log('🔧 路由决策:');
console.log('   设备类型:', device.type);
console.log('   子技能:', subSkillName);
console.log('');

// 5. 模拟执行结果
console.log('✅ 预期执行:');
console.log('   子技能: dueros-light');
console.log('   动作: turnOn');
console.log('   API: TurnOnRequest');
console.log('   设备ID:', device.id);
