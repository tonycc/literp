import { Request, Response } from 'express';
import { BomService } from './bom.service';
import { BaseController } from '../../../shared/controllers/base.controller';
import type { User, JwtPayload } from '@zyerp/shared';

export class BomController extends BaseController {
  private bomService: BomService;

  constructor() {
    super();
    this.bomService = new BomService();
  }

  /**
   * 创建BOM
   */
  async createBom(req: Request, res: Response) {
    return this.asyncHandler(async (req, res) => {
      const userPayload = req.user as JwtPayload;
      const result = await this.bomService.createBom(req.body, userPayload);
      if (result.success) {
        this.success(res, result.data, result.message);
      } else {
        this.error(res, new Error(result.message), result.message || '创建BOM失败');
      }
    })(req, res);
  }

  /**
   * 获取BOM列表
   */
  async getBoms(req: Request, res: Response) {
    return this.asyncHandler(async (req, res) => {
      const result = await this.bomService.getBoms(req.query);
      if (result.success) {
        this.success(res, result.data, result.message);
      } else {
        this.error(res, new Error(result.message), result.message || '获取BOM列表失败');
      }
    })(req, res);
  }

  /**
   * 检查BOM编码是否可用
   */
  async checkBomCode(req: Request, res: Response) {
    return this.asyncHandler(async (req, res) => {
      const isAvailable = await this.bomService.isBomCodeAvailable(req.params.code);
      this.success(res, { isAvailable });
    })(req, res);
  }

  /**
   * 获取BOM物料项
   */
  async getBomItems(req: Request, res: Response) {
    return this.asyncHandler(async (req, res) => {
      const items = await this.bomService.getBomItems(req.params.id);
      this.success(res, items);
    })(req, res);
  }

  /**
   * 获取BOM母子结构树
   */
  async getBomTree(req: Request, res: Response) {
    return this.asyncHandler(async (req, res) => {
      const tree = await this.bomService.getBomTree(req.params.id);
      this.success(res, tree);
    })(req, res);
  }

  /**
   * 添加BOM物料项
   */
  async addBomItem(req: Request, res: Response) {
    return this.asyncHandler(async (req, res) => {
      const result = await this.bomService.addBomItem(req.params.id, req.body, req.user as User);
      if (result.success) {
        this.success(res, result.data, result.message);
      } else {
        this.error(res, new Error(result.message), result.message || '添加BOM物料项失败');
      }
    })(req, res);
  }

  /**
   * 更新BOM物料项
   */
  async updateBomItem(req: Request, res: Response) {
    return this.asyncHandler(async (req, res) => {
      const result = await this.bomService.updateBomItem(req.params.itemId, req.body, req.user as User);
      if (result.success) {
        this.success(res, result.data, result.message);
      } else {
        this.error(res, new Error(result.message), result.message || '更新BOM物料项失败');
      }
    })(req, res);
  }

  /**
   * 删除BOM物料项
   */
  async deleteBomItem(req: Request, res: Response) {
    return this.asyncHandler(async (req, res) => {
      const result = await this.bomService.deleteBomItem(req.params.itemId);
      if (result.success) {
        this.success(res, null, result.message);
      } else {
        this.error(res, new Error(result.message), result.message || '删除BOM物料项失败');
      }
    })(req, res);
  }

  /**
   * 导出BOM
   */
  async exportBoms(req: Request, res: Response) {
    return this.asyncHandler(async (_req: Request, res: Response) => {
      try {
        const result = await this.bomService.exportBoms(req.query);
        if (result.success) {
          // TODO: 当导出功能实现后，这里应该下载文件
          this.success(res, null, result.message);
        } else {
          this.error(res, new Error(result.message), result.message || '导出BOM失败');
        }
      } catch (error) {
        this.error(res, error, '导出BOM失败');
      }
    })(req, res);
  }

  /**
   * 导入BOM
   */
  async importBoms(req: Request, res: Response) {
    return this.asyncHandler(async (_req: Request, res: Response) => {
      const file = req.file;
      if (!file) {
        return this.error(res, new Error('请选择要导入的文件'), '导入BOM失败');
      }

      const result = await this.bomService.importBoms(file.path, req.user as User);
      if (result.success) {
        this.success(res, null, result.message);
      } else {
        this.error(res, new Error(result.message), result.message || '导入BOM失败');
      }
    })(req, res);
  }

