#!/usr/bin/env python3
"""
生成《美丽的神话》MIDI 伴奏文件
大哥可以在 GarageBand 中导入作为伴奏轨道
"""
from mido import Message, MidiFile, MidiTrack, MetaMessage

# 创建 MIDI 文件
mid = MidiFile()
track = MidiTrack()
mid.tracks.append(track)

# 设置速度 (72 BPM)
#  microseconds per beat = 60,000,000 / BPM
tempo = 60000000 // 72
track.append(MetaMessage('set_tempo', tempo=tempo, time=0))

# 选择乐器 (program change)
# 25 = Acoustic Guitar (steel)
track.append(Message('program_change', program=25, time=0))

# 和弦定义 (MIDI 音符)
CHORDS = {
    'G':  [43, 47, 50, 55],  # G2, B2, D3, G3
    'D':  [38, 42, 45, 50],  # D2, F#2, A2, D3
    'Em': [40, 43, 47, 52],  # E2, G2, B2, E3
    'C':  [36, 40, 43, 48],  # C2, E2, G2, C3
    'Am': [40, 45, 48, 52],  # A2, E3, A3, C4
}

# 美丽的神话 伴奏结构
# 每拍 = 480 ticks
BEAT = 480
BAR = BEAT * 4  # 4/4拍

def add_chord(track, chord_name, duration_bars, velocity=60):
    """添加一个和弦（分解和弦风格）"""
    notes = CHORDS[chord_name]
    ticks_per_note = BAR // len(notes)  # 在一个小节内分解弹奏
    
    for i, note in enumerate(notes):
        # 音符开
        track.append(Message('note_on', note=note, velocity=velocity, 
                           time=0 if i == 0 else ticks_per_note))
        # 音符关
        track.append(Message('note_off', note=note, velocity=0, 
                           time=ticks_per_note - 10))
    
    # 剩余时间（保持节奏）
    remaining = duration_bars * BAR - len(notes) * ticks_per_note
    if remaining > 0:
        track.append(Message('note_off', note=0, velocity=0, time=remaining))

# 构建歌曲
print("生成《美丽的神话》MIDI 伴奏...")

# 前奏
add_chord(track, 'G', 1)
add_chord(track, 'D', 1)
add_chord(track, 'Em', 1)
add_chord(track, 'C', 1)

# 主歌 x2
for _ in range(2):
    add_chord(track, 'Em', 1)
    add_chord(track, 'C', 1)
    add_chord(track, 'G', 1)
    add_chord(track, 'D', 1)

# 副歌
add_chord(track, 'G', 0.5)
add_chord(track, 'D', 0.5)
add_chord(track, 'Em', 0.5)
add_chord(track, 'C', 0.5)
add_chord(track, 'G', 0.5)
add_chord(track, 'D', 0.5)
add_chord(track, 'C', 0.5)
add_chord(track, 'G', 0.5)

# 再一遍主歌
for _ in range(2):
    add_chord(track, 'Em', 1)
    add_chord(track, 'C', 1)
    add_chord(track, 'G', 1)
    add_chord(track, 'D', 1)

# 副歌 + 尾奏
add_chord(track, 'G', 0.5)
add_chord(track, 'D', 0.5)
add_chord(track, 'Em', 0.5)
add_chord(track, 'C', 0.5)
add_chord(track, 'G', 0.5)
add_chord(track, 'D', 0.5)
add_chord(track, 'C', 0.5)
add_chord(track, 'G', 2)  # 延长结束

# 保存文件
output_path = '/Users/jiangchenglin/.openclaw/workspace/美丽的神话_吉他伴奏.mid'
mid.save(output_path)

print(f"✅ 伴奏文件已生成: {output_path}")
print("\n使用方法:")
print("1. 在 Finder 中找到这个文件")
print("2. 拖到 GarageBand 中")
print("3. 会自动创建伴奏轨道")
print("4. 大哥新建人声轨道，跟着唱！")
