/**
 * 风扇设备模板
 */

export const FanTemplates = {
  turnOn: (device, config) => `import { exec } from '../../src/client.js';

const DEVICE_ID = '${device.id}';
const TOKEN = '${config.accessToken}';

async function main() {
  try {
    const result = await exec('TurnOnRequest', DEVICE_ID, TOKEN);
    console.log(result.status === 0 ? '✅ ${device.name}已开启 🌀' : '❌ 失败: ' + result.msg);
    process.exit(result.status === 0 ? 0 : 1);
  } catch (error) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  }
}

main();
`,

  turnOff: (device, config) => `import { exec } from '../../src/client.js';

const DEVICE_ID = '${device.id}';
const TOKEN = '${config.accessToken}';

async function main() {
  try {
    const result = await exec('TurnOffRequest', DEVICE_ID, TOKEN);
    console.log(result.status === 0 ? '✅ ${device.name}已关闭' : '❌ 失败: ' + result.msg);
    process.exit(result.status === 0 ? 0 : 1);
  } catch (error) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  }
}

main();
`,

  setSpeed: (device, config) => `import { exec } from '../../src/client.js';

const DEVICE_ID = '${device.id}';
const TOKEN = '${config.accessToken}';

const SPEED_MAP = {
  'min': 1, '最小': 1, '最低': 1,
  'low': 3, '低': 3, '小': 3,
  'middle': 5, '中': 5, '中等': 5,
  'high': 8, '高': 8, '大': 8,
  'max': 10, '最大': 10, '最高': 10
};

async function main() {
  const input = process.argv[2];
  if (!input) {
    console.error('❌ 请指定风速值（0-10）或档位（min/low/middle/high/max）');
    process.exit(1);
  }
  
  let value;
  if (!isNaN(parseInt(input))) {
    value = parseInt(input);
  } else {
    value = SPEED_MAP[input.toLowerCase()];
  }
  
  if (!value || value < 0 || value > 10) {
    console.error('❌ 风速范围应在 0-10 之间');
    process.exit(1);
  }
  
  try {
    const result = await exec('SetFanSpeedRequest', DEVICE_ID, TOKEN, {
      fanSpeed: { value: value * 10 }
    });
    console.log(result.status === 0 ? '✅ ${device.name}风速已设为 ' + value : '❌ 失败: ' + result.msg);
    process.exit(result.status === 0 ? 0 : 1);
  } catch (error) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  }
}

main();
`,

  incrementSpeed: (device, config) => `import { exec } from '../../src/client.js';

const DEVICE_ID = '${device.id}';
const TOKEN = '${config.accessToken}';

async function main() {
  const delta = process.argv[2] || '1';
  
  try {
    const result = await exec('IncrementFanSpeedRequest', DEVICE_ID, TOKEN, {
      deltaFanSpeed: { value: parseInt(delta) * 10 }
    });
    console.log(result.status === 0 ? '✅ ${device.name}风速已增加' : '❌ 失败: ' + result.msg);
    process.exit(result.status === 0 ? 0 : 1);
  } catch (error) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  }
}

main();
`,

  decrementSpeed: (device, config) => `import { exec } from '../../src/client.js';

const DEVICE_ID = '${device.id}';
const TOKEN = '${config.accessToken}';

async function main() {
  const delta = process.argv[2] || '1';
  
  try {
    const result = await exec('DecrementFanSpeedRequest', DEVICE_ID, TOKEN, {
      deltaFanSpeed: { value: parseInt(delta) * 10 }
    });
    console.log(result.status === 0 ? '✅ ${device.name}风速已降低' : '❌ 失败: ' + result.msg);
    process.exit(result.status === 0 ? 0 : 1);
  } catch (error) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  }
}

main();
`,

  swing: (device, config) => `import { exec } from '../../src/client.js';

const DEVICE_ID = '${device.id}';
const TOKEN = '${config.accessToken}';

async function main() {
  const enable = process.argv[2] !== 'off';
  
  try {
    const result = await exec('SetSwingModeRequest', DEVICE_ID, TOKEN, {
      swing: { value: enable }
    });
    console.log(result.status === 0 ? '✅ ${device.name}摆风已' + (enable ? '开启' : '关闭') : '❌ 失败: ' + result.msg);
    process.exit(result.status === 0 ? 0 : 1);
  } catch (error) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  }
}

main();
`
};

export default FanTemplates;
