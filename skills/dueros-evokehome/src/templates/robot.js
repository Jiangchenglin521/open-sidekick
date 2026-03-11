/**
 * 扫地机器人设备模板
 */

export const RobotTemplates = {
  start: (device, config) => `import { exec } from '../../src/client.js';

const DEVICE_ID = '${device.id}';
const TOKEN = '${config.accessToken}';

async function main() {
  try {
    const result = await exec('StartCleaningRequest', DEVICE_ID, TOKEN);
    console.log(result.status === 0 ? '✅ ${device.name}开始清扫 🤖' : '❌ 失败: ' + result.msg);
    process.exit(result.status === 0 ? 0 : 1);
  } catch (error) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  }
}

main();
`,

  stop: (device, config) => `import { exec } from '../../src/client.js';

const DEVICE_ID = '${device.id}';
const TOKEN = '${config.accessToken}';

async function main() {
  try {
    const result = await exec('StopCleaningRequest', DEVICE_ID, TOKEN);
    console.log(result.status === 0 ? '✅ ${device.name}已停止' : '❌ 失败: ' + result.msg);
    process.exit(result.status === 0 ? 0 : 1);
  } catch (error) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  }
}

main();
`,

  pause: (device, config) => `import { exec } from '../../src/client.js';

const DEVICE_ID = '${device.id}';
const TOKEN = '${config.accessToken}';

async function main() {
  try {
    const result = await exec('PauseRequest', DEVICE_ID, TOKEN);
    console.log(result.status === 0 ? '✅ ${device.name}已暂停' : '❌ 失败: ' + result.msg);
    process.exit(result.status === 0 ? 0 : 1);
  } catch (error) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  }
}

main();
`,

  charge: (device, config) => `import { exec } from '../../src/client.js';

const DEVICE_ID = '${device.id}';
const TOKEN = '${config.accessToken}';

async function main() {
  try {
    const result = await exec('ChargeRequest', DEVICE_ID, TOKEN);
    console.log(result.status === 0 ? '✅ ${device.name}正在回充 🔋' : '❌ 失败: ' + result.msg);
    process.exit(result.status === 0 ? 0 : 1);
  } catch (error) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  }
}

main();
`,

  setSuction: (device, config) => `import { exec } from '../../src/client.js';

const DEVICE_ID = '${device.id}';
const TOKEN = '${config.accessToken}';

const SUCTION_MAP = {
  'standard': 'STANDARD', '标准': 'STANDARD', '普通': 'STANDARD',
  'strong': 'STRONG', '强劲': 'STRONG', '强力': 'STRONG', 'max': 'STRONG'
};

async function main() {
  const level = process.argv[2];
  if (!level) {
    console.error('❌ 请指定吸力档位: standard/strong');
    process.exit(1);
  }
  
  const suction = SUCTION_MAP[level.toLowerCase()] || 'STANDARD';
  
  try {
    const result = await exec('SetSuctionRequest', DEVICE_ID, TOKEN, {
      suction: { value: suction }
    });
    console.log(result.status === 0 ? '✅ ${device.name}吸力已设为 ' + suction : '❌ 失败: ' + result.msg);
    process.exit(result.status === 0 ? 0 : 1);
  } catch (error) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  }
}

main();
`,

  setWaterLevel: (device, config) => `import { exec } from '../../src/client.js';

const DEVICE_ID = '${device.id}';
const TOKEN = '${config.accessToken}';

const WATER_MAP = {
  'low': 'LOW', '低': 'LOW', '小': 'LOW',
  'middle': 'MIDDLE', '中': 'MIDDLE', '中等': 'MIDDLE',
  'high': 'HIGH', '高': 'HIGH', '大': 'HIGH'
};

async function main() {
  const level = process.argv[2];
  if (!level) {
    console.error('❌ 请指定水量档位: low/middle/high');
    process.exit(1);
  }
  
  const water = WATER_MAP[level.toLowerCase()] || 'MIDDLE';
  
  try {
    const result = await exec('SetWaterLevelRequest', DEVICE_ID, TOKEN, {
      waterLevel: { value: water }
    });
    console.log(result.status === 0 ? '✅ ${device.name}水量已设为 ' + water : '❌ 失败: ' + result.msg);
    process.exit(result.status === 0 ? 0 : 1);
  } catch (error) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  }
}

main();
`,

  cleanLocation: (device, config) => `import { exec } from '../../src/client.js';

const DEVICE_ID = '${device.id}';
const TOKEN = '${config.accessToken}';

const LOCATION_MAP = {
  'living': 'LIVING_ROOM', '客厅': 'LIVING_ROOM',
  'master': 'MASTER_BEDROOM', '主卧': 'MASTER_BEDROOM', '主卧室': 'MASTER_BEDROOM',
  'second': 'SECOND_BEDROOM', '次卧': 'SECOND_BEDROOM', '次卧室': 'SECOND_BEDROOM',
  'kitchen': 'KITCHEN', '厨房': 'KITCHEN',
  'study': 'STUDY', '书房': 'STUDY'
};

async function main() {
  const location = process.argv[2];
  if (!location) {
    console.error('❌ 请指定清扫位置（如：客厅、主卧、书房）');
    process.exit(1);
  }
  
  const loc = LOCATION_MAP[location.toLowerCase()] || location.toUpperCase();
  
  try {
    const result = await exec('SetCleaningLocationRequest', DEVICE_ID, TOKEN, {
      location: { value: loc }
    });
    console.log(result.status === 0 ? '✅ ${device.name}正在清扫 ' + loc : '❌ 失败: ' + result.msg);
    process.exit(result.status === 0 ? 0 : 1);
  } catch (error) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  }
}

main();
`
};

export default RobotTemplates;
