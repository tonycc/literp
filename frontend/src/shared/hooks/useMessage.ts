import { App } from 'antd';
import type { MessageInstance } from 'antd/es/message/interface';

/**
 * 自定义 hook 用于获取 Ant Design App 组件提供的 message 实例
 * 这样可以避免静态调用 message 时无法消费动态主题上下文的警告
 */
export const useMessage = (): MessageInstance => {
  const { message } = App.useApp();
  return message;
};