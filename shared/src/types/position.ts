/**
 * 部门职位相关类型定义
 */

// 部门职位枚举
export enum DepartmentPosition {
  MANAGER = 'manager',              // 部门经理
  DEPUTY_MANAGER = 'deputy_manager', // 副经理
  SUPERVISOR = 'supervisor',         // 主管
  TEAM_LEADER = 'team_leader',      // 组长
  SENIOR_EMPLOYEE = 'senior_employee', // 高级员工
  EMPLOYEE = 'employee',            // 普通员工
  INTERN = 'intern',               // 实习生
  CONSULTANT = 'consultant'         // 顾问
}

// 部门职位信息
export interface DepartmentPositionInfo {
  key: DepartmentPosition;
  name: string;
  description: string;
  level: number; // 职位等级，数字越大等级越高
  permissions: string[]; // 该职位的默认权限
}

// 部门职位配置
export const DEPARTMENT_POSITIONS: Record<DepartmentPosition, DepartmentPositionInfo> = {
  [DepartmentPosition.MANAGER]: {
    key: DepartmentPosition.MANAGER,
    name: '部门经理',
    description: '负责部门整体管理和决策',
    level: 8,
    permissions: ['department:manage', 'user:manage', 'report:view']
  },
  [DepartmentPosition.DEPUTY_MANAGER]: {
    key: DepartmentPosition.DEPUTY_MANAGER,
    name: '副经理',
    description: '协助部门经理管理部门事务',
    level: 7,
    permissions: ['department:assist', 'user:manage', 'report:view']
  },
  [DepartmentPosition.SUPERVISOR]: {
    key: DepartmentPosition.SUPERVISOR,
    name: '主管',
    description: '负责特定业务领域的管理',
    level: 6,
    permissions: ['team:manage', 'report:view']
  },
  [DepartmentPosition.TEAM_LEADER]: {
    key: DepartmentPosition.TEAM_LEADER,
    name: '组长',
    description: '负责小组日常管理和协调',
    level: 5,
    permissions: ['team:lead', 'task:assign']
  },
  [DepartmentPosition.SENIOR_EMPLOYEE]: {
    key: DepartmentPosition.SENIOR_EMPLOYEE,
    name: '高级员工',
    description: '具有丰富经验的资深员工',
    level: 4,
    permissions: ['task:execute', 'mentor:junior']
  },
  [DepartmentPosition.EMPLOYEE]: {
    key: DepartmentPosition.EMPLOYEE,
    name: '员工',
    description: '部门普通员工',
    level: 3,
    permissions: ['task:execute']
  },
  [DepartmentPosition.INTERN]: {
    key: DepartmentPosition.INTERN,
    name: '实习生',
    description: '实习期员工',
    level: 1,
    permissions: ['task:learn']
  },
  [DepartmentPosition.CONSULTANT]: {
    key: DepartmentPosition.CONSULTANT,
    name: '顾问',
    description: '提供专业咨询和建议',
    level: 6,
    permissions: ['consult:provide', 'report:view']
  }
};

// 获取职位信息的工具函数
export const getPositionInfo = (position: DepartmentPosition): DepartmentPositionInfo => {
  return DEPARTMENT_POSITIONS[position];
};

// 获取所有职位选项
export const getPositionOptions = () => {
  return Object.values(DEPARTMENT_POSITIONS).sort((a, b) => b.level - a.level);
};

// 检查职位等级
export const isHigherPosition = (position1: DepartmentPosition, position2: DepartmentPosition): boolean => {
  return DEPARTMENT_POSITIONS[position1].level > DEPARTMENT_POSITIONS[position2].level;
};

// 获取职位的权限列表
export const getPositionPermissions = (position: DepartmentPosition): string[] => {
  return DEPARTMENT_POSITIONS[position].permissions;
};