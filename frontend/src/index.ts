/**
 * Frontend Application
 * 前端应用程序主导出文件
 */

// App：导出主应用组件
export { default as App } from './app/App';

// Features
export * from './features';

// Shared（推荐直接从 @fennec/shared 导入，不再聚合导出）