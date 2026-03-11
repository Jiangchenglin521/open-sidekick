/**
 * 窗帘设备模板
 */

export const CurtainTemplates = {
  open: (device, config) => `import { exec } from '../../src/client.js';

const DEVICE_ID = '${device.id}';
const TOKEN = '${config.accessToken}';

async function main() {
  try {
    const result = await exec('TurnOnRequest', DEVICE_ID, TOKEN);
    console.log(result.status === 0 ? '✅ ${device.name}已打开' : '❌ 失败: ' + result.msg);
    process.exit(result.status === 0 ? 0 : 1);
  } catch (error) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  }
}

main();
`,

  close: (device, config) => `import { exec } from '../../src/client.js';

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

  setPosition: (device, config) => `import { exec } from '../../src/client.js';

const DEVICE_ID = '${device.id}';
const TOKEN = '${config.accessToken}';

async function main() {
  const percent = process.argv[2];
  if (!percent || isNaN(parseInt(percent))) {
    console.error('❌ 请指定开合百分比（0-100）');
    process.exit(1);
  }
  
  const value = parseInt(percent);
  if (value < 0 || value > 100) {
    console.error('❌ 百分比应在 0-100 之间');
    process.exit(1);
  }
  
  try {
    const result = await exec('SetPercentageRequest', DEVICE_ID, TOKEN, {
      percentage: { value }
    });
    console.log(result.status === 0 ? '✅ ${device.name}已开到 ' + value + '%' : '❌ 失败: ' + result.msg);
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
    const result = await exec('StopRequest', DEVICE_ID, TOKEN);
    console.log(result.status === 0 ? '✅ ${device.name}已停止' : '❌ 失败: ' + result.msg);
    process.exit(result.status === 0 ? 0 : 1);
  } catch (error) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  }
}

main();
`
};

export default CurtainTemplates;
