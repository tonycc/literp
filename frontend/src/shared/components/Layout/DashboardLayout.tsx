import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import ProLayout from '@ant-design/pro-layout';
import { PageContainer } from '@ant-design/pro-components';
import type { MenuDataItem } from '@ant-design/pro-layout';
import { Avatar, Dropdown, Space } from 'antd';
import { useMessage, usePermissions } from '../../hooks';
import {
  UserOutlined,
  TeamOutlined,
  SettingOutlined,
  LogoutOutlined,
  SafetyCertificateOutlined,
  FileOutlined,
  FileTextOutlined,
  BellOutlined,
  ApartmentOutlined,
  ControlOutlined,
  ShoppingOutlined,
  ClusterOutlined,
} from '@ant-design/icons';
import { useAuth } from '../../../features/auth';
import { NotificationButton } from '../../../features/notification-management';
import TabBar from '../TabBar';

// 懒加载页面组件（统一指向各 feature 模块中的页面组件）
const UserManagement = React.lazy(() => import('../../../features/user-management/components/UserManagement'));
const RoleManagement = React.lazy(() => import('../../../features/role-management/components/RoleManagement'));
const PermissionManagement = React.lazy(() => import('../../../features/permission-management/components/PermissionManagement'));
const FileManager = React.lazy(() => import('../../../features/file-management/components/FileManager'));
const LogManagement = React.lazy(() => import('../../../features/log-management/pages/LogManagement'));
const Settings = React.lazy(() => import('../../../features/system-settings/components/Settings'));
const NotificationManagement = React.lazy(() => import('../../../features/notification-management/pages/NotificationManagement'));
const DepartmentManagement = React.lazy(() => import('../../../features/department-management/components/DepartmentManagement'));
const ProductManagement = React.lazy(() => import('../../../features/product/pages/ProductManagement'));
const ProductCategoryManagement = React.lazy(() => import('../../../features/product/pages/ProductCategoryManagement'));
const BomManagement = React.lazy(() => import('../../../features/bom'));
const SupplierManagement = React.lazy(() => import('../../../features/supplier-management/components/SupplierManagement'));
const SupplierPriceManagement = React.lazy(() => import('../../../features/supplier-management/components/SupplierPriceManagement'));
const CustomerManagement = React.lazy(() => import('../../../features/customer-management/components/CustomerManagement'));
const CustomerPriceListManagement = React.lazy(() => import('../../../features/customer-price-list/components/CustomerPriceListManagement'));
const PurchaseOrderManagement = React.lazy(() => import('../../../features/purchase-order/components/PurchaseOrderManagement'));
const PurchaseReceiptManagement = React.lazy(() => import('../../../features/purchase-receipt/components/PurchaseReceiptManagement'));
const PurchaseReturnManagement = React.lazy(() => import('../../../features/purchase-return/components/PurchaseReturnManagement').then(module => ({ default: module.PurchaseReturnManagement })));
const SalesOrderManagement = React.lazy(() => import('../../../features/sales-order').then(module => ({ default: module.SalesOrderManagement })));
const SalesReceiptManagement = React.lazy(() => import('../../../features/sales-receipt/components/SalesReceiptManagement'));
const SalesReturnManagement = React.lazy(() => import('../../../features/sales-return/components/SalesReturnManagement'));
const InventoryManagement = React.lazy(() => import('../../../features/inventory/pages/InventoryManagement'));
const OutboundOrderList = React.lazy(() => import('../../../features/inventory/components/OutboundOrderList'));
const ProductionOrderList = React.lazy(() => import('../../../features/production-order/components/ProductionOrderList'));
const ProductionRecordList = React.lazy(() => import('../../../features/production-record').then(module => ({ default: module.ProductionRecordList })));
const ProductionInboundManagement = React.lazy(() => import('../../../features/production-inbound/components/ProductionInboundManagement'));
const ProductionPlanManagement = React.lazy(() => import('../../../features/production-plan').then(module => ({ default: module.ProductionPlanManagement })));
const Homepage = React.lazy(() => import('../../../features/homepage/components/Homepage'));
const OperationManagement = React.lazy(() => import('../../../features/operation/pages/OperationManagement'));
const RoutingManagement = React.lazy(() => import('../../../features/routing/pages/RoutingManagement'));
const WorkcenterManagement = React.lazy(() => import('../../../features/workcenter/pages/WorkcenterManagement'));


