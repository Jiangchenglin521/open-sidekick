/**
 * 能力中心 - 导出所有设备能力
 * 遵循百度DuerOS官方设备类型规范 - 共21种能力
 */

// ========== 基础能力 ==========
export { SWITCH_CAPABILITY } from './switch.js';
export { LIGHTING_CAPABILITY } from './lighting.js';
export { TEMPERATURE_CAPABILITY } from './temperature.js';

// ========== 环境控制 ==========
export { FAN_SPEED_CAPABILITY } from './fan-speed.js';
export { MODE_CAPABILITY } from './mode.js';
export { HUMIDITY_CAPABILITY } from './humidity.js';

// ========== 媒体控制 ==========
export { VOLUME_CAPABILITY } from './volume.js';
export { TV_CHANNEL_CAPABILITY } from './tv-channel.js';

// ========== 运动控制 ==========
export { DIRECTION_CAPABILITY } from './direction.js';
export { SPEED_CAPABILITY } from './speed.js';
export { HEIGHT_CAPABILITY } from './height.js';
export { FLOOR_CAPABILITY } from './floor.js';

// ========== 设备特性 ==========
export { SUCTION_CAPABILITY } from './suction.js';
export { WATER_LEVEL_CAPABILITY } from './water-level.js';
export { CHARGE_CAPABILITY } from './charge.js';
export { FLOW_CAPABILITY } from './flow.js';
export { GEAR_CAPABILITY } from './gear.js';

// ========== 功能控制 ==========
export { LOCK_CAPABILITY } from './lock.js';
export { PRINT_CAPABILITY } from './print.js';
export { TIMER_CAPABILITY } from './timer.js';
export { RESET_CAPABILITY } from './reset.js';

