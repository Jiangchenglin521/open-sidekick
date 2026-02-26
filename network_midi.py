#!/usr/bin/env python3
"""
美丽的神话 - 实时吉他伴奏
使用 Network MIDI 发送给 GarageBand
"""
import socket
import struct
import time

# Apple MIDI 网络协议 (RTP-MIDI)
# 简化版：直接发送 UDP 到 GarageBand

class SimpleNetworkMidi:
    def __init__(self, host='127.0.0.1', port=5004):
        self.host = host
        self.port = port
        self.sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        
    def note_on(self, channel, note, velocity):
        """发送音符开"""
        # MIDI 音符开消息: 0x90 | channel, note, velocity
        msg = bytes([0x90 | (channel & 0x0F), note & 0x7F, velocity & 0x7F])
        self.sock.sendto(msg, (self.host, self.port))
        
    def note_off(self, channel, note):
        """发送音符关"""
        msg = bytes([0x80 | (channel & 0x0F), note & 0x7F, 0])
        self.sock.sendto(msg, (self.host, self.port))

# 和弦定义
CHORDS = {
    'G':  [43, 47, 50, 55],
    'D':  [38, 42, 45, 50],
    'Em': [40, 43, 47, 52],
    'C':  [36, 40, 43, 48],
}

def play_chord_live(midi, chord_name, duration=2.0):
    """实时弹奏和弦"""
    notes = CHORDS[chord_name]
    print(f"♪ {chord_name}", end=' ', flush=True)
    
    # 分解和弦
    for note in notes:
        midi.note_on(0, note, 70)
        time.sleep(duration / 8)
        midi.note_off(0, note)
    
    # 保持和弦
    for note in notes:
        midi.note_on(0, note, 60)
    time.sleep(duration * 0.6)
    
    # 释放
    for note in notes:
        midi.note_off(0, note)
    time.sleep(duration * 0.2)
    
    print("✓")

def main():
    print("="*50)
    print("美丽的神话 - 实时吉他伴奏 (Network MIDI)")
    print("="*50)
    print("\n⚠️ 请确保 GarageBand 已打开并设置为接收 MIDI")
    print("3秒后开始...")
    time.sleep(3)
    
    midi = SimpleNetworkMidi()
    
    # 歌曲结构
    song = [
        ('G', 2), ('D', 2), ('Em', 2), ('C', 2),
        ('Em', 2), ('C', 2), ('G', 2), ('D', 2),
    ]
    
    print("\n🎸 开始演奏 (按 Ctrl+C 停止)\n")
    
    try:
        while True:
            for chord, beats in song:
                play_chord_live(midi, chord, beats)
            print("\n--- 循环 ---\n")
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n\n停止")

if __name__ == "__main__":
    main()
