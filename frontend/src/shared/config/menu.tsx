import {
  UserOutlined,
  TeamOutlined,
  SettingOutlined,
  SafetyCertificateOutlined,
  FileOutlined,
  FileTextOutlined,
  BellOutlined,
  ApartmentOutlined,
  ControlOutlined,
  ShoppingOutlined,
  ClusterOutlined
} from '@ant-design/icons';
import type { MenuDataItem } from '@ant-design/pro-layout';

// 扩展菜单项类型，添加权限配置和分组
export interface MenuItemWithPermissions extends MenuDataItem {
  permissions?: string[]; // 访问此菜单所需的权限
  adminOnly?: boolean; // 是否仅管理员可见
  group?: string; // 菜单分组名称
  popupChildren?: MenuItemWithPermissions[]; // 用于存储原始子菜单数据
}

// 菜单配置（带权限和分组）
export const allMenuData: MenuItemWithPermissions[] = [
  {
    path: '/production-planning',
    name: '生产计划',
    icon: <ClusterOutlined />,
    children: [
      {
        path: '/production-plan',
        name: '生产计划',
        icon: <ClusterOutlined />,
        group: '计划编制',
      },
      {
        path: '/production-plan-list',
        name: '生产计划列表',
        icon: <ClusterOutlined />,
        group: '计划编制',
      },
      {
        path: '/manufacturing-order',
        name: '制造订单',
        icon: <ClusterOutlined />,
        group: '执行指令',
      },
    ],
  },
  {
    path: '/production-management',
    name: '生产管理',
    icon: <ClusterOutlined />,
    children: [
      {
        path: '/work-order-scheduling',
        name: '工单排程',
        icon: <ClusterOutlined />,
        group: '计划与执行',
      },
      {
        path: '/work-order-board',
        name: '工单看板',
        icon: <ClusterOutlined />,
        group: '计划与执行',
      },
      {
        path: '/production-order',
        name: '生产工单',
        icon: <ClusterOutlined />,
        group: '计划与执行',
      },
      {
        path: '/material-issue',
        name: '生产领料',
        icon: <ClusterOutlined />,
        group: '物料与报工',
      },
      {
        path: '/production-inbound',
        name: '生产入库',
        icon: <ClusterOutlined />,
        group: '物料与报工',
      },
      {
        path: '/production-report',
        name: '生产报工',
        icon: <ClusterOutlined />,
        group: '物料与报工',
      },
      {
        path: '/production-record',
        name: '生产记录',
        icon: <ClusterOutlined />,
        group: '物料与报工',
      },
    ],
  },
  {
    path: '/subcontract-management',
    name: '委外管理',
    icon: <ClusterOutlined />,
    children: [
      {
        path: '/subcontract-order',
        name: '委外订单',
        icon: <ClusterOutlined />,
      },
      {
        path: '/subcontract-receipt',
        name: '委外入库',
        icon: <ClusterOutlined />,
      },
    ],
  },
  {
    path: '/purchase-management',
    name: '采购管理',
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
    name: '销售管理',
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
    name: '库存管理',
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
        path: '/other-inbound',
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
        group: '产品定义',
      },
      {
        path: '/product-categories',
        name: '产品类目',
        icon: <ShoppingOutlined />,
        group: '产品定义',
      },
      {
        path: '/attributes',
        name: '产品属性',
        icon: <ShoppingOutlined />,
        group: '产品定义',
      },
      {
        path: '/bom',
        name: 'BOM管理',
        icon: <ClusterOutlined />,
        group: '生产工艺',
      },
      {
        path: '/operations',
        name: '工序管理',
        icon: <ClusterOutlined />,
        group: '生产工艺',
      },
      {
        path: '/routings',
        name: '工艺路线管理',
        icon: <ClusterOutlined />,
        group: '生产工艺',
      },
      {
        path: '/workcenters',
        name: '工作中心管理',
        icon: <ClusterOutlined />,
        group: '生产工艺',
      },
      {
        path: '/suppliers',
        name: '供应商信息',
        icon: <ClusterOutlined />,
        group: '业务伙伴',
      },
      {
        path: '/supplier-bomprice',
        name: '供应商价格表',
        icon: <ClusterOutlined />,
        group: '业务伙伴',
      },
      {
        path: '/customers',
        name: '客户信息',
        icon: <ClusterOutlined />,
        group: '业务伙伴',
      },
      {
        path: '/customer-bomprice',
        name: '客户价格表',
        icon: <ClusterOutlined />,
        group: '业务伙伴',
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
        group: '组织架构',
      },
      {
        path: '/departments',
        name: '部门管理',
        icon: <ApartmentOutlined />,
        permissions: ['department:read', 'department:create', 'department:update', 'department:delete'],
        group: '组织架构',
      },
      {
        path: '/roles',
        name: '角色管理',
        icon: <TeamOutlined />,
        permissions: ['role:read', 'role:create', 'role:update', 'role:delete'],
        group: '组织架构',
      },
      {
        path: '/permissions',
        name: '权限管理',
        icon: <SafetyCertificateOutlined />,
        permissions: ['permission:read', 'permission:create', 'permission:update', 'permission:delete'],
        group: '组织架构',
      },
      {
        path: '/settings',
        name: '系统设置',
        icon: <SettingOutlined />,
        permissions: ['system:admin'],
        group: '系统运维',
      },
      {
        path: '/notifications',
        name: '通知管理',
        icon: <BellOutlined />,
        group: '系统运维',
      },
      {
        path: '/files',
        name: '文件管理',
        icon: <FileOutlined />,
        group: '系统运维',
      },
      {
        path: '/logs',
        name: '日志管理',
        icon: <FileTextOutlined />,
        group: '系统运维',
      },
    ],
  },
];
