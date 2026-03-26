#!/usr/bin/env python3
"""
依赖管理模块 - 自动检测、创建虚拟环境，并安装Python依赖
"""

import subprocess
import sys
import os
from pathlib import Path
from typing import List, Tuple, Optional


def get_venv_info() -> Tuple[Path, Path]:
    """
    获取虚拟环境信息
    
    Returns:
        (venv_dir, venv_python)
    """
    # 技能目录：脚本所在目录的父目录
    script_dir = Path(__file__).parent
    skill_dir = script_dir.parent
    venv_dir = skill_dir / '.venv'
    venv_python = venv_dir / 'bin' / 'python'
    return venv_dir, venv_python


def check_venv_exists() -> bool:
    """检查虚拟环境是否存在"""
    venv_dir, venv_python = get_venv_info()
    return venv_dir.exists() and venv_python.exists()


def is_using_venv() -> bool:
    """检查当前是否正在使用虚拟环境"""
    _, venv_python = get_venv_info()
    return sys.executable == str(venv_python)


def create_venv() -> bool:
    """
    创建虚拟环境
    
    Returns:
        是否创建成功
    """
    venv_dir, _ = get_venv_info()
    skill_dir = venv_dir.parent
    
    print(f"📦 虚拟环境不存在，正在创建...")
    print(f"   位置: {venv_dir}")
    
    # 优先尝试使用 uv（更快）
    try:
        result = subprocess.run(
            ['uv', 'venv', str(venv_dir)],
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
            [sys.executable, '-m', 'venv', str(venv_dir)],
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


def ensure_venv() -> Tuple[bool, Path]:
    """
    确保虚拟环境存在
    
    Returns:
        (是否成功, venv_python路径)
    """
    _, venv_python = get_venv_info()
    
    if not check_venv_exists():
        if not create_venv():
            return False, venv_python
    
    return True, venv_python


def has_uv() -> bool:
    """检查是否可以使用 uv"""
    try:
        result = subprocess.run(['uv', '--version'], capture_output=True, timeout=5)
        return result.returncode == 0
    except (FileNotFoundError, subprocess.TimeoutExpired):
        return False


def get_pip_cmd(venv_python: Path) -> List[str]:
    """
    获取 pip 命令
    
    优先使用 uv pip（更快），回退到 python -m pip
    
    Args:
        venv_python: 虚拟环境 Python 路径
        
    Returns:
        pip 命令列表
    """
    # 检测是否可以使用 uv pip
    if has_uv():
        # uv pip 需要显式指定 --python 参数来安装到指定虚拟环境
        return ['uv', 'pip', 'install', '--python', str(venv_python)]
    
    # 回退到标准 pip
    return [str(venv_python), "-m", "pip", "install"]


class DependencyManager:
    """依赖管理器 - 自动检查、安装Python包"""
    
    def __init__(self, venv_python: Optional[Path] = None):
        """
        初始化
        
        Args:
            venv_python: 虚拟环境 Python 路径，默认自动检测
        """
        if venv_python is None:
            _, venv_python = get_venv_info()
        self.venv_python = venv_python
        
        self.required_packages = {
            'sentence_transformers': 'sentence-transformers==2.5.1',
            'sklearn': 'scikit-learn==1.4.0',
            'scipy': 'scipy==1.12.0',
            'numpy': 'numpy==1.26.4',
            'PyPDF2': 'PyPDF2>=3.0.0',
            'docx': 'python-docx>=0.8.11',
        }
        self.mirrors = [
            "https://pypi.org/simple",  # 默认源
            "https://mirrors.aliyun.com/pypi/simple/",  # 阿里云
            "https://pypi.tuna.tsinghua.edu.cn/simple/",  # 清华源
            "https://pypi.mirrors.ustc.edu.cn/simple/",  # 中科大
        ]
    
    def check_package(self, import_name: str) -> bool:
        """检查包是否已安装（使用当前Python环境）"""
        try:
            __import__(import_name)
            return True
        except ImportError:
            return False
    
    def check_all_dependencies(self) -> Tuple[List[str], List[str]]:
        """
        检查所有依赖
        
        Returns:
            (已安装列表, 缺失列表)
        """
        installed = []
        missing = []
        
        for import_name, package_spec in self.required_packages.items():
            if self.check_package(import_name):
                installed.append(package_spec)
            else:
                missing.append(package_spec)
        
        return installed, missing
    
    def install_package(self, package_spec: str, index_url: Optional[str] = None) -> bool:
        """
        安装单个包（使用虚拟环境的pip）
        
        Args:
            package_spec: 包规格（如 'numpy==1.26.4'）
            index_url: 可选的镜像源URL
            
        Returns:
            是否安装成功
        """
        # 获取 pip 命令（优先 uv pip）
        cmd = get_pip_cmd(self.venv_python) + [package_spec]
        
        # uv pip 不需要 --quiet，标准 pip 需要
        if not has_uv():
            cmd.append("--quiet")
        
        if index_url and index_url != self.mirrors[0]:
            cmd.extend(["-i", index_url])
            print(f"      使用镜像源: {index_url}")
        
        try:
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=120
            )
            return result.returncode == 0
        except subprocess.TimeoutExpired:
            print(f"      ⚠️ 安装超时")
            return False
        except Exception as e:
            print(f"      ⚠️ 安装出错: {e}")
            return False
    
    def install_with_fallback(self, package_spec: str) -> bool:
        """
        安装包，失败时自动切换国内源
        
        Args:
            package_spec: 包规格
            
        Returns:
            是否安装成功
        """
        package_name = package_spec.split('==')[0].split('>=')[0]
        print(f"    📦 安装 {package_name}...")
        
        # 尝试每个镜像源
        for i, mirror in enumerate(self.mirrors):
            if i == 0:
                print(f"      尝试官方源...")
            else:
                print(f"      尝试国内镜像源...")
            
            if self.install_package(package_spec, mirror):
                print(f"      ✅ {package_name} 安装成功")
                return True
            else:
                if i < len(self.mirrors) - 1:
                    print(f"      ⚠️ 失败，切换镜像源...")
        
        print(f"      ❌ {package_name} 安装失败，已尝试所有镜像源")
        return False
    
    def ensure_dependencies(self, auto_install: bool = True) -> bool:
        """
        确保所有依赖已安装
        
        Args:
            auto_install: 是否自动安装缺失的依赖
            
        Returns:
            是否所有依赖都已就绪
        """
        print("🔍 检查Python依赖...")
        
        installed, missing = self.check_all_dependencies()
        
        if not missing:
            print(f"  ✅ 所有依赖已就绪 ({len(installed)} 个)")
            return True
        
        print(f"  ⚠️ 发现 {len(missing)} 个缺失依赖:")
        for pkg in missing:
            print(f"    - {pkg}")
        
        if not auto_install:
            return False
        
        print(f"\n📥 开始自动安装缺失依赖...")
        print(f"   使用虚拟环境: {self.venv_python}")
        failed = []
        
        for package_spec in missing:
            if not self.install_with_fallback(package_spec):
                failed.append(package_spec)
        
        if failed:
            print(f"\n❌ 以下依赖安装失败，请手动安装:")
            for pkg in failed:
                print(f"    {self.venv_python} -m pip install {pkg}")
            return False
        
        # 如果当前使用的是虚拟环境，重新检查依赖
        if sys.executable == str(self.venv_python):
            print(f"\n🔄 重新检查依赖...")
            installed, missing = self.check_all_dependencies()
            if missing:
                print(f"\n⚠️ 安装后仍有问题，请检查环境")
                return False
        else:
            # 当前不在虚拟环境中，依赖已安装到虚拟环境
            print(f"\n✅ 依赖已安装到虚拟环境")
            return True
        
        print(f"\n✅ 所有依赖安装完成！")
        return True


