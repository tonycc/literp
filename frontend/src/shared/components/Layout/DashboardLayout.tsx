import React, { useMemo, useState } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import ProLayout from '@ant-design/pro-layout';
import { PageContainer } from '@ant-design/pro-components';
import { Avatar, Dropdown, Space, Popover, Row, Col, Typography, theme } from 'antd';
import { useMessage, usePermissions } from '../../hooks';
import { allMenuData, type MenuItemWithPermissions } from '../../config/menu';
import {
  UserOutlined,
  SettingOutlined,
  LogoutOutlined
} from '@ant-design/icons';
import { useAuth } from '../../../features/auth';
import { NotificationButton } from '../../../features/notification-management';
import TabBar from '../TabBar';

const { Title } = Typography;

// 懒加载页面组件
const UserManagement = React.lazy(() => import('../../../features/user-management/pages/UserManagement'));
const RoleManagement = React.lazy(() => import('../../../features/role-management/pages/RoleManagement'));
const PermissionManagement = React.lazy(() => import('../../../features/permission-management/pages/PermissionManagement'));
const FileManager = React.lazy(() => import('../../../features/file-management/components/FileManager'));
const LogManagement = React.lazy(() => import('../../../features/log-management/pages/LogManagement'));
const Settings = React.lazy(() => import('../../../features/system-settings/components/Settings'));
const NotificationManagement = React.lazy(() => import('../../../features/notification-management/pages/NotificationManagement'));
const DepartmentManagement = React.lazy(() => import('../../../features/department-management/components/DepartmentManagement'));
const ProductManagement = React.lazy(() => import('../../../features/product/pages/ProductManagement'));
const ProductCategoryManagement = React.lazy(() => import('../../../features/product/pages/ProductCategoryManagement'));
const ProductVariantsManagement = React.lazy(() => import('../../../features/product-variants/pages/ProductVariantsManagement'));
const AttributeManagement = React.lazy(() => import('../../../features/attributes/pages/AttributeManagement'));
const BomManagement = React.lazy(() => import('../../../features/bom/pages/BomManagement'));
const SupplierManagement = React.lazy(() => import('../../../features/supplier-management/pages/SupplierManagement'));
const SupplierPriceManagement = React.lazy(() => import('../../../features/supplier-management/pages/SupplierPriceManagement'));
const CustomerManagement = React.lazy(() => import('../../../features/customer-management/pages/CustomerManagement'));
const CustomerPriceListManagement = React.lazy(() => import('../../../features/customer-price-list/pages/CustomerPriceListPage'));
const PurchaseOrderManagement = React.lazy(() => import('../../../features/purchase-order/pages/PurchaseOrderManagement'));
const PurchaseReceiptManagement = React.lazy(() => import('../../../features/purchase-receipt/components/PurchaseReceiptManagement'));
const PurchaseReturnManagement = React.lazy(() => import('../../../features/purchase-return/components/PurchaseReturnManagement').then(module => ({ default: module.PurchaseReturnManagement })));
const SalesOrderManagement = React.lazy(() => import('../../../features/sales-order/pages/SalesOrderManagement'));
const SalesReceiptManagement = React.lazy(() => import('../../../features/sales-receipt/pages/SalesReceiptManagement'));
const SalesReturnManagement = React.lazy(() => import('../../../features/sales-return/components/SalesReturnManagement'));
const InventoryManagement = React.lazy(() => import('../../../features/inventory/pages/InventoryManagement'));
const OutboundOrderList = React.lazy(() => import('../../../features/inventory/components/OutboundOrderList'));
const ProductionOrderList = React.lazy(() => import('../../../features/production-order/components/ProductionOrderList'));
const ProductionRecordList = React.lazy(() => import('../../../features/production-record').then(module => ({ default: module.ProductionRecordList })));
const ProductionInboundManagement = React.lazy(() => import('../../../features/production-inbound/components/ProductionInboundManagement'));
const ProductionPlanManagement = React.lazy(() => import('../../../features/production-plan').then(module => ({ default: module.ProductionPlanManagement })));
const ProductionPlanListPage = React.lazy(() => import('../../../features/production-plan').then(module => ({ default: module.ProductionPlanList })));
const ManufacturingOrderManagement = React.lazy(() => import('../../../features/manufacturing-order/pages/ManufacturingOrderManagement'));
const WorkOrderScheduling = React.lazy(() => import('../../../features/work-order/pages/WorkOrderScheduling'));
const WorkOrderBoard = React.lazy(() => import('../../../features/work-order/pages/WorkOrderBoard'));
const MaterialIssueManagement = React.lazy(() => import('../../../features/material-issue').then(module => ({ default: module.MaterialIssueManagement })));
const MaterialIssueDetailPage = React.lazy(() => import('../../../features/material-issue').then(module => ({ default: module.MaterialIssueDetailPage })));
const ProductionReportManagement = React.lazy(() => import('../../../features/production-report').then(module => ({ default: module.ProductionReportManagement })));
const Homepage = React.lazy(() => import('../../../features/homepage/components/Homepage'));
const OperationManagement = React.lazy(() => import('../../../features/operation/pages/OperationManagement'));
const RoutingManagement = React.lazy(() => import('../../../features/routing/pages/RoutingManagement'));
const WorkcenterManagement = React.lazy(() => import('../../../features/workcenter/pages/WorkcenterManagement'));
const DefectManagement = React.lazy(() => import('../../../features/defect/pages/DefectManagement'));
const SubcontractOrderManagement = React.lazy(() => import('../../../features/subcontract-management/pages/SubcontractOrderManagement'));
const SubcontractReceiptManagement = React.lazy(() => import('../../../features/subcontract-management/pages/SubcontractReceiptManagement'));


