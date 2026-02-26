#!/usr/bin/env python3
"""
美丽的神话 - 吉他伴奏生成器
发送 MIDI 信号给 GarageBand (库乐队)
"""
import mido
import time
from mido import Message

# 查找可用的 MIDI 输出端口
print("可用 MIDI 端口:")
for name in mido.get_output_names():
    print(f"  - {name}")

# 尝试连接 GarageBand 虚拟端口
try:
    # macOS 上 GarageBand 通常使用 IAC 驱动或虚拟端口
    output_names = mido.get_output_names()
    
    # 找包含 garageband、iac、bus 或 virtual 的端口
    port_name = None
    for name in output_names:
        lower = name.lower()
        if any(k in lower for k in ['garageband', 'iac', 'bus', 'virtual', 'synth']):
            port_name = name
            break
    
    # 如果没找到特定端口，用第一个
    if not port_name and output_names:
        port_name = output_names[0]
    
    if port_name:
        print(f"\n连接到: {port_name}")
        outport = mido.open_output(port_name)
    else:
        print("\n未找到 MIDI 输出端口")
        print("请确保 GarageBand 已打开并启用了 MIDI 输入")
        exit(1)
        
except Exception as e:
    print(f"连接失败: {e}")
    print("提示: 需要在 macOS 的'音频 MIDI 设置'中启用 IAC 驱动")
    exit(1)

# 和弦定义 (吉他分解和弦 - 根音+三音+五音)
# 使用 MIDI 音符编号 (中央C = 60)
CHORDS = {
    'G':  [43, 47, 50, 55],    # G2, B2, D3, G3
    'D':  [38, 42, 45, 50],    # D2, F#2, A2, D3
    'Em': [40, 43, 47, 52],    # E2, G2, B2, E3
    'C':  [36, 40, 43, 48],    # C2, E2, G2, C3
    'Am': [40, 45, 48, 52],    # A1, E2, A2, C3
    'Bm': [42, 47, 50, 54],    # B1, F#2, B2, D3
}

# 美丽的神话 和弦进行 (简化版)
# 主歌: Em - C - G - D
# 副歌: G - D - Em - C - G - D - C - G
SONG_STRUCTURE = [
    # 前奏
    ('G', 4), ('D', 4), ('Em', 4), ('C', 4),
    # 主歌
    ('Em', 4), ('C', 4), ('G', 4), ('D', 4),
    ('Em', 4), ('C', 4), ('G', 4), ('D', 4),
    # 副歌
    ('G', 2), ('D', 2), ('Em', 2), ('C', 2),
    ('G', 2), ('D', 2), ('C', 2), ('G', 2),
]

def play_chord(outport, chord_name, duration_beats, bpm=72):
    """弹奏一个和弦 (分解和弦风格)"""
    notes = CHORDS[chord_name]
    beat_duration = 60.0 / bpm  # 每拍秒数
    
    print(f"♪ {chord_name}", end=' ', flush=True)
    
    # 分解和弦: 根音 → 三音 → 五音 → 高音 (类似吉他指弹)
    for i, note in enumerate(notes):
        # 发送音符开
        outport.send(Message('note_on', note=note, velocity=70))
        # 每个音持续 1/4 拍
        time.sleep(beat_duration / 4)
        # 发送音符关
        outport.send(Message('note_off', note=note, velocity=0))
        
        # 最后一个音稍微延长
        if i == len(notes) - 1:
            time.sleep(beat_duration * (duration_beats - 1))
    
    print("✓")

def main():
    print("\n" + "="*50)
    print("美丽的神话 - 吉他伴奏")
    print("="*50)
    print("\n准备开始...请确保 GarageBand 已打开")
    print("建议在 GarageBand 中选择'吉他'或'原声吉他'音色")
    print("\n3秒后开始...")
    time.sleep(3)
    
    print("\n🎸 开始演奏 (按 Ctrl+C 停止)\n")
    
    try:
        # 循环演奏
        while True:
            for chord, beats in SONG_STRUCTURE:
                play_chord(outport, chord, beats)
            print("\n--- 循环结束，重新开始 ---\n")
            time.sleep(1)
            
    except KeyboardInterrupt:
        print("\n\n停止演奏")
    finally:
        outport.close()
        print("MIDI 连接已关闭")

if __name__ == "__main__":
    main()
