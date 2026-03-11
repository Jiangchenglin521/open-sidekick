/**
 * 电视设备模板
 */

export const TVTemplates = {
  turnOn: (device, config) => `import { exec } from '../../src/client.js';

const DEVICE_ID = '${device.id}';
const TOKEN = '${config.accessToken}';

async function main() {
  try {
    const result = await exec('TurnOnRequest', DEVICE_ID, TOKEN);
    console.log(result.status === 0 ? '✅ ${device.name}已开启' : '❌ 失败: ' + result.msg);
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

  setChannel: (device, config) => `import { exec } from '../../src/client.js';

const DEVICE_ID = '${device.id}';
const TOKEN = '${config.accessToken}';

async function main() {
  const channel = process.argv[2];
  if (!channel || isNaN(parseInt(channel))) {
    console.error('❌ 请指定频道号');
    process.exit(1);
  }
  
  const value = parseInt(channel);
  
  try {
    const result = await exec('SetChannelRequest', DEVICE_ID, TOKEN, {
      channel: { number: value }
    });
    console.log(result.status === 0 ? '✅ ${device.name}已切换到频道 ' + value : '❌ 失败: ' + result.msg);
    process.exit(result.status === 0 ? 0 : 1);
  } catch (error) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  }
}

main();
`,

  incrementChannel: (device, config) => `import { exec } from '../../src/client.js';

const DEVICE_ID = '${device.id}';
const TOKEN = '${config.accessToken}';

async function main() {
  try {
    const result = await exec('IncrementChannelRequest', DEVICE_ID, TOKEN);
    console.log(result.status === 0 ? '✅ ${device.name}已切换到下一频道' : '❌ 失败: ' + result.msg);
    process.exit(result.status === 0 ? 0 : 1);
  } catch (error) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  }
}

main();
`,

  decrementChannel: (device, config) => `import { exec } from '../../src/client.js';

const DEVICE_ID = '${device.id}';
const TOKEN = '${config.accessToken}';

async function main() {
  try {
    const result = await exec('DecrementChannelRequest', DEVICE_ID, TOKEN);
    console.log(result.status === 0 ? '✅ ${device.name}已切换到上一频道' : '❌ 失败: ' + result.msg);
    process.exit(result.status === 0 ? 0 : 1);
  } catch (error) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  }
}

main();
`,

  setVolume: (device, config) => `import { exec } from '../../src/client.js';

const DEVICE_ID = '${device.id}';
const TOKEN = '${config.accessToken}';

async function main() {
  const volume = process.argv[2];
  if (!volume || isNaN(parseInt(volume))) {
    console.error('❌ 请指定音量值（0-100）');
    process.exit(1);
  }
  
  const value = parseInt(volume);
  
  try {
    const result = await exec('SetVolumeRequest', DEVICE_ID, TOKEN, {
      volume: { value }
    });
    console.log(result.status === 0 ? '✅ ${device.name}音量已设为 ' + value : '❌ 失败: ' + result.msg);
    process.exit(result.status === 0 ? 0 : 1);
  } catch (error) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  }
}

main();
`,

  incrementVolume: (device, config) => `import { exec } from '../../src/client.js';

const DEVICE_ID = '${device.id}';
const TOKEN = '${config.accessToken}';

async function main() {
  const delta = process.argv[2] || '5';
  
  try {
    const result = await exec('IncrementVolumeRequest', DEVICE_ID, TOKEN, {
      deltaVolume: { value: parseInt(delta) }
    });
    console.log(result.status === 0 ? '✅ ${device.name}音量已增加' : '❌ 失败: ' + result.msg);
    process.exit(result.status === 0 ? 0 : 1);
  } catch (error) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  }
}

main();
`,

  decrementVolume: (device, config) => `import { exec } from '../../src/client.js';

const DEVICE_ID = '${device.id}';
const TOKEN = '${config.accessToken}';

async function main() {
  const delta = process.argv[2] || '5';
  
  try {
    const result = await exec('DecrementVolumeRequest', DEVICE_ID, TOKEN, {
      deltaVolume: { value: parseInt(delta) }
    });
    console.log(result.status === 0 ? '✅ ${device.name}音量已降低' : '❌ 失败: ' + result.msg);
    process.exit(result.status === 0 ? 0 : 1);
  } catch (error) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  }
}

main();
`,

  mute: (device, config) => `import { exec } from '../../src/client.js';

const DEVICE_ID = '${device.id}';
const TOKEN = '${config.accessToken}';

async function main() {
  try {
    const result = await exec('SetMuteRequest', DEVICE_ID, TOKEN, {
      mute: true
    });
    console.log(result.status === 0 ? '✅ ${device.name}已静音' : '❌ 失败: ' + result.msg);
    process.exit(result.status === 0 ? 0 : 1);
  } catch (error) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  }
}

main();
`,

  unmute: (device, config) => `import { exec } from '../../src/client.js';

const DEVICE_ID = '${device.id}';
const TOKEN = '${config.accessToken}';

async function main() {
  try {
    const result = await exec('SetMuteRequest', DEVICE_ID, TOKEN, {
      mute: false
    });
    console.log(result.status === 0 ? '✅ ${device.name}已取消静音' : '❌ 失败: ' + result.msg);
    process.exit(result.status === 0 ? 0 : 1);
  } catch (error) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  }
}

main();
`
};

export default TVTemplates;
