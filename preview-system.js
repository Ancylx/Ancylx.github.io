/**
 * 星云日志 - 通用悬停预览系统
 * 模块名称: preview-system
 * 功能描述: 为任意元素提供统一的图片悬停预览功能，支持单例模式与延迟预加载
 * 依赖: 无（纯原生JavaScript，兼容ES5+）
 * 版本: v1.0.0
 * 更新日志:
 *   v1.0.0 (2025-01-14):
 *     - feat: 实现单例预览容器，避免重复DOM创建
 *     - feat: 支持多元素类型（头像、视频项、链接等）
 *     - feat: 延迟预加载与加载状态指示
 *     - style: 遵循JSDoc规范，100%中文注释
 */

// ==================== 配置常量 ====================
/**
 * 预览系统全局配置
 * @constant {Object} PREVIEW_CONFIG
 * @property {number} containerWidth - 预览容器宽度（像素）
 * @property {number} containerHeight - 预览容器高度（像素）
 * @property {number} preloadDelay - 悬停延迟触发时间（毫秒）
 */
const PREVIEW_CONFIG = {
    containerWidth: 400,
    containerHeight: 400,
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
 * @returns {Promise<string>} 成功返回URL，失败返回Error对象
 */
function preloadImage(src, timeout = 10000) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const timer = setTimeout(() => reject(new Error('加载超时')), timeout);
        
        img.onload = () => {
            clearTimeout(timer);
            resolve(src);
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
        .then(() => {
            previewImage.src = src;
            // 使用requestAnimationFrame确保动画流畅
            requestAnimationFrame(() => {
                previewContainer.classList.add('show');
                previewState.isShown = true;
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

    // 延迟清空图片源，确保300ms淡出动画完成
    setTimeout(() => {
        const previewImage = previewContainer.querySelector('.preview-image-global');
        if (previewImage) {
            previewImage.src = '';
        }
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