  /**
   * 获取导入模板
   */
  async getImportTemplate(req: Request, res: Response) {
    return this.asyncHandler(async (_req: Request, res: Response) => {
      try {
        const result = await this.bomService.getImportTemplate();
        if (result.success) {
          // TODO: 当模板功能实现后，这里应该下载模板文件
          this.success(res, null, result.message);
        } else {
          this.error(res, new Error(result.message), result.message || '获取导入模板失败');
        }
      } catch (error) {
        this.error(res, error, '获取导入模板失败');
      }
    })(req, res);
  }

  /**
   * 批量同步BOM物料项
   */
  async syncBomItems(req: Request, res: Response) {
    return this.asyncHandler(async (req, res) => {
      const items = Array.isArray(req.body?.items) ? req.body.items : [];
      const result = await this.bomService.syncBomItems(req.params.id, items, req.user as User);
      if (result.success) {
        this.success(res, result.data, result.message);
      } else {
        this.error(res, new Error(result.message), result.message || '批量同步BOM物料项失败');
      }
    })(req, res);
  }

  /**
   * 根据编码获取BOM详情
   */
  async getBomByCode(req: Request, res: Response) {
    return this.asyncHandler(async (req, res) => {
      const bom = await this.bomService.getBomByCode(req.params.code);
      this.success(res, bom);
    })(req, res);
  }

  /**
   * 批量删除BOM
   */
  async batchDeleteBoms(req: Request, res: Response) {
    return this.asyncHandler(async (req, res) => {
      const result = await this.bomService.batchDeleteBoms(req.body.ids, req.user as User);
      if (result.success) {
        this.success(res, null, result.message);
      } else {
        this.error(res, new Error(result.message), result.message || '批量删除BOM失败');
      }
    })(req, res);
  }

  /**
   * 批量更新BOM状态
   */
  async batchUpdateBomStatus(req: Request, res: Response) {
    return this.asyncHandler(async (req, res) => {
      const result = await this.bomService.batchUpdateBomStatus(req.body.ids, req.body.status, req.user as User);
      if (result.success) {
        this.success(res, null, result.message);
      } else {
        this.error(res, new Error(result.message), result.message || '批量更新BOM状态失败');
      }
    })(req, res);
  }

  /**
   * 根据ID获取BOM详情
   */
  async getBomById(req: Request, res: Response) {
    return this.asyncHandler(async (req, res) => {
      const bom = await this.bomService.getBomById(req.params.id);
      this.success(res, bom);
    })(req, res);
  }

  /**
   * 更新BOM
   */
  async updateBom(req: Request, res: Response) {
    return this.asyncHandler(async (req, res) => {
      const result = await this.bomService.updateBom(req.params.id, req.body, req.user as User);
      if (result.success) {
        this.success(res, result.data, result.message);
      } else {
        this.error(res, new Error(result.message), result.message || '更新BOM失败');
      }
    })(req, res);
  }

  /**
   * 删除BOM
   */
  async deleteBom(req: Request, res: Response) {
    return this.asyncHandler(async (req, res) => {
      const result = await this.bomService.deleteBom(req.params.id, req.user as User);
      if (result.success) {
        this.success(res, null, result.message);
      } else {
        this.error(res, new Error(result.message), result.message || '删除BOM失败');
      }
    })(req, res);
  }

  /**
   * 切换BOM状态
   */
  async toggleBomStatus(req: Request, res: Response) {
    return this.asyncHandler(async (req, res) => {
      const result = await this.bomService.toggleBomStatus(req.params.id, req.user as User);
      if (result.success) {
        this.success(res, result.data, result.message);
      } else {
        this.error(res, new Error(result.message), result.message || '切换BOM状态失败');
      }
    })(req, res);
  }

  /**
   * 设置默认BOM
   */
  async setDefaultBom(req: Request, res: Response) {
    return this.asyncHandler(async (req, res) => {
      const result = await this.bomService.setDefaultBom(req.params.id, req.user as User);
      if (result.success) {
        this.success(res, null, result.message);
      } else {
        this.error(res, new Error(result.message), result.message || '设置默认BOM失败');
      }
    })(req, res);
  }

  /**
   * BOM版本比较
   */
  async compareBoms(req: Request, res: Response) {
    return this.asyncHandler(async (req, res) => {
      const comparison = await this.bomService.compareBoms(req.params.id, req.params.targetId);
      this.success(res, comparison);
    })(req, res);
  }

  /**
   * BOM成本计算
   */
  async calculateBomCost(req: Request, res: Response) {
    return this.asyncHandler(async (req, res) => {
      const calculation = await this.bomService.calculateBomCost(req.params.id);
      this.success(res, calculation);
    })(req, res);
  }
}