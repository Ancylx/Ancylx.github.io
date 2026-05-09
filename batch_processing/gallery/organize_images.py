# organize_images.py - 从 unprocessed 读取，分类后合并至 gallery，文件名带分类标识

import os
import shutil
import time
from PIL import Image

IMAGE_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.webp'}

def get_image_files(folder):
    """返回指定文件夹内所有图片的完整路径"""
    if not os.path.isdir(folder):
        print(f"警告：文件夹不存在 {folder}")
        return []
    files = []
    for f in os.listdir(folder):
        full = os.path.join(folder, f)
        if os.path.isfile(full):
            ext = os.path.splitext(f)[1].lower()
            if ext in IMAGE_EXTENSIONS:
                files.append(full)
    return files

def safe_rename(src, dst):
    """重命名文件，若目标已存在则自动加序号避免覆盖"""
    if os.path.exists(dst):
        base, ext = os.path.splitext(dst)
        counter = 1
        while True:
            new_dst = f"{base}_{counter}{ext}"
            if not os.path.exists(new_dst):
                dst = new_dst
                break
            counter += 1
    os.rename(src, dst)
    return dst

def process_images():
    # 目录定位：脚本位于 batch_processing/，与 images/ 同级
    script_dir = os.path.dirname(os.path.abspath(__file__))
    parent_dir = os.path.dirname(os.path.dirname(script_dir))
    gallery_dir = os.path.join(parent_dir, "images", "gallery")
    unprocessed_dir = os.path.join(gallery_dir, "unprocessed")

    if not os.path.isdir(unprocessed_dir):
        print(f"错误：缺少 unprocessed 文件夹 {unprocessed_dir}")
        return
    if not os.path.isdir(gallery_dir):
        print(f"错误：缺少 gallery 文件夹 {gallery_dir}")
        return

    # 统一的“压缩时间”基准（年月日_时分秒）
    run_ts = time.strftime("%Y%m%d_%H%M%S")
    files = get_image_files(unprocessed_dir)

    if not files:
        print("unprocessed 文件夹中没有图片。")
        return

    # 按分类分别独立计数，确保同分类内序号连续
    seq_counters = {"long": 1, "short": 1}

    for file_path in files:
        print(f"\n处理文件: {file_path}")
        try:
            with Image.open(file_path) as img:
                width, height = img.size
        except Exception as e:
            print(f"无法读取图片，跳过: {file_path}，错误: {e}")
            continue

        # ---- 分类逻辑（高度 >= 宽度 → long，否则 → short） ----
        target_category = "long" if height >= width else "short"

        # ---- 第一步：临时重命名（在 unprocessed 内，避免干扰） ----
        ms = int(round(time.time() * 1000)) % 1000
        temp_name = f"GalleryV1_unprocessed_{run_ts}_{ms:03d}"
        _, ext = os.path.splitext(file_path)
        temp_path = os.path.join(unprocessed_dir, f"{temp_name}{ext}")

        new_temp_path = safe_rename(file_path, temp_path)
        print(f"临时重命名: {file_path} -> {new_temp_path}")

        # ---- 第二步：移动到 gallery 根目录，并重命名为最终格式 ----
        seq = seq_counters[target_category]
        while True:
            final_name = f"GalleryV1_{run_ts}_{seq:04d}_{target_category}{ext}"
            final_path = os.path.join(gallery_dir, final_name)
            if not os.path.exists(final_path):
                break
            seq += 1
        seq_counters[target_category] = seq + 1

        shutil.move(new_temp_path, final_path)
        print(f"分类移动: {new_temp_path} -> {final_path}")

    print("\n全部处理完成。")

if __name__ == "__main__":
    process_images()