// Mega Menu Content Component
const MegaMenuContent: React.FC<{
  items: MenuItemWithPermissions[];
  onItemClick: (path: string) => void;
}> = ({ items, onItemClick }) => {
  const { token } = theme.useToken();

  const { groups, noGroup } = useMemo(() => {
    const groups: Record<string, MenuItemWithPermissions[]> = {};
    const noGroup: MenuItemWithPermissions[] = [];

    items.forEach(item => {
      if (item.group) {
        if (!groups[item.group]) groups[item.group] = [];
        groups[item.group].push(item);
      } else {
        noGroup.push(item);
      }
    });
    return { groups, noGroup };
  }, [items]);

  const groupKeys = Object.keys(groups);
  const hasGroups = groupKeys.length > 0;

  return (
    <div style={{ 
      padding: hasGroups ? '16px 24px' : '8px', 
      // 使用 width 或 minWidth 来确保宽度撑开
      width: hasGroups ? '800px' : 'auto',
      minWidth: hasGroups ? '400px' : 'auto',
      maxWidth: '100vw', 
    }}>
      {hasGroups ? (
        <Row gutter={[32, 24]}>
          {groupKeys.map(groupName => (
            // 改为 3 列布局 (24/8 = 3)
            <Col span={8} key={groupName}>
              <Title level={5} style={{ 
                fontSize: '15px', 
                color: token.colorTextSecondary, 
                marginBottom: '16px',
                fontWeight: 600,
                borderBottom: `1px solid ${token.colorBorderSecondary}`,
                paddingBottom: '8px'
              }}>
                {groupName}
              </Title>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {groups[groupName].map(item => (
                  <div 
                    key={item.path} 
                    onClick={() => onItemClick(item.path || '/')}
                    style={{ 
                      cursor: 'pointer', 
                      padding: '4px 8px',
                      borderRadius: token.borderRadius,
                      color: token.colorText,
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = token.colorFillTertiary}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    {item.icon}
                    <span>{item.name}</span>
                  </div>
                ))}
              </div>
            </Col>
          ))}
          {noGroup.length > 0 && (
             <Col span={24}>
               <div style={{ borderTop: `1px solid ${token.colorBorderSecondary}`, margin: '8px 0' }} />
               <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                 {noGroup.map(item => (
                   <div 
                    key={item.path} 
                    onClick={() => onItemClick(item.path || '/')}
                    style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                   >
                     {item.icon}
                     <span>{item.name}</span>
                   </div>
                 ))}
               </div>
             </Col>
          )}
        </Row>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
           {noGroup.map(item => (
              <div 
                key={item.path} 
                onClick={() => onItemClick(item.path || '/')}
                style={{ 
                  cursor: 'pointer', 
                  padding: '8px 12px',
                  borderRadius: token.borderRadius,
                  color: token.colorText,
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = token.colorFillTertiary}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                {item.icon}
                <span>{item.name}</span>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

const DashboardLayout: React.FC = () => {
  const message = useMessage();
  const { user: currentUser, logout, isLoading: loading } = useAuth();
  const { hasAnyPermission, isAdmin } = usePermissions();
  const navigate = useNavigate();
  const location = useLocation();
  const [popoverOpen, setPopoverOpen] = useState<Record<string, boolean>>({});

  // 根据用户权限过滤菜单
  const menuData = useMemo(() => {
    const filterMenuItems = (items: MenuItemWithPermissions[]): MenuItemWithPermissions[] => {
      return items.reduce<MenuItemWithPermissions[]>((acc, item) => {
        // 1. 权限检查
        if (item.adminOnly && !isAdmin) return acc;
        if (item.permissions && item.permissions.length > 0) {
          if (!hasAnyPermission(item.permissions)) return acc;
        }

        // 2. 处理子菜单
        if (item.children && item.children.length > 0) {
          const filteredChildren = filterMenuItems(item.children as MenuItemWithPermissions[]);
          
          // 如果过滤后没有子菜单，则不包含此父菜单
          if (filteredChildren.length === 0) {
            return acc;
          }
          
          // 返回新对象，使用过滤后的子菜单
          acc.push({ ...item, children: filteredChildren });
        } else {
          // 没有子菜单的项，直接添加
          acc.push({ ...item });
        }

        return acc;
      }, []);
    };
    return filterMenuItems(allMenuData);
  }, [hasAnyPermission, isAdmin]);

  // 扁平化菜单数据供 ProLayout 使用 (隐藏 children)
  const flatMenuData = useMemo(() => {
    return menuData.map(item => ({
      ...item,
      children: undefined, // 隐藏 children 以禁用默认展开
      popupChildren: item.children, // 保存 children 供 Popover 使用
    }));
  }, [menuData]);

  const handleLogout = async () => {
    try {
      await logout();
      message.success('退出登录成功');
      void navigate('/login');
    } catch {
      message.error('退出登录失败');
    }
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人资料',
      onClick: () => { void navigate('/profile') },
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '个人设置',
      onClick: () => { void navigate('/settings') },
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
      menuProps={{
        mode: 'vertical',
        theme: 'light',
        // 禁用默认的子菜单展开逻辑
        openKeys: [], 
        onOpenChange: () => {},
      }}
      location={{
        pathname: location.pathname,
      }}
      // 使用处理过的扁平数据
      menuDataRender={() => flatMenuData}
      menuItemRender={(item, dom) => {
        // 只有当存在子菜单 (popupChildren) 时才渲染 Popover
        // 注意：这里 item 是 flatMenuData 中的项，所以没有 children，只有 popupChildren
        const menuItem = item as MenuItemWithPermissions;
        const hasChildren = menuItem.popupChildren && menuItem.popupChildren.length > 0;
        
        if (!hasChildren) {
           return (
             <div onClick={() => void navigate(item.path || '/')}>
               {dom}
             </div>
           );
        }

        return (
          <Popover
            placement="rightTop"
            trigger="hover"
            open={popoverOpen[item.path || '']}
            onOpenChange={(visible) => setPopoverOpen(prev => ({ ...prev, [item.path || '']: visible }))}
            style={{ padding: 0, maxWidth: 'none' }}
            content={
              <MegaMenuContent 
                items={menuItem.popupChildren as MenuItemWithPermissions[]} 
                onItemClick={(path) => {
                  setPopoverOpen(prev => ({ ...prev, [item.path || '']: false }));
                  void navigate(path);
                }} 
              />
            }
          >
            <div 
              style={{ cursor: 'default' }} 
              onClick={(e) => {
                 // 阻止事件冒泡，防止触发 ProLayout 可能存在的默认行为
                 e.stopPropagation();
              }}
            >
              {dom}
            </div>
          </Popover>
        );
      }}
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
              <Route path="/manufacturing-order" element={<ManufacturingOrderManagement />} />
              <Route path="/work-order-scheduling" element={<WorkOrderScheduling />} />
              <Route path="/work-order-board" element={<WorkOrderBoard />} />
              <Route path="/material-issue" element={<MaterialIssueManagement />} />
              <Route path="/material-issue/:id" element={<MaterialIssueDetailPage />} />
              <Route path="/production-report" element={<ProductionReportManagement />} />
              <Route path="/production-record" element={<ProductionRecordList />} />
              <Route path="/production-inbound" element={<ProductionInboundManagement />} />
              <Route path="/subcontract-order" element={<SubcontractOrderManagement />} />
              <Route path="/subcontract-receipt" element={<SubcontractReceiptManagement />} />
              <Route path="/production-plan" element={<ProductionPlanManagement />} />
              <Route path="/production-plan-list" element={<ProductionPlanListPage />} />
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
              <Route path="/products/:id/variants" element={<ProductVariantsManagement />} />
              
              <Route path="/attributes" element={<AttributeManagement />} />
              <Route path="/product-categories" element={<ProductCategoryManagement />} />
              <Route path="/bom" element={<BomManagement />} />
              <Route path="/operations" element={<OperationManagement />} />
              <Route path="/routings" element={<RoutingManagement />} />
              <Route path="/workcenters" element={<WorkcenterManagement />} />
              <Route path="/defects" element={<DefectManagement />} />
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
