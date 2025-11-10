import React, { Suspense, lazy, useMemo } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import ProLayout from '@ant-design/pro-layout';
import { PageContainer } from '@ant-design/pro-components';
import type { MenuDataItem } from '@ant-design/pro-layout';
import { Avatar, Dropdown, Space, message } from 'antd';
import {
  ShoppingCartOutlined,
  InboxOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  SearchOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { usePermissions } from '../hooks/usePermissions';
// PermissionRoute 组件已在此文件中使用，无需移除
import TabBar from './TabBar';
import LanguageSwitcher from './LanguageSwitcher';
import { useTranslation } from 'react-i18next';

// 懒加载页面组件
const PurchaseOrderList = lazy(() => import('../../features/purchase-orders/components/PurchaseOrderList'));
const InventoryList = lazy(() => import('../../features/inventory/components/InventoryList'));
const OrderQuery = lazy(() => import('../../features/orders/components/OrderQuery'));
const PermissionDemo = lazy(() => import('../../features/permissions/components/PermissionDemo'));
const SupplierStatement = lazy(() => import('../../features/statements/components/SupplierStatement'));
const DashboardLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { hasPermission } = usePermissions();
  const { t } = useTranslation();

  // 完整菜单数据定义（包含权限配置）
  const allMenuData: Array<MenuDataItem & { permission?: string; userTypes?: string[] }> = useMemo(() => [
    {
      path: '/purchase-orders',
      name: t('menu.purchaseOrders'),
      icon: <ShoppingCartOutlined />,
      permission: 'purchase-orders:view',
      userTypes: ['supplier'],
    },
    {
      path: '/statements',
      name: t('menu.statements'),
      icon: <FileTextOutlined />,
      permission: 'statements:view',
      userTypes: ['supplier'],
    },
    {
      path: '/inventory',
      name: t('menu.inventory'),
      icon: <InboxOutlined />,
      permission: 'inventory:view',
      userTypes: ['customer'],
    },
    {
      path: '/order-query',
      name: t('menu.orderQuery'),
      icon: <SearchOutlined />,
      permission: 'orders:view',
      userTypes: ['customer'],
    },
    {
      path: '/permissions',
      name: t('menu.permissions'),
      icon: <SettingOutlined />,
      userTypes: ['supplier', 'customer'],
    },
  ], [t]);

  // 根据用户权限过滤菜单
  const menuData = useMemo(() => {
    return allMenuData.filter(item => {
      // 如果没有权限要求，则显示
      if (!item.permission) return true;
      
      // 检查用户是否有对应权限
      return hasPermission(item.permission);
    }).map(({ permission: _permission, userTypes: _userTypes, ...item }) => item);
  }, [allMenuData, hasPermission]);

  // 获取默认路由
  const defaultRoute = useMemo(() => {
    if (menuData.length > 0 && menuData[0].path) {
      return menuData[0].path;
    }
    return '/profile'; // 默认回退到个人资料页面
  }, [menuData]);

  const handleLogout = async () => {
    try {
      await logout();
      message.success('退出登录成功');
      navigate('/login');
    } catch {
      message.error('退出登录失败');
    }
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: t('profile.title'),
      onClick: () => navigate('/profile'),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: t('common.settings'),
      onClick: () => navigate('/settings'),
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: t('auth.logout'),
      onClick: handleLogout,
    },
  ];

  return (
    <ProLayout
      title={t('auth.welcome')}
      logo={false}
      layout="mix"
      navTheme="light"
      fixedHeader
      fixSiderbar
      colorWeak={false}
      menu={{
        defaultOpenAll: false,
        ignoreFlatMenu: false,
        autoClose: false,
      }}
      onMenuHeaderClick={() => {
        // 菜单头部点击事件
      }}
      menuProps={{
        mode: 'inline',
        inlineCollapsed: false,
      }}
      location={{
        pathname: location.pathname,
      }}
      route={{
        routes: menuData,
      }}
      menuItemRender={(item, dom) => (
        <div onClick={() => {
          navigate(item.path || '/');
        }}>
          {dom}
        </div>
      )}
      headerContentRender={() => (
        <TabBar menuData={menuData} />
      )}
      actionsRender={() => [
        <LanguageSwitcher key="language" size="middle"/>,
        <Dropdown
          key="user"
          menu={{ items: userMenuItems }}
          placement="bottomRight"
          arrow
        >
          <Space style={{ cursor: 'pointer' }}>
             <Avatar 
               size="small" 
               icon={<UserOutlined />}
             />
             <span>{user?.username || '供应商用户'}</span>
           </Space>
        </Dropdown>
      ]}
    >
      <PageContainer 
        header={{ title: false }}
        breadcrumb={{ items: [] }}
        className="no-content-padding"
      >
        <div style={{ padding: '5px 0' }}>
          <Suspense fallback={<div>加载中...</div>}>
            <Routes>
              <Route path="/purchase-orders" element={<PurchaseOrderList />} />
              <Route path="/statements" element={<SupplierStatement />} />
              <Route path="/inventory" element={<InventoryList />} />
              <Route path="/order-query" element={<OrderQuery />} />
              <Route 
                path="/permissions" 
                element={<PermissionDemo />} 
              />
              <Route path="/" element={<Navigate to={defaultRoute} replace />} />
            </Routes>
          </Suspense>
        </div>
      </PageContainer>
    </ProLayout>
  );
};

export default DashboardLayout