// 学号：2024214572 姓名：杨沛鑫
/**
 * 星云日志 - 通用悬停预览系统
 * 模块名称: preview-system
 * 功能描述: 为任意元素提供统一的图片悬停预览功能，支持单例模式与延迟预加载
 * 依赖: 无（纯原生JavaScript，兼容ES5+）
 * 版本: v1.1.0
 */

// ==================== 配置常量 ====================
/**
 * 预览系统全局配置
 * @constant {Object} PREVIEW_CONFIG
 * @property {number} maxWidthRatio - 最大宽度占视口宽度比例
 * @property {number} maxHeightRatio - 最大高度占视口高度比例
 * @property {number} preloadDelay - 悬停延迟触发时间（毫秒）
 */
const PREVIEW_CONFIG = {
    maxWidthRatio: 0.85,
    maxHeightRatio: 0.85,
    preloadDelay: 150
};

// ==================== 状态管理（单例模式） ====================
/**
 * 预览系统状态管理对象
 * @constant {Object} previewState
 * @property {boolean} isShown - 预览显示状态
 * @property {boolean} isLoading - 加载中状态锁，防止重复触发
 * @property {HTMLElement|null} currentElement - 当前触发预览的元素
 * @property {HTMLElement|null} previewContainer - 全局预览容器单例
 * @property {number|null} preloadTimer - 延迟加载定时器句柄
 */
const previewState = {
    isShown: false,
    isLoading: false,
    currentElement: null,
    previewContainer: null,
    preloadTimer: null
};

// ==================== 边缘颜色提取 ====================
/**
 * 边缘色缓存
 * @description 以图片URL为键，缓存提取的边缘平均RGB值，避免重复Canvas计算
 * @type {Object<string, {r: number, g: number, b: number}|null>}
 */
var edgeColorCache = {};

/**
 * 提取图片四周边缘区域的平均颜色
 * @description 使用离屏Canvas读取边缘像素（四周各5%宽/高），计算平均RGB
 *              跨域图片若无CORS头则getImageData会抛出SecurityError，此时回退null
 * @param {string} src - 图片URL
 * @returns {Promise<{r: number, g: number, b: number}|null>} 平均RGB对象，失败返回null
 */
function extractEdgeColor(src) {
    if (edgeColorCache.hasOwnProperty(src)) {
        return Promise.resolve(edgeColorCache[src]);
    }

    return new Promise(function (resolve) {
        var img = new Image();
        img.crossOrigin = 'anonymous';

        img.onload = function () {
            var color = null;
            try {
                var canvas = document.createElement('canvas');
                var w = img.naturalWidth;
                var h = img.naturalHeight;
                canvas.width = w;
                canvas.height = h;
                var ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);

                var ew = Math.max(Math.floor(w * 0.05), 2);
                var eh = Math.max(Math.floor(h * 0.05), 2);
                var r = 0, g = 0, b = 0, count = 0;

                function sample(sx, sy, sw, sh) {
                    try {
                        var data = ctx.getImageData(sx, sy, sw, sh).data;
                        for (var i = 0; i < data.length; i += 4) {
                            r += data[i];
                            g += data[i + 1];
                            b += data[i + 2];
                            count++;
                        }
                    } catch (e) { /* 跳过此区域 */ }
                }

                // 上边
                sample(0, 0, w, eh);
                // 下边
                sample(0, h - eh, w, eh);
                // 左边（排除上下已采样区域）
                sample(0, eh, ew, h - eh * 2);
                // 右边（排除上下已采样区域）
                sample(w - ew, eh, ew, h - eh * 2);

                if (count > 0) {
                    color = {
                        r: Math.round(r / count),
                        g: Math.round(g / count),
                        b: Math.round(b / count)
                    };
                }
            } catch (e) {
                // CORS 安全错误：跨域图片且无 Access-Control-Allow-Origin 头
                color = null;
            }

            edgeColorCache[src] = color;

            // 防止缓存无限增长：超过100条时清空
            var keys = Object.keys(edgeColorCache);
            if (keys.length > 100) {
                edgeColorCache = {};
            }

            resolve(color);
        };

        img.onerror = function () {
            edgeColorCache[src] = null;
            resolve(null);
        };

        img.src = src;
    });
}

/**
 * 将边缘色应用到预览图片元素
 * @description 通过行内样式设置border-color与box-shadow，覆盖CSS默认星云绿
 * @param {HTMLElement} imgEl - 预览<img>元素
 * @param {{r: number, g: number, b: number}|null} color - 边缘色，null则回退CSS默认
 */
function applyEdgeColorToPreview(imgEl, color) {
    if (color) {
        var borderColor = 'rgb(' + color.r + ',' + color.g + ',' + color.b + ')';
        var glowColor = 'rgba(' + color.r + ',' + color.g + ',' + color.b + ',0.5)';
        var outerGlow = 'rgba(' + color.r + ',' + color.g + ',' + color.b + ',0.2)';
        imgEl.style.borderColor = borderColor;
        imgEl.style.boxShadow = '0 0 60px ' + glowColor + ', 0 0 120px ' + outerGlow;
    } else {
        // 回退：清空行内样式，由CSS类中的默认星云绿接管
        imgEl.style.borderColor = '';
        imgEl.style.boxShadow = '';
    }
}

