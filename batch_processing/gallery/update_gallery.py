# update_gallery.py - 增量更新 gallery.html，仅添加新图片，避免重复

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
    # 匹配 photo-grid 内部的 img 标签，提取 src
    pattern = r'<img[^>]+src="([^"]+)"'
    matches = re.findall(pattern, html)
    for src in matches:
        # 统一转换为相对于根路径的格式，与扫描生成的格式一致
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
    # 匹配第一个 img 标签行，提取行首空格
    match = re.search(r'\n( *?)<img ', html)
    if match:
        return match.group(1)  # 空格字符串
    # 没有 img 标签时，使用 16 空格
    return "                "

def generate_img_tag(filename, indent):
    """生成带缩进的 img 标签"""
    parts = filename.rsplit('_', 3)
    category = parts[-1].split('.')[0].lower()
    src = f"/images/gallery/{filename}"
    return (
        f'{indent}<img src="{src}"\n'
        f'{indent}     class="photo-item photo-item--{category} preview-trigger" loading="lazy"\n'
        f'{indent}     data-preview-src="{src}">'
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

    # 3. 过滤出新图片（文件夹中有但 HTML 中没有的）
    new_images = []
    for img in all_images:
        src = f"/images/gallery/{img}"
        if src not in existing_srcs:
            new_images.append(img)

    if not new_images:
        print("没有需要添加的新图片，gallery.html 已是最新。")
        return

    print(f"发现 {len(new_images)} 张新图片，准备插入...")

    # 4. 获取缩进样式（与现有 img 保持一致）
    indent = get_indent_from_existing(html)

    # 5. 生成新图片的 HTML 块
    tags = [generate_img_tag(img, indent) for img in new_images]
    new_block = "\n".join(tags)

    # 6. 定位 photo-grid 的结束标签 </div>，并在其前插入新内容
    # 使用正则找到整个 photo-grid 块，进行替换
    pattern = r'(<div class="photo-grid">)(.*?)(</div>)'
    match = re.search(pattern, html, re.DOTALL)
    if not match:
        print("错误：未在 HTML 中找到 <div class=\"photo-grid\">...</div> 结构。")
        return

    # 原有中间内容
    old_inner = match.group(2)
    # 确保在新内容前有换行，且不破坏原有缩进
    if old_inner and not old_inner.endswith('\n'):
        old_inner += '\n'

    new_inner = old_inner + new_block + '\n' + ' ' * (len(indent) - 4 if len(indent) >= 4 else 0)
    # 注意：上面为 </div> 前加适当缩进，但原有模板中 </div> 与 <div> 缩进一致
    # 从原 HTML 中提取 </div> 前的缩进，更稳健的方法是直接保留原有缩进，不改变 </div>
    # 我们重建的 </div> 会附带原有缩进？我们替换整个块，所以必须保持 </div> 的缩进与原来相同。
    # 我们可以在匹配的 prefix 和 suffix 中保留原有内容，然后构造新块。
    # 简便方法：用字符串替换，不修改 </div> 原始缩进，而是只替换中间内容。
    # 所以采用以下方式：
    new_html = html[:match.start(2)] + new_inner + html[match.end(2):]
    # 这将在原中间内容后追加新块，并保留原始 </div> 及其缩进，无需额外缩进处理。

    # 7. 写回文件
    with open(HTML_PATH, "w", encoding="utf-8") as f:
        f.write(new_html)

    print(f"成功添加 {len(new_images)} 张新图片到 gallery.html。")

if __name__ == "__main__":
    update_html()