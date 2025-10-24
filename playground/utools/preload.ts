const { ipcRenderer } = require('electron');

/**
 * 代码执行服务
 */
export async function executeCode(code: string, language: string): Promise<{ success: boolean; output: string }> {
    // 实际实现中会调用后端服务
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                success: true,
                output: `[${language}] Code executed successfully: ${code.substring(0, 50)}...`
            });
        }, 1000);
    });
}

/**
 * 获取可用的运行时环境
 */
export function getRuntimes(): Record<string, string> {
    return {
        node: 'v18.17.0',
        python: 'Python 3.11.0',
        java: 'OpenJDK 17.0.0',
        typescript: 'TypeScript 5.0.0'
    };
}

/**
 * 获取运行时配置
 */
export function getRuntimeConfig(): { paths: Record<string, string>; timeouts: { compile: number; run: number } } {
    return {
        paths: {
            node: '/usr/local/bin/node',
            python: '/usr/local/bin/python3',
            java: '/usr/local/bin/java'
        },
        timeouts: {
            compile: 10000,
            run: 5000
        }
    };
}

/**
 * 更新运行时路径
 */
export function updateRuntimePath(language: string, path: string): boolean {
    console.log(`Updating ${language} runtime path to: ${path}`);
    return true;
}

/**
 * 获取操作系统类型
 */
export function getOsType(): string {
    return process.platform;
}

// 挂载服务到 window 对象
window.services = {
    executeCode,
    getRuntimes,
    getRuntimeConfig,
    updateRuntimePath,
    getOsType
};
