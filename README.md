# Fennec 后台管理系统框架

一个基于现代技术栈的企业级后台管理系统框架，采用 Monorepo 架构，提供完整的前后端解决方案。

> **项目章程**: 本项目遵循 [Fennec 章程](./.specify/memory/constitution.md) 中定义的核心原则，包括类型优先开发、共享类型系统、特性文件夹架构、测试驱动质量和渐进式增强。所有开发决策必须遵守章程中的不可协商原则。

## 🚀 技术栈

### 前端技术栈
- **React 19** - 最新版本的 React 框架
- **TypeScript** - 类型安全的 JavaScript 超集，严格类型检查
- **Vite** - 快速的构建工具
- **Ant Design Pro** 和 **Ant Design 5.x** - 企业级 UI 组件库
- **React Router v6** - 声明式路由
- **TanStack Query** - 服务端状态管理

### 后端技术栈
- **Node.js** + **Express** - 服务端框架
- **TypeScript** - 类型安全开发
- **Prisma ORM** - 类型安全的数据库访问层
- **JWT** - 无状态认证机制
- **Winston** - 结构化日志记录

### 开发工具
- **npm workspaces** - Monorepo 管理
- **ESLint** - 代码质量检查（零警告策略）
- **Prettier** - 代码格式化
- **TypeScript** - 强制严格类型检查（无 any 类型）

## 📁 项目结构

```
fennec/
├── frontend/          # 前端应用 (React + Vite + TypeScript)
├── backend/           # 后端服务 (Express + TypeScript)
├── shared/            # 共享代码 (类型定义、工具函数) - 唯一类型真实来源
├── .specify/          # 项目规范和模板
│   ├── memory/
│   │   └── constitution.md  # 项目章程 (核心原则)
│   └── templates/     # 特性开发模板
├── package.json       # 根目录配置
├── tsconfig.json      # TypeScript 配置
└── DESIGN.md          # 设计文档
```

## 🎯 核心原则

### 1. 类型优先开发（不可协商）
- 整个项目必须使用 TypeScript 并配置严格类型检查
- 除外部库声明外，不允许使用 `any` 类型
- 每一个公共 API 必须有明确的类型定义
- 所有重构操作必须通过类型安全验证

### 2. 共享类型系统（不可协商）
- `shared` 包是所有类型定义的唯一真实来源
- 前端和后端代码必须仅从 `shared` 导入类型
- 类型变更必须通过版本升级和依赖更新传播
- 不允许在包之间存在重复或分歧的类型定义

### 3. 特性文件夹架构
- 所有代码按业务域组织，使用特性文件夹结构
- 每个特性具有清晰、自包含的结构
- 跨特性依赖最小化并有清晰文档
- 共享工具属于根目录的 `shared` 包

## 🛠️ 开发指南

### 环境要求
- Node.js >= 18.0.0
- npm >= 9.0.0

### 安装依赖
```bash
# 安装所有工作空间的依赖
npm run install:all
```

### 开发命令
```bash
# 启动前端开发服务器
npm run dev

# 启动后端开发服务器
npm run server

# 同时启动前后端服务器
npm run dev:all

# 构建所有包
npm run build

# 运行测试
npm run test

# 代码检查
npm run lint

# 自动修复代码格式
npm run lint:fix
```

### 开发工作流

**特性开发流程**:
1. 创建特性分支：`###-feature-name`
2. 在 `shared/` 中定义类型（实现前必须步骤）
3. 编写契约测试（API 端点）
4. 编写集成测试（关键用户旅程）
5. 实现后端服务和 API
6. 实现前端组件和集成
7. 运行质量门禁检查
8. 提交包含测试验证的 PR

**质量门禁（不可协商）**:
- ✅ TypeScript 编译必须成功，无错误
- ✅ ESLint 必须通过，零警告
- ✅ 所有契约测试和集成测试必须通过
- ✅ 服务和工具的代码覆盖率 ≥ 80%
- ✅ 禁止使用 `any` 类型（除外部库声明）

### 工作空间命令
```bash
# 在特定工作空间中运行命令
npm run <script> -w <workspace>

# 例如：在前端工作空间中安装依赖
npm install <package> -w frontend

# 在后端工作空间中运行测试
npm run test -w backend
```

## 🏗️ 架构设计

### 核心设计原则（依据章程）
1. **单一真相来源** - 通过 `shared` 包统一前后端的类型定义（不可协商）
2. **模块边界清晰** - 采用 Feature-folder 架构，按业务领域组织代码
3. **安全默认开启** - 内置安全中间件、CORS 白名单、请求限流等
4. **可测试与可替换** - 依赖注入设计，便于单元测试和组件替换
5. **渐进式演进** - 遵循 YAGNI 原则，从 MVP 到企业级的清晰升级路径

### Feature-folder 架构
每个业务模块采用统一的文件组织结构：
```
features/auth/
├── components/        # 模块专用组件
├── hooks/            # 模块专用 Hooks
├── services/         # API 服务
├── types/            # 类型定义（注意：最终类型需在 shared/ 中定义）
├── utils/            # 工具函数
└── index.ts          # 模块导出
```

### Monorepo 工作空间
- **frontend/** - React 应用，特性文件夹架构
- **backend/** - Express API，服务层组织
- **shared/** - 仅包含类型定义和跨包工具函数（唯一类型真实来源）

### 测试策略（依据章程）
- **契约测试** - API 端点测试，必须在实现前创建
- **集成测试** - 关键用户旅程测试，确保跨功能兼容性
- **单元测试** - 工具函数和服务测试，覆盖率 ≥ 80%
- **TDD 周期** - 编写测试 → 审核 → 失败 → 实现

### 并行开发支持
- 基础架构完成后，特性可独立开发
- 共享类型必须版本化并原子化更新
- 多个开发者可同时开发不同特性
- 集成测试验证跨特性兼容性

## 📚 相关文档

- **[项目章程](./.specify/memory/constitution.md)** - 核心原则、开发规范、治理模型
- **[设计文档](./DESIGN.md)** - 详细架构设计和技术决策
- **[.specify 模板](./.specify/templates/)** - 特性开发模板和规范
  - plan-template.md - 实现计划模板
  - spec-template.md - 特性规格模板
  - tasks-template.md - 任务列表模板

## 🤝 贡献指南

1. 遵循 [Fennec 章程](./.specify/memory/constitution.md) 中的所有不可协商原则
2. 所有 PR 必须通过质量门禁检查
3. 新特性必须包含契约测试和集成测试
4. 复杂性违规必须文档化并说明被拒绝的替代方案
5. 类型变更必须在 `shared/` 包中进行并版本化

## 📄 许可证

本项目采用 MIT 许可证。详情请查看 [LICENSE](./LICENSE) 文件。

---

**版本**: 1.0.0 | **最后更新**: 2025-11-08