// 扩展菜单项类型，添加权限配置
interface MenuItemWithPermissions extends MenuDataItem {
  permissions?: string[]; // 访问此菜单所需的权限
  adminOnly?: boolean; // 是否仅管理员可见
}

// 菜单配置（带权限）
const allMenuData: MenuItemWithPermissions[] = [
 
  {
    path: '/production-management',
    name:'生产管理',
    icon: <ClusterOutlined />,
    children: [
      {
        path: '/production-order',
        name: '生产工单',
        icon: <ClusterOutlined />,
      },
      {
        path: '/production-record',
        name: '生产记录',
        icon: <ClusterOutlined />,
      },
      {
        path: '/production-inbound',
        name: '生产入库',
        icon: <ClusterOutlined />,
      },
      {
        path: '/production-plan',
        name: '生产计划预览',
        icon: <ClusterOutlined />,
      },
    ],
  },
  {
    path: '/purchase-management',
    name:'采购管理',
    icon: <ClusterOutlined />,
    children: [
      {
        path: '/purchase-order',
        name: '采购订单',
        icon: <ClusterOutlined />,
      },
      {
        path: '/purchase-receipt',
        name: '采购入库',
        icon: <ClusterOutlined />,
      },
      {
        path: '/purchase-return',
        name: '采购退货',
        icon: <ClusterOutlined />,
      },
    ],
  },
  {
    path: '/sales-management',
    name:'销售管理',
    icon: <ClusterOutlined />,
    children: [
      {
        path: '/sales-order',
        name: '销售订单',
        icon: <ClusterOutlined />,
      },
      {
        path: '/sales-receipt',
        name: '销售出库',
        icon: <ClusterOutlined />,
      },
      {
        path: '/sales-return',
        name: '销售退货',
        icon: <ClusterOutlined />,
      },
    ],
  },
  {
    path: '/inventory-management',
    name:'库存管理',
    icon: <ClusterOutlined />,
    children: [
      {
        path: '/inventory',
        name: '库存信息',
        icon: <ClusterOutlined />,
      },
      {
        path: '/outbound-order',
        name: '出库单列表',
        icon: <ClusterOutlined />,
      },
      {
        path:'/other-inbound',
        name: '其他入库单',
        icon: <ClusterOutlined />,
      },
    ],
  },
 
  {
    path: '/base-data',
    name: '基础资料',
    icon: <ShoppingOutlined />,
    children: [
      {
        path: '/products',
        name: '产品信息',
        icon: <ShoppingOutlined />,
      },
      {
        path: '/product-categories',
        name: '产品类目管理',
        icon: <ShoppingOutlined />,
      },
      {
        path: '/bom',
        name: 'BOM管理',
        icon: <ClusterOutlined />,
      },
      {
        path: '/operations',
        name: '工序管理',
        icon: <ClusterOutlined />,
      },
      {
        path: '/routings',
        name: '工艺路线管理',
        icon: <ClusterOutlined />,
      },
      {
        path: '/workcenters',
        name: '工作中心管理',
        icon: <ClusterOutlined />,
      },
       {
        path: '/suppliers',
        name: '供应商信息',
        icon: <ClusterOutlined />,
      },
      {
        path: '/supplier-bomprice',
        name: '供应商价格表',
        icon: <ClusterOutlined />,
      },
       {
        path: '/customers',
        name: '客户信息',
        icon: <ClusterOutlined />,
      },
      {
        path: '/customer-bomprice',
        name: '客户价格表',
        icon: <ClusterOutlined />,
      },
    ],
  },
  {
    path: '/system',
    name: '系统管理',
    icon: <ControlOutlined />,
    children: [
      {
        path: '/users',
        name: '用户管理',
        icon: <UserOutlined />,
        permissions: ['user:read', 'user:create', 'user:update', 'user:delete'],
      },
      {
        path: '/departments',
        name: '部门管理',
        icon: <ApartmentOutlined />,
        permissions: ['department:read', 'department:create', 'department:update', 'department:delete'],
      },
      {
        path: '/roles',
        name: '角色管理',
        icon: <TeamOutlined />,
        permissions: ['role:read', 'role:create', 'role:update', 'role:delete'],
      },
      {
        path: '/permissions',
        name: '权限管理',
        icon: <SafetyCertificateOutlined />,
        permissions: ['permission:read', 'permission:create', 'permission:update', 'permission:delete'],
      },
      {
        path: '/settings',
        name: '系统设置',
        icon: <SettingOutlined />,
        permissions: ['system:admin'],
      },
    ],
  },
  {
    path: '/notifications',
    name: '通知管理',
    icon: <BellOutlined />,
  },
  {
    path: '/files',
    name: '文件管理',
    icon: <FileOutlined />,
  },
  {
    path: '/logs',
    name: '日志管理',
    icon: <FileTextOutlined />,
  },
];

