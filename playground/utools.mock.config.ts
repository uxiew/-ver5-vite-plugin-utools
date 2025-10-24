// Playground Mock 配置文件
// 演示如何自定义 uTools Mock 行为

import { MockConfig } from '../src/index';

const config: MockConfig = {
  // 启用Mock功能
  enabled: true,

  // 显示开发环境指示器
  showDevIndicator: true,

  // 自定义开发环境指示器样式
  devIndicatorStyles: `
    body[data-env="development"]::before {
      content: "🚀 Playground - uTools Mock Active";
      background: linear-gradient(45deg, #667eea, #764ba2) !important;
      font-weight: bold;
    }
  `,

  // Mock数据配置
  mockData: {
    runtimes: {
      node: 'v20.0.0 (Playground)',
      python: 'Python 3.12.0 (Playground)',
      java: 'OpenJDK 21.0.0 (Playground)',
      typescript: 'TypeScript 5.3.0 (Playground)',
      rust: 'rustc 1.75.0 (Playground)',
      go: 'go1.21.0 (Playground)'
    },

    runtimeConfig: {
      paths: {
        node: '/usr/local/bin/node',
        python: '/usr/local/bin/python3'
      },
      timeouts: {
        compile: 12000,
        run: 8000
      }
    }
  },


  // uTools API Mock配置
  utoolsApi: {
    enabled: true,

    // 自定义uTools API方法
    customMethods: {
      showNotification: (text: string) => {
        console.log(`[Playground Mock] 通知: ${text}`);

        // 创建漂亮的通知
        const notification = document.createElement('div');
        notification.style.cssText = `
          position: fixed;
          top: 80px;
          right: 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 16px 20px;
          border-radius: 12px;
          z-index: 10000;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          box-shadow: 0 8px 32px rgba(0,0,0,0.2);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.1);
          max-width: 320px;
          animation: slideInBounce 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        `;

        // 添加动画
        if (!document.getElementById('playground-notification-styles')) {
          const style = document.createElement('style');
          style.id = 'playground-notification-styles';
          style.textContent = `
            @keyframes slideInBounce {
              0% { transform: translateX(100%) scale(0.8); opacity: 0; }
              50% { transform: translateX(-10%) scale(1.05); opacity: 0.8; }
              100% { transform: translateX(0) scale(1); opacity: 1; }
            }
            @keyframes slideOutBounce {
              0% { transform: translateX(0) scale(1); opacity: 1; }
              100% { transform: translateX(100%) scale(0.8); opacity: 0; }
            }
          `;
          document.head.appendChild(style);
        }

        notification.innerHTML = `
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 18px;">🚀</span>
            <span>${text}</span>
          </div>
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
          notification.style.animation = 'slideOutBounce 0.3s ease-in';
          setTimeout(() => {
            if (document.body.contains(notification)) {
              document.body.removeChild(notification);
            }
          }, 300);
        }, 4000);
      },

      copyText: (text: string) => {
        console.log(`[Playground Mock] 复制文本: ${text}`);

        if (navigator.clipboard) {
          navigator.clipboard.writeText(text).then(() => {
            // 显示复制成功的酷炫提示
            const toast = document.createElement('div');
            toast.style.cssText = `
              position: fixed;
              bottom: 30px;
              left: 50%;
              transform: translateX(-50%) translateY(100px);
              background: #00C851;
              color: white;
              padding: 12px 24px;
              border-radius: 25px;
              z-index: 10001;
              font-size: 14px;
              font-weight: 500;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              box-shadow: 0 4px 20px rgba(0,200,81,0.3);
              transition: transform 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
            `;
            toast.innerHTML = '✨ 已复制到剪贴板';
            document.body.appendChild(toast);

            // 动画进入
            setTimeout(() => {
              toast.style.transform = 'translateX(-50%) translateY(0)';
            }, 10);

            // 动画退出
            setTimeout(() => {
              toast.style.transform = 'translateX(-50%) translateY(100px)';
              setTimeout(() => {
                if (document.body.contains(toast)) {
                  document.body.removeChild(toast);
                }
              }, 300);
            }, 2000);
          });
        }

        return true;
      }
    },

    // dbStorage Mock配置
    dbStorage: {
      prefix: 'playground_mock_',
      initialData: {
        'demo_settings': JSON.stringify({
          theme: 'dark',
          language: 'zh-CN',
          autoSave: true,
          fontSize: 14
        }),
        'demo_projects': JSON.stringify([
          { name: 'Project 1', path: '/path/to/project1' },
          { name: 'Project 2', path: '/path/to/project2' }
        ])
      }
    }
  },

  // Preload API Mock配置
  preloadApi: {
    enabled: true,
    mountName: 'services',

    // 自定义preload方法实现
    customMethods: {
      executeCode: async (code: string, language: string) => {
        console.log(`[Playground Mock] 执行 ${language} 代码:`, code);

        // 模拟代码执行延迟
        await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200));

        // 根据语言返回不同的模拟结果
        const results: Record<string, string> = {
          javascript: `// JavaScript 执行结果
console.log("Hello from JavaScript!");
// 输出: Hello from JavaScript!`,

          python: `# Python 执行结果
print("Hello from Python!")
# 输出: Hello from Python!`,

          java: `// Java 执行结果
System.out.println("Hello from Java!");
// 输出: Hello from Java!`,

          typescript: `// TypeScript 执行结果
console.log("Hello from TypeScript!");
// 输出: Hello from TypeScript!`
        };

        return {
          success: true,
          output: results[language.toLowerCase()] || `// ${language} 执行结果\nHello from ${language}!`,
          timestamp: new Date().toISOString(),
          executionTime: Math.floor(Math.random() * 1000 + 500)
        };
      },

      getRuntimes: () => {
        console.log('[Playground Mock] 获取运行时环境');

        return {
          node: 'v20.0.0 (Playground Mock)',
          python: 'Python 3.12.0 (Playground Mock)',
          java: 'OpenJDK 21.0.0 (Playground Mock)',
          typescript: 'TypeScript 5.3.0 (Playground Mock)',
          rust: 'rustc 1.75.0 (Playground Mock)',
          go: 'go1.21.0 (Playground Mock)',
          playground_special: 'Playground Special Runtime 1.0.0'
        };
      },

      updateRuntimePath: (language: string, path: string) => {
        console.log(`[Playground Mock] 更新 ${language} 运行时路径: ${path}`);

        // 模拟保存到本地存储
        const config = JSON.parse(localStorage.getItem('playground_runtime_config') || '{}');
        config[language] = path;
        localStorage.setItem('playground_runtime_config', JSON.stringify(config));

        return true;
      }
    }
  }
};

export default config;