// ==================== 核心功能函数 ====================

/**
 * 创建全局预览容器（单例模式）
 * @description 挂载到document.documentElement避免z-index层叠问题，确保只创建一次
 * @returns {HTMLElement} 预览容器元素
 */
function createGlobalPreviewContainer() {
    if (previewState.previewContainer) {
        return previewState.previewContainer;
    }

    const container = document.createElement('div');
    container.className = 'preview-container-global';
    container.innerHTML = `
        <img class="preview-image-global" 
             src="" 
             alt="预览图片"
             loading="lazy">
    `;
    document.documentElement.appendChild(container);
    previewState.previewContainer = container;
    return container;
}

/**
 * 预加载图片资源（Promise封装）
 * @description 异步加载图片，支持超时控制与错误处理，失败时静默处理
 * @param {string} src - 图片URL地址
 * @param {number} [timeout=10000] - 加载超时时间（毫秒），默认10秒
 * @returns {Promise<{src: string, width: number, height: number}>} 成功返回图片信息对象
 */
function preloadImage(src, timeout = 10000) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const timer = setTimeout(() => reject(new Error('加载超时')), timeout);

        img.onload = () => {
            clearTimeout(timer);
            // 修复：如果图片自然宽高为 0，说明实际加载失败，直接拒绝
            if (img.naturalWidth === 0 || img.naturalHeight === 0) {
                reject(new Error('图片加载异常或跨域失败导致宽高为0'));
                return;
            }
            resolve({
                src: src,
                width: img.naturalWidth,
                height: img.naturalHeight
            });
            };
        img.onerror = () => reject(new Error('图片加载失败'));
        img.src = src;
    });
}

/**
 * 显示预览（带加载状态指示）
 * @description 加载完成后显示预览容器，为触发元素添加加载动画
 * @param {HTMLElement} element - 触发预览的DOM元素
 * @param {string} src - 高清图片URL
 */
function showPreview(element, src) {
    // 防止重复触发加载
    if (previewState.isLoading) {
        return;
    }
    
    previewState.isLoading = true;
    previewState.currentElement = element;
    element.classList.add('preview-loading');

    const previewContainer = createGlobalPreviewContainer();
    const previewImage = previewContainer.querySelector('.preview-image-global');

    preloadImage(src)
        .then((imgInfo) => {
            previewImage.src = src;

            // 根据图片原始尺寸计算容器大小，约束至视口比例内
            var maxW = Math.floor(window.innerWidth * PREVIEW_CONFIG.maxWidthRatio);
            var maxH = Math.floor(window.innerHeight * PREVIEW_CONFIG.maxHeightRatio);
            var w = imgInfo.width;
            var h = imgInfo.height;

            // 等比缩放：宽度或高度超出约束时按比例缩小
            if (w > maxW) {
                h = Math.floor(h * (maxW / w));
                w = maxW;
            }
            if (h > maxH) {
                w = Math.floor(w * (maxH / h));
                h = maxH;
            }

            previewContainer.style.width = w + 'px';
            previewContainer.style.height = h + 'px';

            requestAnimationFrame(() => {
                previewContainer.classList.add('show');
                previewState.isShown = true;
            });

            // 提取图片边缘色并动态应用边框光效（异步，不影响预览即时显示）
            extractEdgeColor(src).then(function (edgeColor) {
                applyEdgeColorToPreview(previewImage, edgeColor);
            });
        })
        .catch(error => {
            // 静默处理错误，不干扰用户体验
            console.warn('预览加载失败:', error);
        })
        .finally(() => {
            // 恢复状态，无论成功或失败
            element.classList.remove('preview-loading');
            previewState.isLoading = false;
        });
}

/**
 * 隐藏预览（带淡出动画）
 * @description 移除显示状态并清空图片源，确保DOM不残留资源
 */
function hidePreview() {
    if (!previewState.previewContainer) {
        return;
    }
    
    const previewContainer = previewState.previewContainer;
    previewContainer.classList.remove('show');
    previewState.isShown = false;
    previewState.currentElement = null;

    // 延迟清空图片源与容器尺寸，确保300ms淡出动画完成
    setTimeout(() => {
        const previewImage = previewContainer.querySelector('.preview-image-global');
        if (previewImage) {
            previewImage.src = '';
        }
        previewContainer.style.width = '';
        previewContainer.style.height = '';
    }, 300);
}

/**
 * 初始化指定元素的预览功能
 * @description 为匹配选择器的所有元素附加悬停预览事件，支持动态添加元素
 * @param {string} selector - CSS选择器（如'.preview-trigger'）
 */
