/**
 * 传感器/状态查询模板
 */

export const SensorTemplates = {
  getStatus: (device, config) => `import { getDeviceStatus } from '../../src/client.js';

const DEVICE_ID = '${device.id}';
const TOKEN = '${config.accessToken}';

async function main() {
  try {
    const status = await getDeviceStatus(DEVICE_ID, TOKEN);
    if (!status) {
      console.log('❌ 无法获取设备状态');
      process.exit(1);
    }
    
    const parts = ['📱 ${device.name}'];
    parts.push(status.online ? '🟢 在线' : '🔴 离线');
    if (status.on !== undefined) parts.push(status.on ? '✅ 开启' : '⚫ 关闭');
    if (status.temperature !== undefined) parts.push('🌡️ ' + status.temperature + '°C');
    if (status.humidity !== undefined) parts.push('💧 ' + status.humidity + '%');
    if (status.brightness !== undefined) parts.push('💡 亮度 ' + status.brightness + '%');
    if (status.colorTemperature !== undefined) parts.push('🔆 色温 ' + status.colorTemperature);
    
    console.log(parts.join(' | '));
    process.exit(0);
  } catch (error) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  }
}

main();
`,

  getTemperature: (device, config) => `import { getDeviceStatus } from '../../src/client.js';

const DEVICE_ID = '${device.id}';
const TOKEN = '${config.accessToken}';

async function main() {
  try {
    const status = await getDeviceStatus(DEVICE_ID, TOKEN);
    if (!status || status.temperature === undefined) {
      console.log('❌ ${device.name} 不支持温度查询');
      process.exit(1);
    }
    console.log('🌡️ ${device.name} 温度: ' + status.temperature + '°C');
    process.exit(0);
  } catch (error) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  }
}

main();
`,

  getHumidity: (device, config) => `import { getDeviceStatus } from '../../src/client.js';

const DEVICE_ID = '${device.id}';
const TOKEN = '${config.accessToken}';

async function main() {
  try {
    const status = await getDeviceStatus(DEVICE_ID, TOKEN);
    if (!status || status.humidity === undefined) {
      console.log('❌ ${device.name} 不支持湿度查询');
      process.exit(1);
    }
    console.log('💧 ${device.name} 湿度: ' + status.humidity + '%');
    process.exit(0);
  } catch (error) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  }
}

main();
`,

  getPM25: (device, config) => `import { getDeviceStatus } from '../../src/client.js';

const DEVICE_ID = '${device.id}';
const TOKEN = '${config.accessToken}';

async function main() {
  try {
    const status = await getDeviceStatus(DEVICE_ID, TOKEN);
    if (!status || !status.raw) {
      console.log('❌ 无法获取数据');
      process.exit(1);
    }
    const pm25 = status.raw['pm2.5']?.value;
    if (pm25 === undefined) {
      console.log('❌ ${device.name} 不支持PM2.5查询');
      process.exit(1);
    }
    console.log('😷 ${device.name} PM2.5: ' + pm25);
    process.exit(0);
  } catch (error) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  }
}

main();
`,

  getAirQuality: (device, config) => `import { getDeviceStatus } from '../../src/client.js';

const DEVICE_ID = '${device.id}';
const TOKEN = '${config.accessToken}';

async function main() {
  try {
    const status = await getDeviceStatus(DEVICE_ID, TOKEN);
    if (!status || !status.raw) {
      console.log('❌ 无法获取数据');
      process.exit(1);
    }
    const quality = status.raw.airQuality?.value;
    if (quality === undefined) {
      console.log('❌ ${device.name} 不支持空气质量查询');
      process.exit(1);
    }
    console.log('🍃 ${device.name} 空气质量: ' + quality);
    process.exit(0);
  } catch (error) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  }
}

main();
`
};

export default SensorTemplates;
