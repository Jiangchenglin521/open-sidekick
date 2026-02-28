/**
 * DuerOS API 客户端
 */

const BASE_URL = 'https://xiaodu.baidu.com/saiya/smarthome';

export class DuerOSClient {
  constructor(config) {
    this.accessToken = config.accessToken;
    this.refreshToken = config.refreshToken;
    this.expiresAt = config.expiresAt;
  }
  
  /**
   * 获取设备列表
   */
  async getDeviceList() {
    const url = `${BASE_URL}/devicelist?from=h5_control`;
    const headers = {
      'Cookie': `AUTHORIZATION=access-${this.accessToken}`
    };
    
    const response = await fetch(url, { headers });
    const data = await response.json();
    
    if (data.status !== 0) {
      throw new Error(data.msg || '获取设备列表失败');
    }
    
    return data.data?.appliances || [];
  }
  
  /**
   * 发送控制指令
   */
  async sendControl(deviceId, action, params = {}) {
    const url = `${BASE_URL}/directivesend?from=inside`;
    
    const body = {
      header: {
        namespace: 'DuerOS.ConnectedHome.Control',
        name: action,
        payloadVersion: 3
      },
      payload: {
        applianceId: deviceId,
        parameters: {
          proxyConnectStatus: false,
          ...params
        },
        appliance: {
          applianceId: [deviceId]
        }
      }
    };
    
    // 特殊处理亮度
    if (action === 'SetBrightnessPercentageRequest' && params.brightness) {
      body.payload.brightness = { value: params.brightness };
      body.payload.parameters.attribute = 'brightness';
      body.payload.parameters.attributeValue = params.brightness;
    }
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `AUTHORIZATION=access-${this.accessToken}`
      },
      body: JSON.stringify(body)
    });
    
    const data = await response.json();
    
    // 处理特定错误
    if (data.status === 21110) {
      throw new Error('设备离线，请检查电源和网络');
    }
    
    if (data.status !== 0) {
      throw new Error(data.msg || '控制失败');
    }
    
    return data;
  }
  
  /**
   * 刷新 Access Token
   */
  async refreshAccessToken() {
    if (!this.refreshToken) {
      throw new Error('未配置 Refresh Token，无法自动续期');
    }
    
    // 百度 OAuth 刷新接口
    const url = 'https://openapi.baidu.com/oauth/2.0/token';
    const params = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: this.refreshToken,
      client_id: 'YOUR_CLIENT_ID',  // 需要填写
      client_secret: 'YOUR_CLIENT_SECRET'  // 需要填写
    });
    
    const response = await fetch(`${url}?${params}`);
    const data = await response.json();
    
    if (data.error) {
      throw new Error(`刷新失败: ${data.error_description}`);
    }
    
    this.accessToken = data.access_token;
    this.refreshToken = data.refresh_token;
    this.expiresAt = new Date(Date.now() + data.expires_in * 1000).toISOString();
    
    return {
      accessToken: this.accessToken,
      refreshToken: this.refreshToken,
      expiresAt: this.expiresAt
    };
  }
  
  /**
   * 检查 Token 是否过期
   */
  isTokenExpired() {
    if (!this.expiresAt) return false;
    return new Date(this.expiresAt).getTime() < Date.now();
  }
  
  /**
   * 获取 Token 剩余天数
   */
  getTokenRemainingDays() {
    if (!this.expiresAt) return null;
    const diff = new Date(this.expiresAt).getTime() - Date.now();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }
}
