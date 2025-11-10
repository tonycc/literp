/**
 * Department Feature Module
 */

export { DepartmentController } from './department.controller';
export { DepartmentService } from './department.service';
export { default as departmentRoutes } from './department.routes';
export type { 
  CreateDepartmentData, 
  UpdateDepartmentData, 
  DepartmentListParams, 
  DepartmentListResponse 
} from './department.service';