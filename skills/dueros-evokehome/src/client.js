/**
 * DuerOS API 客户端
 */

const BASE_URL = 'https://xiaodu.baidu.com/saiya/smarthome';

/**
 * 发送控制指令
 */
export async function exec(actionName, deviceId, token, payload = {}) {
  const body = {
    header: {
      namespace: 'DuerOS.ConnectedHome.Control',
      name: actionName,
      payloadVersion: 3
    },
    payload: {
      applianceId: deviceId,
      parameters: { proxyConnectStatus: false, ...payload },
      appliance: { applianceId: [deviceId] }
    }
  };

  // 特殊参数处理 - 按照 DuerOS ConnectedHome Control 协议
  if (payload.brightness) {
    body.payload.brightness = payload.brightness;
  }
  if (payload.colorTemperatureInKelvin !== undefined) {
    body.payload.colorTemperatureInKelvin = payload.colorTemperatureInKelvin;
  }
  if (payload.deltaPercentage) {
    body.payload.deltaPercentage = payload.deltaPercentage;
  }
  if (payload.mode) {
    body.payload.mode = payload.mode;
  }
  if (payload.temperature) {
    body.payload.targetTemperature = payload.temperature;
  }

  const response = await fetch(`${BASE_URL}/directivesend?from=inside`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': `AUTHORIZATION=access-${token}`
    },
    body: JSON.stringify(body)
  });

  return response.json();
}

/**
 * 获取设备列表
 */
export async function getDeviceList(token) {
  const response = await fetch(`${BASE_URL}/devicelist?from=h5_control`, {
    headers: { 'Cookie': `AUTHORIZATION=access-${token}` }
  });
  return response.json();
}

/**
 * 获取设备状态
 */
export async function getDeviceStatus(deviceId, token) {
  const data = await getDeviceList(token);
  if (data.status !== 0) throw new Error(data.msg);
  
  const device = data.data?.appliances?.find(d => d.applianceId === deviceId);
  if (!device) return null;
  
  const attrs = device.attributes || {};
  return {
    name: device.friendlyName,
    online: attrs.connectivity?.value === 'REACHABLE',
    on: ['ON', 'on'].includes(attrs.turnOnState?.value),
    brightness: attrs.brightness?.value,
    colorTemperature: attrs.colorTemperatureInKelvin?.value,
    temperature: attrs.temperature?.value,
    mode: attrs.mode?.value,
    raw: attrs
  };
}

/**
 * 刷新 Token
 */
export async function refreshToken(refreshToken) {
  const response = await fetch(`${BASE_URL}/refreshtoken`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken })
  });
  return response.json();
}

export default { exec, getDeviceList, getDeviceStatus, refreshToken };
