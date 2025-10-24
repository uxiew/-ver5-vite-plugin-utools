/**
 * uTools API Mock Templates
 * 提供标准的 uTools API Mock 实现
 *
 * 注意：这个文件保留用于向后兼容，新的实现请使用 utoolsApiMockImpl.ts
 */

import { MockUToolsApi } from './utoolsApiMockImpl';

/**
 * 创建完整的 uTools Mock 实例
 */
export function createCompleteUtoolsMock(config?: {
  dbStoragePrefix?: string;
  dbStorageInitialData?: Record<string, any>;
  customMethods?: Record<string, Function>;
}): MockUToolsApi {
  const mockInstance = new MockUToolsApi({
    dbStoragePrefix: config?.dbStoragePrefix,
    dbStorageInitialData: config?.dbStorageInitialData
  });

  // 应用自定义方法
  if (config?.customMethods) {
    Object.assign(mockInstance, config.customMethods);
  }

  return mockInstance;
}

/**
 * Mock localStorage for uTools dbStorage (向后兼容)
 */
export const mockDbStorageTemplate = `
class MockDbStorage {
  constructor() {
    this.prefix = 'utools_mock_';
  }

  getItem(key) {
    return localStorage.getItem(this.prefix + key);
  }

  setItem(key, value) {
    localStorage.setItem(this.prefix + key, value);
  }

  removeItem(key) {
    localStorage.removeItem(this.prefix + key);
  }

  clear() {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(this.prefix)) {
        localStorage.removeItem(key);
      }
    });
  }

  getAllKeys() {
    const keys = Object.keys(localStorage);
    return keys
      .filter(key => key.startsWith(this.prefix))
      .map(key => key.replace(this.prefix, ''));
  }
}`;

/**
 * Mock uTools API
 */
export const mockUtoolsTemplate = `
class MockUtools {
  constructor() {
    this.dbStorage = new MockDbStorage();
  }

  hideMainWindow() {
    console.log('[Mock] utools.hideMainWindow()');
  }

  showMainWindow() {
    console.log('[Mock] utools.showMainWindow()');
  }

  outPlugin() {
    console.log('[Mock] utools.outPlugin()');
  }

  setExpendHeight(height) {
    console.log(\`[Mock] utools.setExpendHeight(\${height})\`);
    const app = document.getElementById('app');
    if (app) {
      app.style.height = \`\${height}px\`;
    }
  }

  isDarkColors() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  isMacOs() {
    return navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  }

  isWindows() {
    return navigator.platform.toUpperCase().indexOf('WIN') >= 0;
  }

  isLinux() {
    return navigator.platform.toUpperCase().indexOf('LINUX') >= 0;
  }

  copyText(text) {
    navigator.clipboard.writeText(text).then(() => {
      console.log('[Mock] Text copied to clipboard:', text);
    }).catch(err => {
      console.error('[Mock] Failed to copy text:', err);
    });
  }

  showNotification(text, clickFeatureCode) {
    console.log(\`[Mock] Notification: \${text}\`, clickFeatureCode);
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification('uTools Mock', { body: text });
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            new Notification('uTools Mock', { body: text });
          }
        });
      }
    }
  }

  onPluginEnter(callback) {
    console.log('[Mock] utools.onPluginEnter registered');
    setTimeout(() => {
      callback({
        code: 'mock_feature',
        type: 'text',
        payload: ''
      });
    }, 100);
  }

  onPluginReady(callback) {
    console.log('[Mock] utools.onPluginReady registered');
    setTimeout(callback, 50);
  }

  onPluginDetach(callback) {
    console.log('[Mock] utools.onPluginDetach registered');
    window.addEventListener('beforeunload', callback);
  }

  getCurrentFolderPath() {
    console.log('[Mock] utools.getCurrentFolderPath()');
    return '/mock/current/folder';
  }

  getPath(name) {
    console.log(\`[Mock] utools.getPath('\${name}')\`);
    const paths = {
      home: '/mock/home',
      appData: '/mock/appData',
      userData: '/mock/userData',
      temp: '/mock/temp',
      exe: '/mock/exe',
      desktop: '/mock/desktop',
      documents: '/mock/documents',
      downloads: '/mock/downloads',
      music: '/mock/music',
      pictures: '/mock/pictures',
      videos: '/mock/videos'
    };
    return paths[name] || '/mock/unknown';
  }

  showOpenDialog(options) {
    console.log('[Mock] utools.showOpenDialog()', options);
    return Promise.resolve(['/mock/selected/file.txt']);
  }

  showSaveDialog(options) {
    console.log('[Mock] utools.showSaveDialog()', options);
    return Promise.resolve('/mock/save/file.txt');
  }

  shellOpenExternal(url) {
    console.log(\`[Mock] utools.shellOpenExternal('\${url}')\`);
    window.open(url, '_blank');
  }

  shellShowItemInFolder(path) {
    console.log(\`[Mock] utools.shellShowItemInFolder('\${path}')\`);
  }

  shellOpenPath(path) {
    console.log(\`[Mock] utools.shellOpenPath('\${path}')\`);
  }

  getCursorScreenPoint() {
    console.log('[Mock] utools.getCursorScreenPoint()');
    return { x: 100, y: 100 };
  }

  getDisplayNearestPoint(point) {
    console.log('[Mock] utools.getDisplayNearestPoint()', point);
    return {
      id: 1,
      bounds: { x: 0, y: 0, width: 1920, height: 1080 },
      workArea: { x: 0, y: 23, width: 1920, height: 1057 },
      scaleFactor: 1.0
    };
  }
}`;

/**
 * 获取开发环境指示器样式模板
 */
export const devIndicatorStylesTemplate = `
body[data-env="development"]::before {
  content: "🔧 开发模式";
  position: fixed;
  top: 0;
  right: 0;
  z-index: 9999;
  background: #ff6b6b;
  color: white;
  padding: 2px 8px;
  font-size: 12px;
  font-family: monospace;
  border-radius: 0 0 0 4px;
  pointer-events: none;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}`;

/**
 * Mock 初始化模板
 */
export const mockInitTemplate = `
// Initialize Mock Environment
console.log('[Mock] Initializing uTools Mock for development environment');

// Add development environment indicator
document.body.setAttribute('data-env', 'development');

// Mock utools API
window.utools = new MockUtools();

console.log('[Mock] uTools Mock initialized successfully');
console.log('[Mock] Available uTools APIs:', Object.keys(window.utools));`;
