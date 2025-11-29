export const PERMISSION_RESOURCE_OPTIONS = [
  // 系统管理
  { label: '用户', value: 'user' },
  { label: '角色', value: 'role' },
  { label: '权限', value: 'permission' },
  { label: '部门', value: 'department' },
  { label: '系统', value: 'system' },
  { label: '仪表板', value: 'dashboard' },
  { label: '文件', value: 'file' },
  { label: '日志', value: 'log' },
  { label: '通知', value: 'notification' },

  // 产品与工程
  { label: '产品', value: 'product' },
  { label: '产品类别', value: 'product_category' },
  { label: '产品属性', value: 'attribute' },
  { label: '物料清单', value: 'bom' },
  { label: '工艺路线', value: 'routing' },
  { label: '工序', value: 'operation' },
  { label: '工作中心', value: 'workcenter' },

  // 销售与客户
  { label: '客户', value: 'customer' },
  { label: '客户价格表', value: 'customer_price_list' },
  { label: '销售订单', value: 'sales_order' },

  // 采购与供应商
  { label: '供应商', value: 'supplier' },
  { label: '供应商价格', value: 'supplier_price' },
  { label: '采购订单', value: 'purchase_order' },
  { label: '采购收货', value: 'purchase_receipt' },
  { label: '采购退货', value: 'purchase_return' },

  // 生产与库存
  { label: '库存', value: 'inventory' },
  { label: '仓库', value: 'warehouse' },
  { label: '生产订单', value: 'manufacturing_order' },
  { label: '领料单', value: 'material_issue' },
  { label: '生产计划', value: 'production_plan' },
  { label: '生产记录', value: 'production_record' },
  { label: '生产报表', value: 'production_report' },
  { label: '生产入库', value: 'production_inbound' },
];

export const PERMISSION_ACTION_OPTIONS = [
  { label: '查看', value: 'read' },
  { label: '编辑', value: 'write' },
  { label: '更新', value: 'update' },
  { label: '创建', value: 'create' },
  { label: '删除', value: 'delete' },
  { label: '管理', value: 'manage' },
  { label: '导出', value: 'export' },
  { label: '导入', value: 'import' },
  { label: '审核', value: 'approve' },
  { label: '拒绝', value: 'reject' },
];

export const PERMISSION_RESOURCE_VALUE_ENUM = {
  // 系统管理
  user: { text: '用户', status: 'Default' },
  role: { text: '角色', status: 'Default' },
  permission: { text: '权限', status: 'Default' },
  department: { text: '部门', status: 'Default' },
  system: { text: '系统', status: 'Default' },
  dashboard: { text: '仪表板', status: 'Default' },
  file: { text: '文件', status: 'Default' },
  log: { text: '日志', status: 'Default' },
  notification: { text: '通知', status: 'Default' },

  // 产品与工程
  product: { text: '产品', status: 'Processing' },
  product_category: { text: '产品类别', status: 'Processing' },
  attribute: { text: '产品属性', status: 'Processing' },
  bom: { text: '物料清单', status: 'Processing' },
  routing: { text: '工艺路线', status: 'Processing' },
  operation: { text: '工序', status: 'Processing' },
  workcenter: { text: '工作中心', status: 'Processing' },

  // 销售与客户
  customer: { text: '客户', status: 'Success' },
  customer_price_list: { text: '客户价格表', status: 'Success' },
  sales_order: { text: '销售订单', status: 'Success' },

  // 采购与供应商
  supplier: { text: '供应商', status: 'Warning' },
  supplier_price: { text: '供应商价格', status: 'Warning' },
  purchase_order: { text: '采购订单', status: 'Warning' },
  purchase_receipt: { text: '采购收货', status: 'Warning' },
  purchase_return: { text: '采购退货', status: 'Warning' },

  // 生产与库存
  inventory: { text: '库存', status: 'Error' },
  warehouse: { text: '仓库', status: 'Error' },
  manufacturing_order: { text: '生产订单', status: 'Error' },
  material_issue: { text: '领料单', status: 'Error' },
  production_plan: { text: '生产计划', status: 'Error' },
  production_record: { text: '生产记录', status: 'Error' },
  production_report: { text: '生产报表', status: 'Error' },
  production_inbound: { text: '生产入库', status: 'Error' },
};

export const PERMISSION_ACTION_VALUE_ENUM = {
  read: { text: '查看', color: 'blue' },
  write: { text: '编辑', color: 'orange' },
  update: { text: '更新', color: 'orange' },
  create: { text: '创建', color: 'green' },
  delete: { text: '删除', color: 'red' },
  manage: { text: '管理', color: 'purple' },
  export: { text: '导出', color: 'cyan' },
  import: { text: '导入', color: 'geekblue' },
  approve: { text: '审核', color: 'lime' },
  reject: { text: '拒绝', color: 'magenta' },
};
