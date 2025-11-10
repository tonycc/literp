import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Spin } from 'antd';
import { AuthProvider } from '../features/auth';
import { ProtectedRoute } from '../features/auth';
import './App.css';

// 懒加载页面组件
const LoginPage = React.lazy(() => import('../features/auth/components/Login'));
const DashboardLayout = React.lazy(() => import('../shared/components/Layout/DashboardLayout'));
const UnauthorizedPage = React.lazy(() => import('../shared/pages/Unauthorized'));

function App() {
  return (
    <AuthProvider>
      <div className="app">
        <React.Suspense fallback={<Spin size="large" style={{ 
          position: 'fixed', 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)' 
        }} />}>
          <Routes>
            {/* 登录页面 */}
            <Route path="/login" element={<LoginPage />} />
            
            {/* 未授权页面 */}
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            
            {/* 受保护的主应用布局 */}
            <Route path="/*" element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            } />
            
            {/* 默认重定向到仪表板 */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </React.Suspense>
      </div>
    </AuthProvider>
  );
}

export default App;
