#!/usr/bin/env python3
"""
依赖管理模块 - 自动检查和安装Python依赖
"""

import subprocess
import sys
import os
from typing import List, Tuple, Optional


class DependencyManager:
    """依赖管理器 - 自动检查、安装Python包"""
    
    def __init__(self):
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
        """检查包是否已安装"""
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
        安装单个包
        
        Args:
            package_spec: 包规格（如 'numpy==1.26.4'）
            index_url: 可选的镜像源URL
            
        Returns:
            是否安装成功
        """
        cmd = [sys.executable, "-m", "pip", "install", package_spec, "--quiet"]
        
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
        failed = []
        
        for package_spec in missing:
            if not self.install_with_fallback(package_spec):
                failed.append(package_spec)
        
        if failed:
            print(f"\n❌ 以下依赖安装失败，请手动安装:")
            for pkg in failed:
                print(f"    pip install {pkg}")
            return False
        
        # 重新检查
        installed, missing = self.check_all_dependencies()
        if missing:
            print(f"\n⚠️ 安装后仍有问题，请检查环境")
            return False
        
        print(f"\n✅ 所有依赖安装完成！")
        return True


# 便捷函数
def ensure_deps():
    """便捷函数：确保依赖已安装"""
    manager = DependencyManager()
    return manager.ensure_dependencies(auto_install=True)


if __name__ == "__main__":
    success = ensure_deps()
    sys.exit(0 if success else 1)
