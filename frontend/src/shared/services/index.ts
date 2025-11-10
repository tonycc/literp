/**
 * 服务模块入口
 */

export { default as apiClient } from './api';
export * from './user.service';
// 其他服务由各自 feature 模块导出，避免循环与错误引用