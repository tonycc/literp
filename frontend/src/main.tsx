import '@ant-design/v5-patch-for-react-19';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider, App as AntdApp } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import './index.css';
import App from './app/App';

// 设置 dayjs 中文语言
dayjs.locale('zh-cn');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConfigProvider 
      locale={zhCN}
      theme={{
        components: {
          Button: {
            // 设置按钮的默认大小
            controlHeight: 32, // 默认按钮高度 (small: 24, middle: 32, large: 40)
            fontSize: 14,      // 按钮文字大小
            borderRadius: 6,   // 按钮圆角
            paddingInline: 16, // 按钮左右内边距
          },
        },
      }}
    >
      <AntdApp
        message={{
          top: 100,
          duration: 3,
          maxCount: 3,
        }}
      >
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AntdApp>
    </ConfigProvider>
  </StrictMode>,
);