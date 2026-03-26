"""
PPTX Pro 输出路径管理模块
统一管理工作区下的 ppt-output 目录
"""

import os
from pathlib import Path


def get_output_dir() -> Path:
    """
    获取PPT输出目录，如果不存在则创建
    
    Returns:
        Path: ppt-output目录路径
    """
    output_dir = Path(os.path.expanduser("~/.openclaw/workspace/ppt-output"))
    output_dir.mkdir(parents=True, exist_ok=True)
    return output_dir


def get_generated_scripts_dir() -> Path:
    """
    获取生成的脚本存放目录
    
    Returns:
        Path: generated-scripts目录路径
    """
    scripts_dir = get_output_dir() / "generated-scripts"
    scripts_dir.mkdir(parents=True, exist_ok=True)
    return scripts_dir


def resolve_output_path(output_file: str, subdir: str = None) -> Path:
    """
    解析输出文件路径，确保在ppt-output目录下
    
    Args:
        output_file: 输出文件名或路径
        subdir: 可选的子目录名
        
    Returns:
        Path: 完整的输出路径
    """
    output_path = Path(output_file)
    
    # 如果已经是绝对路径，直接返回
    if output_path.is_absolute():
        return output_path
    
    # 否则放到ppt-output目录下
    base_dir = get_output_dir()
    
    if subdir:
        base_dir = base_dir / subdir
        base_dir.mkdir(parents=True, exist_ok=True)
    
    return base_dir / output_path


def list_output_files(pattern: str = "*.pptx") -> list:
    """
    列出输出目录下的文件
    
    Args:
        pattern: 文件匹配模式
        
    Returns:
        list: 文件路径列表
    """
    output_dir = get_output_dir()
    return sorted(output_dir.glob(pattern))


def clean_output_dir(confirm: bool = True) -> int:
    """
    清理输出目录
    
    Args:
        confirm: 是否需要确认
        
    Returns:
        int: 删除的文件数量
    """
    output_dir = get_output_dir()
    
    if not output_dir.exists():
        return 0
    
    files = list(output_dir.iterdir())
    
    if not files:
        print("输出目录已为空")
        return 0
    
    if confirm:
        print(f"将删除 {len(files)} 个文件/目录:")
        for f in files[:10]:
            print(f"  - {f.name}")
        if len(files) > 10:
            print(f"  ... 还有 {len(files) - 10} 个")
        
        response = input("确认删除? [y/N]: ")
        if response.lower() != 'y':
            print("已取消")
            return 0
    
    count = 0
    for f in files:
        try:
            if f.is_file():
                f.unlink()
            elif f.is_dir():
                import shutil
                shutil.rmtree(f)
            count += 1
        except Exception as e:
            print(f"删除失败 {f.name}: {e}")
    
    print(f"已清理 {count} 个文件/目录")
    return count


if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "clean":
        clean_output_dir(confirm=True)
    else:
        print(f"PPT输出目录: {get_output_dir()}")
        print(f"生成脚本目录: {get_generated_scripts_dir()}")
        
        files = list_output_files()
        if files:
            print(f"\n现有PPT文件 ({len(files)} 个):")
            for f in files:
                print(f"  - {f.name}")
        else:
            print("\n输出目录为空")