function initializePreview(selector) {
    const elements = document.querySelectorAll(selector);
    
    elements.forEach(element => {
        const previewSrc = element.dataset.previewSrc;
        
        // 防御性检查：确保元素包含必要的数据属性
        if (!previewSrc) {
            console.warn('预览触发器缺少data-preview-src属性:', element);
            return;
        }

        // 使用mouseenter/mouseleave避免子元素干扰
        element.addEventListener('mouseenter', function() {
            if (previewState.preloadTimer) {
                clearTimeout(previewState.preloadTimer);
            }
            previewState.preloadTimer = setTimeout(
                () => showPreview(this, previewSrc), 
                PREVIEW_CONFIG.preloadDelay
            );
        });

        element.addEventListener('mouseleave', function(e) {
            // 清除延迟定时器
            if (previewState.preloadTimer) {
                clearTimeout(previewState.preloadTimer);
                previewState.preloadTimer = null;
            }
            // 确保鼠标离开元素本身而非子元素
            if (!this.contains(e.relatedTarget)) {
                hidePreview();
            }
        });

        // 点击元素时隐藏预览（避免遮挡跳转）
        element.addEventListener('click', () => hidePreview());
    });
}

// ==================== 全局事件监听 ====================
/**
 * ESC键全局隐藏预览
 * @description 键盘可访问性支持，按ESC键关闭预览
 */
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && previewState.isShown) {
        hidePreview();
    }
});

// ==================== 模块初始化 ====================
/**
 * DOM内容加载完成后自动初始化所有预览触发器
 * @description 使用DOMContentLoaded确保元素已渲染
 */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        initializePreview('.preview-trigger');
    });
} else {
    // DOM已准备就绪（脚本异步加载场景）
    initializePreview('.preview-trigger');
}

// ==================== 轮播图模块 ====================
/**
 * 首页轮播图控制器
 * 模块名称: carousel
 * 功能描述: 自动轮播、指示点跳转、箭头切换、悬停暂停
 * 版本: v1.0.0
 */
(function () {
    var carousel = document.getElementById('mainCarousel');
    if (!carousel) return; // 非首页无轮播，安全退出

    // ----- 配置 -----
    var AUTO_PLAY_INTERVAL = 4000;   // 自动播放间隔（毫秒）
    var TRANSITION_DURATION = 600;   // CSS 过渡时长（毫秒），需与 .carousel-slide transition 一致

    // ----- DOM 引用 -----
    var slides = carousel.querySelectorAll('.carousel-slide');
    var dots = carousel.querySelectorAll('.carousel-dot');
    var arrowLeft = carousel.querySelector('.carousel-arrow--left');
    var arrowRight = carousel.querySelector('.carousel-arrow--right');
    var slideCount = slides.length;

    // ----- 状态 -----
    var currentIndex = 0;    // 当前显示幻灯片索引
    var timer = null;        // 自动播放定时器句柄
    var isTransitioning = false; // 过渡锁，防止快速点击导致动画重叠

    // ----- 核心函数 -----

    /**
     * 切换到指定索引的幻灯片
     * @param {number} newIndex - 目标索引（0-based）
     */
    function goTo(newIndex) {
        // 边界循环 + 过渡锁
        if (isTransitioning || newIndex === currentIndex) return;
        isTransitioning = true;

        // 移除当前激活态
        slides[currentIndex].classList.remove('active');
        dots[currentIndex].classList.remove('active');

        // 设置新激活态
        currentIndex = newIndex;
        slides[currentIndex].classList.add('active');
        dots[currentIndex].classList.add('active');

        // 过渡完成后释放锁
        setTimeout(function () {
            isTransitioning = false;
        }, TRANSITION_DURATION);
    }

    /** 下一张 */
    function next() {
        var nextIndex = (currentIndex + 1) % slideCount;
        goTo(nextIndex);
    }

    /** 上一张 */
    function prev() {
        var prevIndex = (currentIndex - 1 + slideCount) % slideCount;
        goTo(prevIndex);
    }

    // ----- 自动播放 -----
    function startAutoPlay() {
        stopAutoPlay();
        timer = setInterval(next, AUTO_PLAY_INTERVAL);
    }

    function stopAutoPlay() {
        if (timer) {
            clearInterval(timer);
            timer = null;
        }
    }

    // ----- 事件绑定 -----

    // 箭头点击
    if (arrowLeft) {
        arrowLeft.addEventListener('click', function () {
            prev();
            startAutoPlay(); // 手动切换后重置计时器
        });
    }
    if (arrowRight) {
        arrowRight.addEventListener('click', function () {
            next();
            startAutoPlay();
        });
    }

    // 指示点点击
    dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
            var targetIndex = parseInt(this.getAttribute('data-index'), 10);
            if (!isNaN(targetIndex)) {
                goTo(targetIndex);
                startAutoPlay();
            }
        });
    });

    // 悬停暂停
    carousel.addEventListener('mouseenter', function () {
        stopAutoPlay();
    });
    carousel.addEventListener('mouseleave', function () {
        startAutoPlay();
    });

    // 页面不可见时暂停，切回时恢复（节省资源）
    document.addEventListener('visibilitychange', function () {
        if (document.hidden) {
            stopAutoPlay();
        } else {
            startAutoPlay();
        }
    });

    // ----- 启动 -----
    startAutoPlay();
})();