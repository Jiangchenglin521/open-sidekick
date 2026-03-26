#!/usr/bin/env python3
"""
虚拟环境管理模块 - 自动检测、创建、使用虚拟环境
"""

import os
import sys
import subprocess
from pathlib import Path


class VenvManager:
    """虚拟环境管理器"""
    
    def __init__(self, skill_dir: str = None):
        """
        初始化
        
        Args:
            skill_dir: 技能目录路径，默认为脚本所在目录的父目录
        """
        if skill_dir is None:
            # 默认：脚本所在目录的父目录
            script_dir = Path(__file__).parent
            skill_dir = script_dir.parent
        
        self.skill_dir = Path(skill_dir)
        self.venv_dir = self.skill_dir / '.venv'
        self.venv_python = self.venv_dir / 'bin' / 'python'
        
    def exists(self) -> bool:
        """检查虚拟环境是否存在"""
        return self.venv_dir.exists() and self.venv_python.exists()
    
    def is_active(self) -> bool:
        """检查当前是否正在使用虚拟环境"""
        return sys.executable == str(self.venv_python)
    
    def create(self) -> bool:
        """
        创建虚拟环境
        
        Returns:
            是否创建成功
        """
        if self.exists():
            print(f"✅ 虚拟环境已存在: {self.venv_dir}")
            return True
        
        print(f"📦 创建虚拟环境...")
        print(f"   位置: {self.venv_dir}")
        
        try:
            # 尝试使用 uv（更快）
            result = subprocess.run(
                ['uv', 'venv', str(self.venv_dir)],
                capture_output=True,
                text=True,
                timeout=60
            )
            if result.returncode == 0:
                print(f"   ✅ 使用 uv 创建成功")
                return True
        except (subprocess.TimeoutExpired, FileNotFoundError):
            pass
        
        # 回退到标准库 venv
        try:
            result = subprocess.run(
                [sys.executable, '-m', 'venv', str(self.venv_dir)],
                capture_output=True,
                text=True,
                timeout=120
            )
            if result.returncode == 0:
                print(f"   ✅ 使用 venv 创建成功")
                return True
            else:
                print(f"   ❌ 创建失败: {result.stderr}")
                return False
        except subprocess.TimeoutExpired:
            print(f"   ❌ 创建超时")
            return False
        except Exception as e:
            print(f"   ❌ 创建出错: {e}")
            return False
    
    def ensure(self, auto_create: bool = True) -> bool:
        """
        确保虚拟环境可用
        
        Args:
            auto_create: 如果不存在是否自动创建
            
        Returns:
            虚拟环境是否可用
        """
        if self.exists():
            return True
        
        if auto_create:
            return self.create()
        
        return False
    
    def get_python_cmd(self) -> list:
        """
        获取虚拟环境的 Python 命令列表
        
        Returns:
            命令列表，如 ['path/to/.venv/bin/python']
        """
        return [str(self.venv_python)]
    
    def run_in_venv(self, script_path: str, args: list = None) -> subprocess.CompletedProcess:
        """
        在虚拟环境中运行脚本
        
        Args:
            script_path: 脚本路径
            args: 额外参数
            
        Returns:
            subprocess.CompletedProcess
        """
        if args is None:
            args = []
        
        cmd = [str(self.venv_python), script_path] + args
        return subprocess.run(cmd, capture_output=True, text=True)
    
    def warn_if_not_using(self):
        """如果未使用虚拟环境，打印警告"""
        if not self.exists():
            print(f"⚠️  虚拟环境不存在: {self.venv_dir}")
            print(f"   建议运行: uv venv 或 python -m venv .venv")
            return
        
        if not self.is_active():
            print(f"⚠️  警告: 未使用虚拟环境的 Python")
            print(f"   当前: {sys.executable}")
            print(f"   应使用: {self.venv_python}")
            print(f"   请使用: {self.venv_python} {sys.argv[0]}")


def ensure_venv(skill_dir: str = None, auto_create: bool = True) -> bool:
    """
    便捷函数：确保虚拟环境存在
    
    Args:
        skill_dir: 技能目录
        auto_create: 是否自动创建
        
    Returns:
        虚拟环境是否可用
    """
    manager = VenvManager(skill_dir)
    return manager.ensure(auto_create)


def get_venv_python(skill_dir: str = None) -> str:
    """
    获取虚拟环境的 Python 路径
    
    Args:
        skill_dir: 技能目录
        
    Returns:
        Python 路径，如果不存在则返回 None
    """
    manager = VenvManager(skill_dir)
    if manager.exists():
        return str(manager.venv_python)
    return None


if __name__ == "__main__":
    # 测试
    manager = VenvManager()
    print(f"虚拟环境目录: {manager.venv_dir}")
    print(f"是否存在: {manager.exists()}")
    print(f"是否激活: {manager.is_active()}")
    
    if not manager.exists():
        print("\n尝试创建...")
        if manager.create():
            print("✅ 创建成功")
        else:
            print("❌ 创建失败")