// 能力映射表（用于快速查找）
export const CAPABILITY_MAP = {
  // 基础控制
  'switch': () => import('./switch.js').then(m => m.SWITCH_CAPABILITY),
  'onoff': () => import('./switch.js').then(m => m.SWITCH_CAPABILITY),
  '开关': () => import('./switch.js').then(m => m.SWITCH_CAPABILITY),
  
  // 灯光
  'lighting': () => import('./lighting.js').then(m => m.LIGHTING_CAPABILITY),
  'light': () => import('./lighting.js').then(m => m.LIGHTING_CAPABILITY),
  '灯光': () => import('./lighting.js').then(m => m.LIGHTING_CAPABILITY),
  '亮度': () => import('./lighting.js').then(m => m.LIGHTING_CAPABILITY),
  '色温': () => import('./lighting.js').then(m => m.LIGHTING_CAPABILITY),
  
  // 温度
  'temperature': () => import('./temperature.js').then(m => m.TEMPERATURE_CAPABILITY),
  'temp': () => import('./temperature.js').then(m => m.TEMPERATURE_CAPABILITY),
  '温度': () => import('./temperature.js').then(m => m.TEMPERATURE_CAPABILITY),
  
  // 风速
  'fanspeed': () => import('./fan-speed.js').then(m => m.FAN_SPEED_CAPABILITY),
  'windspeed': () => import('./fan-speed.js').then(m => m.FAN_SPEED_CAPABILITY),
  '风速': () => import('./fan-speed.js').then(m => m.FAN_SPEED_CAPABILITY),
  
  // 速度（通用）
  'speed': () => import('./speed.js').then(m => m.SPEED_CAPABILITY),
  '速度': () => import('./speed.js').then(m => m.SPEED_CAPABILITY),
  
  // 模式
  'mode': () => import('./mode.js').then(m => m.MODE_CAPABILITY),
  '模式': () => import('./mode.js').then(m => m.MODE_CAPABILITY),
  
  // 电视频道
  'tvchannel': () => import('./tv-channel.js').then(m => m.TV_CHANNEL_CAPABILITY),
  'channel': () => import('./tv-channel.js').then(m => m.TV_CHANNEL_CAPABILITY),
  '频道': () => import('./tv-channel.js').then(m => m.TV_CHANNEL_CAPABILITY),
  
  // 音量
  'volume': () => import('./volume.js').then(m => m.VOLUME_CAPABILITY),
  '音量': () => import('./volume.js').then(m => m.VOLUME_CAPABILITY),
  
  // 锁定
  'lock': () => import('./lock.js').then(m => m.LOCK_CAPABILITY),
  '锁定': () => import('./lock.js').then(m => m.LOCK_CAPABILITY),
  '门锁': () => import('./lock.js').then(m => m.LOCK_CAPABILITY),
  
  // 打印
  'print': () => import('./print.js').then(m => m.PRINT_CAPABILITY),
  '打印': () => import('./print.js').then(m => m.PRINT_CAPABILITY),
  
  // 吸力
  'suction': () => import('./suction.js').then(m => m.SUCTION_CAPABILITY),
  '吸力': () => import('./suction.js').then(m => m.SUCTION_CAPABILITY),
  
  // 水量
  'waterlevel': () => import('./water-level.js').then(m => m.WATER_LEVEL_CAPABILITY),
  'water': () => import('./water-level.js').then(m => m.WATER_LEVEL_CAPABILITY),
  '水量': () => import('./water-level.js').then(m => m.WATER_LEVEL_CAPABILITY),
  
  // 充电
  'charge': () => import('./charge.js').then(m => m.CHARGE_CAPABILITY),
  '充电': () => import('./charge.js').then(m => m.CHARGE_CAPABILITY),
  
  // 方向
  'direction': () => import('./direction.js').then(m => m.DIRECTION_CAPABILITY),
  'camera': () => import('./direction.js').then(m => m.DIRECTION_CAPABILITY),
  '转向': () => import('./direction.js').then(m => m.DIRECTION_CAPABILITY),
  '摄像头': () => import('./direction.js').then(m => m.DIRECTION_CAPABILITY),
  
  // 高度
  'height': () => import('./height.js').then(m => m.HEIGHT_CAPABILITY),
  '高度': () => import('./height.js').then(m => m.HEIGHT_CAPABILITY),
  '升降': () => import('./height.js').then(m => m.HEIGHT_CAPABILITY),
  
  // 定时
  'timer': () => import('./timer.js').then(m => m.TIMER_CAPABILITY),
  '定时': () => import('./timer.js').then(m => m.TIMER_CAPABILITY),
  '倒计时': () => import('./timer.js').then(m => m.TIMER_CAPABILITY),
  
  // 复位
  'reset': () => import('./reset.js').then(m => m.RESET_CAPABILITY),
  '复位': () => import('./reset.js').then(m => m.RESET_CAPABILITY),
  '重置': () => import('./reset.js').then(m => m.RESET_CAPABILITY),
  
  // 楼层
  'floor': () => import('./floor.js').then(m => m.FLOOR_CAPABILITY),
  '楼层': () => import('./floor.js').then(m => m.FLOOR_CAPABILITY),
  '电梯': () => import('./floor.js').then(m => m.FLOOR_CAPABILITY),
  
  // 湿度
  'humidity': () => import('./humidity.js').then(m => m.HUMIDITY_CAPABILITY),
  '湿度': () => import('./humidity.js').then(m => m.HUMIDITY_CAPABILITY),
  '加湿': () => import('./humidity.js').then(m => m.HUMIDITY_CAPABILITY),
  '除湿': () => import('./humidity.js').then(m => m.HUMIDITY_CAPABILITY),
  
  // 挡位
  'gear': () => import('./gear.js').then(m => m.GEAR_CAPABILITY),
  '挡位': () => import('./gear.js').then(m => m.GEAR_CAPABILITY),
  '档位': () => import('./gear.js').then(m => m.GEAR_CAPABILITY),
  
  // 水流
  'flow': () => import('./flow.js').then(m => m.FLOW_CAPABILITY),
  '水流': () => import('./flow.js').then(m => m.FLOW_CAPABILITY),
  '流量': () => import('./flow.js').then(m => m.FLOW_CAPABILITY)
};

// 所有能力列表（共21种）
export const ALL_CAPABILITIES = [
  // 1. 打开关闭设备
  'switch',
  // 2. 可控灯光设备
  'lighting',
  // 3. 可控温度设备
  'temperature',
  // 4. 可控风速设备
  'fanSpeed',
  // 5. 可控速度设备
  'speed',
  // 6. 设备模式设置
  'mode',
  // 7. 电视频道设置
  'tvChannel',
  // 8. 可控音量设备
  'volume',
  // 9. 可锁定设备
  'lock',
  // 10. 打印设备
  'print',
  // 11. 可控吸力设备
  'suction',
  // 12. 可控水量设备
  'waterLevel',
  // 13. 可控电量设备
  'charge',
  // 14. 可控方向设备
  'direction',
  // 15. 可控高度设备
  'height',
  // 16. 可控定时设备
  'timer',
  // 17. 可复位设备
  'reset',
  // 18. 可控楼层设备
  'floor',
  // 19. 可控湿度类设备
  'humidity',
  // 20. 可控挡位类设备
  'gear',
  // 21. 可控水流类设备
  'flow'
];