const DashboardLayout: React.FC = () => {
  const message = useMessage();
  const { user: currentUser, logout, isLoading: loading } = useAuth();
  const { hasAnyPermission, isAdmin } = usePermissions();
  const navigate = useNavigate();
  const location = useLocation();
  
  // 路径到菜单的映射配置
  const pathToMenuMapping = useMemo(() => ({
    '/purchase-management': ['/purchase-order', '/purchase-receipt', '/purchase-return'],
    '/sales-management': ['/sales-order', '/sales-receipt', '/sales-return'],
    '/inventory-management': ['/inventory', '/outbound-order', '/other-inbound'],
    '/production-management': ['/production-order', '/production-record', '/production-inbound', '/production-plan'],
    '/base-data': ['/products', '/bom', '/operations', '/routings', '/suppliers', '/supplier-bomprice', '/customers', '/customer-bomprice'],
    '/system': ['/users', '/departments', '/roles', '/permissions', '/settings'],
  }), []);

  // 菜单展开状态管理
  const [openKeys, setOpenKeys] = useState<string[]>([]);
  // 跟踪用户手动关闭的菜单
  const [manuallyClosedKeys, setManuallyClosedKeys] = useState<Set<string>>(new Set());
  // 使用useRef跟踪是否是初始加载，避免被ProLayout的onOpenChange覆盖
  const isInitialLoadRef = useRef(true);
  const hasInitializedRef = useRef(false);
  const initializationTimerRef = useRef<number | null>(null);

  // 自定义的菜单展开变化处理函数
  const handleOpenChange = (keys: string[]) => {
    // 如果还在初始加载阶段，忽略ProLayout的自动展开
    if (isInitialLoadRef.current) {
      return;
    }
    setOpenKeys(keys);
  };

  // 监听路径变化，动态更新菜单展开状态
  useEffect(() => {
    const currentPath = location.pathname;
    
    // 如果是初始加载（页面刷新），延迟一段时间后标记初始化完成
    if (isInitialLoadRef.current) {
      // 清除之前的定时器
      if (initializationTimerRef.current) {
        clearTimeout(initializationTimerRef.current);
      }
      
      // 延迟标记初始化完成，确保TabBar等组件初始化完成
      initializationTimerRef.current = setTimeout(() => {
        isInitialLoadRef.current = false;
        hasInitializedRef.current = true;
      }, 100);
      
      return;
    }
    
    const newOpenKeys: string[] = [];
    
    // 遍历路径映射配置，找到匹配的菜单项
    Object.entries(pathToMenuMapping).forEach(([menuKey, paths]) => {
      if (paths.includes(currentPath) && !manuallyClosedKeys.has(menuKey)) {
        newOpenKeys.push(menuKey);
      }
    });
    
    setOpenKeys(newOpenKeys);
  }, [location.pathname, pathToMenuMapping, manuallyClosedKeys]);

  // 清理定时器
  useEffect(() => {
    return () => {
      if (initializationTimerRef.current) {
        clearTimeout(initializationTimerRef.current);
      }
    };
  }, []);

  // 根据用户权限过滤菜单
  const menuData = useMemo(() => {
    const filterMenuItems = (items: MenuItemWithPermissions[]): MenuItemWithPermissions[] => {
      return items.filter(item => {
        // 如果菜单项标记为仅管理员可见，检查是否为管理员
        if (item.adminOnly && !isAdmin) {
          return false;
        }

        // 如果菜单项有权限要求，检查用户是否具有任意一个权限
        if (item.permissions && item.permissions.length > 0) {
          if (!hasAnyPermission(item.permissions)) {
            return false;
          }
        }

        // 如果有子菜单，递归过滤子菜单
        if (item.children && item.children.length > 0) {
          const filteredChildren = filterMenuItems(item.children as MenuItemWithPermissions[]);
          // 如果过滤后没有子菜单，则隐藏父菜单
          if (filteredChildren.length === 0) {
            return false;
          }
          // 更新子菜单
          item.children = filteredChildren;
        }

        return true;
      });
    };

    return filterMenuItems(allMenuData);
  }, [hasAnyPermission, isAdmin]);

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
      label: '个人资料',
      onClick: () => navigate('/profile'),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '个人设置',
      onClick: () => navigate('/settings'),
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ];

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        加载中...
      </div>
    );
  }

  return (
    <ProLayout
      title="ZYERP管理系统"
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
        mode: 'vertical',
        openKeys,
        onOpenChange: handleOpenChange,
        theme: 'light',
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
          
          // 如果点击的是二级菜单项，收起对应的一级菜单
          const currentPath = item.path || '';
          Object.entries(pathToMenuMapping).forEach(([menuKey, paths]) => {
            if (paths.includes(currentPath)) {
              // 从openKeys中移除对应的一级菜单key
              setOpenKeys(prev => prev.filter(key => key !== menuKey));
              // 记录用户手动关闭的菜单
              setManuallyClosedKeys(prev => new Set(prev).add(menuKey));
            }
          });
        }}>
          {dom}
        </div>
      )}
      headerContentRender={() => (
       <TabBar menuData={menuData} />
      )}
      actionsRender={() => [
        <NotificationButton key="notify" />,
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
              src={currentUser?.avatar}
            />
            <span>{currentUser?.username}</span>
          </Space>
        </Dropdown>
      ]}     
    >
      <PageContainer 
        header={{ title: false}}
        breadcrumb={{ items: [] }}
        className="no-content-padding"
      >
        <div style={{ padding: '10px' }}>
          <React.Suspense fallback={<div>加载中...</div>}>
            <Routes>
              <Route path="/production-order" element={<ProductionOrderList />} />
              <Route path="/production-record" element={<ProductionRecordList />} />
              <Route path="/production-inbound" element={<ProductionInboundManagement />} />
              <Route path="/production-plan" element={<ProductionPlanManagement />} />
              <Route path="/purchase-order" element={<PurchaseOrderManagement />} />
              <Route path="/purchase-receipt" element={<PurchaseReceiptManagement />} />
              <Route path="/purchase-return" element={<PurchaseReturnManagement />} />
              <Route path="/sales-order" element={<SalesOrderManagement />} />
              <Route path="/sales-receipt" element={<SalesReceiptManagement />} />
              <Route path="/sales-return" element={<SalesReturnManagement />} />
              <Route path="/inventory" element={<InventoryManagement />} />
              <Route path="/outbound-order" element={<OutboundOrderList />} />
              <Route path="/other-inbound" element={<div>其他入库单页面开发中...</div>} />
              <Route path="/suppliers" element={<SupplierManagement />} />
              <Route path="/supplier-bomprice" element={<SupplierPriceManagement />} />
              <Route path="/customers" element={<CustomerManagement />} />
              <Route path="/customer-bomprice" element={<CustomerPriceListManagement />} />
              <Route path="/products" element={<ProductManagement />} />
              <Route path="/product-categories" element={<ProductCategoryManagement />} />
              <Route path="/bom" element={<BomManagement />} />
              <Route path="/operations" element={<OperationManagement />} />
              <Route path="/routings" element={<RoutingManagement />} />
              <Route path="/workcenters" element={<WorkcenterManagement />} />
              <Route path="/users" element={<UserManagement />} />
              <Route path="/departments" element={<DepartmentManagement />} />
              <Route path="/roles" element={<RoleManagement />} />
              <Route path="/permissions" element={<PermissionManagement />} />
              <Route path="/notifications" element={<NotificationManagement />} />
              <Route path="/files" element={<FileManager />} />
              <Route path="/logs" element={<LogManagement />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/dashboard" element={<Homepage />} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </React.Suspense>
        </div>
      </PageContainer>
    </ProLayout>
  );
};

export default DashboardLayout;