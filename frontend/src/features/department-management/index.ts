/**
 * 部门管理功能导出
 */

// 组件
export { DepartmentManagement } from './components/DepartmentManagement';
export { DepartmentList } from './components/DepartmentList';
export { DepartmentForm } from './components/DepartmentForm';
export { DepartmentTree } from './components/DepartmentTree';

// 服务
export { DepartmentService, departmentService } from './services/department.service';

// Hooks
export {
  useDepartments,
  useDepartmentTree,
  useDepartment,
  useDepartmentActions,
  useDepartmentStats,
} from './hooks/useDepartments';

// 类型
export type * from './types';