import type { Request, Response } from 'express';
import { BaseController } from '../../../shared/controllers/base.controller';
import { DefectService } from './defect.service';
import { ErrorHandler } from '../../../shared/decorators/error-handler';

export class DefectController extends BaseController {
  private defectService: DefectService;

  constructor() {
    super();
    this.defectService = new DefectService();
  }

  @ErrorHandler
  async getList(req: Request, res: Response) {
    const { page, pageSize, keyword, isActive } = req.query;
    
    const result = await this.defectService.getDefects({
      page: Number(page) || 1,
      pageSize: Number(pageSize) || 20,
      keyword: keyword as string,
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
    });

    this.success(res, result);
  }

  @ErrorHandler
  async getActiveList(req: Request, res: Response) {
    const result = await this.defectService.getActiveDefects();
    this.success(res, result);
  }

  @ErrorHandler
  async create(req: Request, res: Response) {
    const result = await this.defectService.createDefect(req.body);
    this.success(res, result, 'Created successfully');
  }

  @ErrorHandler
  async update(req: Request, res: Response) {
    const { id } = req.params;
    const result = await this.defectService.updateDefect(id, req.body);
    this.success(res, result, 'Updated successfully');
  }

  @ErrorHandler
  async delete(req: Request, res: Response) {
    const { id } = req.params;
    await this.defectService.deleteDefect(id);
    this.success(res, null, 'Deleted successfully');
  }
}