def ensure_deps() -> bool:
    """
    便捷函数：确保虚拟环境和依赖都已就绪
    
    流程：
    1. 检查虚拟环境是否存在，不存在则创建
    2. 检查依赖，缺失则安装
    3. 如果当前不在虚拟环境中但依赖已安装，提示用户使用虚拟环境
    
    Returns:
        是否所有依赖都已就绪
    """
    # 步骤1：确保虚拟环境存在
    success, venv_python = ensure_venv()
    if not success:
        print("❌ 虚拟环境创建失败，无法继续")
        return False
    
    # 检查当前是否在虚拟环境中
    currently_in_venv = is_using_venv()
    
    # 步骤2：确保依赖已安装
    manager = DependencyManager(venv_python)
    deps_ok = manager.ensure_dependencies(auto_install=True)
    
    # 如果依赖安装成功，但当前不在虚拟环境中，给出提示
    if deps_ok and not currently_in_venv:
        print(f"\n💡 提示: 依赖已安装到虚拟环境")
        print(f"   虚拟环境: {venv_python}")
        print(f"   建议使用虚拟环境运行脚本:")
        print(f"   {venv_python} {sys.argv[0]}")
        # 返回 True，因为依赖确实安装好了
        return True
    
    return deps_ok


def warn_if_not_using_venv():
    """如果未使用虚拟环境，打印警告"""
    venv_dir, venv_python = get_venv_info()
    
    if not check_venv_exists():
        print(f"⚠️  虚拟环境不存在，已自动创建: {venv_dir}")
        return
    
    if not is_using_venv():
        print(f"⚠️  警告: 未使用虚拟环境的 Python")
        print(f"   当前: {sys.executable}")
        print(f"   应使用: {venv_python}")
        print(f"   建议: 使用虚拟环境运行以获得最佳兼容性")


if __name__ == "__main__":
    success = ensure_deps()
    sys.exit(0 if success else 1)
