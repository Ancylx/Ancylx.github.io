# 给gallery写的批量进行图片横竖图分类+重命名的脚本

import os
import shutil
from PIL import Image

# 支持的图片扩展名
IMAGE_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.webp'}

def get_image_files(root_dir, folder_name):
    """返回指定文件夹下所有图片的完整路径列表"""
    folder_path = os.path.join(root_dir, folder_name)
    if not os.path.isdir(folder_path):
        print(f"警告：文件夹不存在 {folder_path}")
        return []
    
    files = []
    for f in os.listdir(folder_path):
        full_path = os.path.join(folder_path, f)
        if os.path.isfile(full_path):
            ext = os.path.splitext(f)[1].lower()
            if ext in IMAGE_EXTENSIONS:
                files.append(full_path)
    return files

def move_with_collision_avoidance(src, dst_dir):
    """
    将文件移动到目标文件夹，如果存在同名文件则自动重命名。
    返回移动后的新路径。
    """
    filename = os.path.basename(src)
    base, ext = os.path.splitext(filename)
    dst_path = os.path.join(dst_dir, filename)
    
    # 如果目标路径已存在，添加数字后缀
    counter = 1
    while os.path.exists(dst_path):
        new_name = f"{base}_{counter}{ext}"
        dst_path = os.path.join(dst_dir, new_name)
        counter += 1
    
    shutil.move(src, dst_path)
    print(f"移动: {src} -> {dst_path}")
    return dst_path

def rename_with_prefix(file_path, prefix):
    """
    将文件重命名为 "{prefix}_原名.扩展名"。
    如果已是以 "{prefix}_" 开头则跳过。
    如果目标文件名存在，添加数字后缀避免冲突。
    返回重命名后的新路径。
    """
    dir_name = os.path.dirname(file_path)
    filename = os.path.basename(file_path)
    base, ext = os.path.splitext(filename)
    
    # 如果文件名已经以 prefix_ 开头，则跳过
    if filename.startswith(f"{prefix}_"):
        print(f"跳过重命名（已有前缀）: {file_path}")
        return file_path
    
    new_filename = f"{prefix}_{base}{ext}"
    new_path = os.path.join(dir_name, new_filename)
    
    # 如果目标名称冲突，在原名后加数字后缀
    if os.path.exists(new_path):
        counter = 1
        while True:
            new_filename = f"{prefix}_{base}_{counter}{ext}"
            new_path = os.path.join(dir_name, new_filename)
            if not os.path.exists(new_path):
                break
            counter += 1
    
    os.rename(file_path, new_path)
    print(f"重命名: {file_path} -> {new_path}")
    return new_path

def process_images():
    # 脚本所在目录
    script_dir = os.path.dirname(os.path.abspath(__file__))
    gallery_dir = os.path.join(script_dir, "images", "gallery")
    long_dir = os.path.join(gallery_dir, "long")
    short_dir = os.path.join(gallery_dir, "short")
    
    # 检查目录
    if not os.path.isdir(long_dir):
        print(f"错误：缺少文件夹 {long_dir}")
        return
    if not os.path.isdir(short_dir):
        print(f"错误：缺少文件夹 {short_dir}")
        return
    
    # 收集所有图片文件（静态列表，避免动态变化干扰）
    long_files = get_image_files(gallery_dir, "long")
    short_files = get_image_files(gallery_dir, "short")
    
    all_files = []
    for f in long_files:
        all_files.append((f, "long"))
    for f in short_files:
        all_files.append((f, "short"))
    
    if not all_files:
        print("没有找到任何图片文件。")
        return
    
    for file_path, current_folder in all_files:
        print(f"\n处理文件: {file_path}")
        try:
            with Image.open(file_path) as img:
                width, height = img.size
        except Exception as e:
            print(f"无法读取图片，跳过: {file_path}，错误: {e}")
            continue
        
        # 1. 分类：长度（高） >= 宽度 → short，否则 → long
        if height >= width:
            target_folder_name = "short"
            target_dir = short_dir
        else:
            target_folder_name = "long"
            target_dir = long_dir
        
        source_dir = os.path.dirname(file_path)
        # 如果当前所在文件夹与目标不一致，则移动
        if source_dir != target_dir:
            file_path = move_with_collision_avoidance(file_path, target_dir)
        else:
            print(f"已在目标文件夹，无需移动。")
        
        # 2. 重命名：当前所在文件夹名为前缀
        file_path = rename_with_prefix(file_path, target_folder_name)
    
    print("\n全部处理完成。")

if __name__ == "__main__":
    process_images()