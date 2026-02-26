#!/usr/bin/env python3
"""
美丽的神话 - 使用 GarageBand 智能吉他
大哥在 GarageBand 里按这些键，我指挥节奏
"""
import time
import os

# 和弦按键映射 (GarageBand 智能吉他)
# A = Am, S = C, D = D, F = Em, G = G, H = A, J = Bm
CHORD_KEYS = {
    'G': 'g',
    'D': 'd', 
    'Em': 'f',
    'C': 's',
    'Am': 'a',
    'Bm': 'j'
}

# 扫弦节奏型
STRUM_PATTERN = [
    ('down', 0.5),      # 下
    ('down_up', 0.5),   # 下上
    ('up_down_up', 0.5) # 上下上
]

def send_key(key):
    """发送按键到 GarageBand"""
    os.system(f'osascript -e "tell application \\"GarageBand\\" to activate"')
    os.system(f'osascript -e "tell application \\"System Events\\" to keystroke \\"{key}\\""')

def play_chord(chord_name, duration=2.0):
    """弹奏一个和弦"""
    key = CHORD_KEYS.get(chord_name, 'g')
    print(f"♪ {chord_name} (按 {key.upper()} 键)", flush=True)
    
    # 切换和弦
    send_key(key)
    time.sleep(0.2)
    
    # 模拟扫弦节奏
    # 下 - 下上 - 上下上
    strum_speed = duration / 3
    
    # 第一拍：下
    print("  ↓", end='', flush=True)
    time.sleep(strum_speed)
    
    # 第二拍：下上
    print(" ↓↑", end='', flush=True)
    time.sleep(strum_speed)
    
    # 第三拍：上下上
    print(" ↓↑↓↑", flush=True)
    time.sleep(strum_speed)

def main():
    print("="*60)
    print("美丽的神话 - GarageBand 智能吉他伴奏")
    print("="*60)
    print("\n🎸 设置步骤：")
    print("1. 打开 GarageBand")
    print("2. 新建项目 → 选择 '智能吉他'")
    print("3. 确保吉他音色是 '原声吉他'")
    print("4. 回到这里，按回车开始")
    print("\n⚠️ 注意：GarageBand 需要在前台才能接收按键")
    print("="*60)
    
    input("\n设置好了按回车开始...")
    
    # 歌曲结构
    intro = [('G', 2), ('D', 2), ('Em', 2), ('C', 2)]
    verse = [('Em', 2), ('C', 2), ('G', 2), ('D', 2)] * 2
    chorus = [('G', 1), ('D', 1), ('Em', 1), ('C', 1), 
              ('G', 1), ('D', 1), ('C', 1), ('G', 1)]
    
    full_song = intro + verse + chorus + verse + chorus
    
    print("\n🎵 开始演奏！\n")
    print("节奏：下 - 下上 - 上下上")
    print("跟着唱，我会显示按哪个键\n")
    time.sleep(2)
    
    try:
        for chord, beats in full_song:
            play_chord(chord, beats)
        
        print("\n✅ 演奏结束！")
        print("要再唱一遍吗？重新运行程序")
        
    except KeyboardInterrupt:
        print("\n\n停止")

if __name__ == "__main__":
    main()
