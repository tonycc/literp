/**
 * Auth Feature Module
 * 认证相关功能模块
 */

// Components
export { default as LoginPage } from './components/Login';
export { default as ProtectedRoute } from './components/ProtectedRoute';

// Hooks & Context
export { AuthProvider } from './hooks/AuthProvider';
export { useAuth } from './hooks/useAuth';
export { AuthContext } from './contexts/AuthContext';

// Services
export * from './services/auth.service';

// Types (统一从 shared 包导入)
export type { AuthState, AuthContextType, AuthAction } from '@zyerp/shared';
