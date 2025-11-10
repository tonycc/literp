# 产品相关 TypeScript 接口总结

## 概述

本次工作完成了产品管理模块相关的 TypeScript 接口定义，基于之前创建的数据库设计，为前端开发提供了完整的类型支持。

## 创建的文件

### 1. 计量单位类型 (`src/types/unit.ts`)

**枚举类型：**
- `UnitCategory`: 单位分类（数量、重量、长度、面积、体积等）

**接口定义：**
- `UnitInfo`: 计量单位信息接口
- `UnitFormData`: 计量单位表单数据接口
- `UnitQueryParams`: 计量单位查询参数接口
- `UnitListResponse`: 计量单位列表响应接口
- `UnitConversion`: 单位换算接口
- `UnitConversionCalculation`: 单位换算计算接口

### 2. 仓库类型 (`src/types/warehouse.ts`)

**枚举类型：**
- `WarehouseType`: 仓库类型（主仓、分仓、虚拟仓）
- `WarehouseStatus`: 仓库状态（启用、停用、维护中）

**接口定义：**
- `WarehouseInfo`: 仓库信息接口
- `WarehouseFormData`: 仓库表单数据接口
- `WarehouseQueryParams`: 仓库查询参数接口
- `WarehouseListResponse`: 仓库列表响应接口

### 3. 产品类型 (`src/types/product.ts`) - 重构

**枚举类型：**
- `ProductType`: 产品类型（原材料、半成品、成品）
- `ProductStatus`: 产品状态（启用、停用、草稿）
- `AcquisitionMethod`: 获取方式（采购、生产、外协）
- `SpecificationType`: 规格参数类型（文本、数字、选择、布尔值）

**核心接口：**
- `ProductInfo`: 产品信息主接口
- `ProductSpecification`: 产品规格参数接口
- `ProductAlternativeUnit`: 产品辅助单位接口
- `ProductImage`: 产品图片接口
- `ProductDocument`: 产品文档接口

**业务接口：**
- `ProductFormData`: 产品表单数据接口
- `ProductQueryParams`: 产品查询参数接口
- `ProductListResponse`: 产品列表响应接口

**导入导出接口：**
- `ProductImportData`: 产品导入数据接口
- `ProductImportResult`: 产品导入结果接口
- `ProductExportData`: 产品导出数据接口

## 主要特性

### 1. 类型安全
- 所有接口都基于数据库设计，确保前后端数据结构一致
- 使用 TypeScript 严格类型检查，避免运行时错误
- 合理使用可选属性和联合类型

### 2. 模块化设计
- 按功能模块分离类型定义（unit、warehouse、product）
- 通过导入机制避免重复定义
- 清晰的依赖关系

### 3. 完整的业务覆盖
- 涵盖 CRUD 操作的所有数据结构
- 支持分页、查询、排序等常见业务需求
- 包含导入导出功能的类型定义

### 4. 扩展性
- 预留了扩展字段和可选属性
- 支持关联数据的可选加载
- 灵活的查询参数设计

## 与数据库设计的对应关系

| 数据库表 | TypeScript 接口 | 说明 |
|---------|----------------|------|
| `units` | `UnitInfo` | 计量单位信息 |
| `warehouses` | `WarehouseInfo` | 仓库信息 |
| `products` | `ProductInfo` | 产品主信息 |
| `product_specifications` | `ProductSpecification` | 产品规格参数 |
| `product_alternative_units` | `ProductAlternativeUnit` | 产品辅助单位 |
| `product_images` | `ProductImage` | 产品图片 |
| `product_documents` | `ProductDocument` | 产品文档 |

## 使用示例

```typescript
import { 
  ProductInfo, 
  ProductFormData, 
  ProductQueryParams,
  UnitInfo,
  WarehouseInfo 
} from '@zyerp/shared';

// 创建产品表单数据
const formData: ProductFormData = {
  code: 'P001',
  name: '示例产品',
  type: ProductType.FINISHED_PRODUCT,
  categoryId: 'cat-001',
  unitId: 'unit-001',
  status: ProductStatus.ACTIVE,
  acquisitionMethod: AcquisitionMethod.PRODUCTION,
  isActive: true
};

// 查询参数
const queryParams: ProductQueryParams = {
  page: 1,
  pageSize: 20,
  keyword: '示例',
  type: ProductType.FINISHED_PRODUCT,
  status: ProductStatus.ACTIVE
};
```

## 下一步工作

1. **后端 API 开发**: 基于这些接口创建对应的 API 端点
2. **前端页面开发**: 使用这些类型创建产品管理页面
3. **数据验证**: 添加运行时数据验证逻辑
4. **API 文档**: 生成基于类型的 API 文档

## 编译验证

所有类型定义已通过 TypeScript 编译器验证，确保：
- 语法正确性
- 类型一致性
- 导入导出正确性
- 无循环依赖

编译命令：`npm run build` ✅ 成功