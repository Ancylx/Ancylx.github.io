# update_gallery.py - 增量更新 gallery.html，仅添加新图片，避免重复；新图片带 alt 文件名

import os
import re

# ---------------------------- 配置 ----------------------------
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.dirname(os.path.dirname(SCRIPT_DIR))

GALLERY_DIR = os.path.join(ROOT_DIR, "images", "gallery")
HTML_PATH = os.path.join(ROOT_DIR, "pages", "gallery", "gallery.html")

FILENAME_REGEX = re.compile(
    r'^GalleryV1_(\d{8}_\d{6}_\d{4})_(long|short)\.(jpg|jpeg|png|gif|bmp|tiff|webp)$',
    re.IGNORECASE
)

def find_existing_srcs(html):
    """从 gallery.html 的 photo-grid 中提取所有图片的 src"""
    srcs = set()
    pattern = r'<img[^>]+src="([^"]+)"'
    matches = re.findall(pattern, html)
    for src in matches:
        if src.startswith("/images/gallery/"):
            srcs.add(src)
    return srcs

def find_gallery_images():
    """返回 gallery 目录下所有符合格式的图片文件名，按名称排序"""
    images = []
    try:
        for f in os.listdir(GALLERY_DIR):
            if FILENAME_REGEX.match(f):
                images.append(f)
    except FileNotFoundError:
        print(f"错误：gallery 目录不存在 {GALLERY_DIR}")
        return []
    images.sort()
    return images

def get_indent_from_existing(html):
    """尝试从现有 img 标签中提取缩进，若没有则返回默认 16 空格"""
    match = re.search(r'\n( *?)<img ', html)
    if match:
        return match.group(1)
    return "                "

def generate_img_tag(filename, indent):
    """生成带 alt 属性的 img 标签"""
    parts = filename.rsplit('_', 3)
    category = parts[-1].split('.')[0].lower()
    src = f"/images/gallery/{filename}"
    base_name = os.path.splitext(filename)[0]
    return (
        f'{indent}<img src="{src}"\n'
        f'{indent}     class="photo-item photo-item--{category} preview-trigger" loading="lazy"\n'
        f'{indent}     data-preview-src="{src}" alt="{base_name}">'
    )

def update_html():
    if not os.path.exists(HTML_PATH):
        print(f"错误：gallery.html 不存在 {HTML_PATH}")
        return

    with open(HTML_PATH, "r", encoding="utf-8") as f:
        html = f.read()

    # 1. 获取已有图片的 src 集合
    existing_srcs = find_existing_srcs(html)

    # 2. 获取文件夹中的所有图片
    all_images = find_gallery_images()
    if not all_images:
        print("gallery 文件夹中没有符合格式的图片。")
        return

    # 3. 过滤出新图片
    new_images = []
    for img in all_images:
        src = f"/images/gallery/{img}"
        if src not in existing_srcs:
            new_images.append(img)

    if not new_images:
        print("没有需要添加的新图片，gallery.html 已是最新。")
        return

    print(f"发现 {len(new_images)} 张新图片，准备插入...")

    # 4. 获取缩进样式
    indent = get_indent_from_existing(html)

    # 5. 生成新图片的 HTML 块（带 alt）
    tags = [generate_img_tag(img, indent) for img in new_images]
    new_block = "\n".join(tags)

    # 6. 插入到 photo-grid 内原有内容之后
    pattern = r'(<div class="photo-grid">)(.*?)(</div>)'
    match = re.search(pattern, html, re.DOTALL)
    if not match:
        print("错误：未在 HTML 中找到 <div class=\"photo-grid\">...</div> 结构。")
        return

    old_inner = match.group(2)
    if old_inner and not old_inner.endswith('\n'):
        old_inner += '\n'

    new_inner = old_inner + new_block + '\n' + ' ' * (len(indent) - 4 if len(indent) >= 4 else 0)
    new_html = html[:match.start(2)] + new_inner + html[match.end(2):]

    # 7. 写回文件
    with open(HTML_PATH, "w", encoding="utf-8") as f:
        f.write(new_html)

    print(f"成功添加 {len(new_images)} 张新图片到 gallery.html。")

if __name__ == "__main__":
    update_html()