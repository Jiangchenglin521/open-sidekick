/**
 * 设备注册表
 * 管理设备映射和查找
 */

export class DeviceRegistry {
  constructor(devicesConfig) {
    this.devices = new Map();
    this.aliases = new Map();
    this.loadDevices(devicesConfig);
  }
  
  /**
   * 加载设备配置
   */
  loadDevices(config) {
    for (const [name, info] of Object.entries(config)) {
      const device = {
        name,
        id: info.id,
        type: info.type || 'LIGHT',
        room: info.room || '默认',
        description: info.description || name,
        ...info
      };
      
      this.devices.set(name, device);
      
      // 注册别名
      this.aliases.set(name.toLowerCase(), device);
      if (info.aliases) {
        for (const alias of info.aliases) {
          this.aliases.set(alias.toLowerCase(), device);
        }
      }
    }
  }
  
  /**
   * 查找设备
   * @param {string} hint - 设备名称提示
   * @param {string} room - 房间上下文（可选）
   */
  findDevice(hint, room = null) {
    const normalized = hint.toLowerCase().trim();
    
    // 1. 精确匹配
    if (this.aliases.has(normalized)) {
      return this.aliases.get(normalized);
    }
    
    // 2. 房间过滤 + 模糊匹配
    const candidates = [];
    for (const [name, device] of this.devices) {
      // 房间匹配
      if (room && device.room !== room) {
        continue;
      }
      
      // 名称包含
      if (name.includes(hint) || hint.includes(name)) {
        candidates.push(device);
        continue;
      }
      
      // 描述包含
      if (device.description?.includes(hint)) {
        candidates.push(device);
      }
    }
    
    if (candidates.length === 1) {
      return candidates[0];
    }
    
    if (candidates.length > 1) {
      // 返回第一个，但可以提示有多个匹配
      return { ...candidates[0], _ambiguous: true, _candidates: candidates };
    }
    
    // 3. 尝试从云端获取（如果没找到）
    return null;
  }
  
  /**
   * 按房间查找设备
   */
  findByRoom(room) {
    const results = [];
    for (const device of this.devices.values()) {
      if (device.room === room) {
        results.push(device);
      }
    }
    return results;
  }
  
  /**
   * 按类型查找设备
   */
  findByType(type) {
    const results = [];
    for (const device of this.devices.values()) {
      if (device.type === type) {
        results.push(device);
      }
    }
    return results;
  }
  
  /**
   * 获取所有设备
   */
  getAllDevices() {
    return Array.from(this.devices.values());
  }
  
  /**
   * 添加设备
   */
  addDevice(name, info) {
    this.devices.set(name, { name, ...info });
    this.aliases.set(name.toLowerCase(), this.devices.get(name));
  }
  
  /**
   * 删除设备
   */
  removeDevice(name) {
    this.devices.delete(name);
    this.aliases.delete(name.toLowerCase());
  }
}
