/**
 * 产品属性控制器
 */
import { Request, Response } from 'express';
import { ProductAttributeService } from './product-attribute.service';

class ProductAttributeController {
  private productAttributeService = new ProductAttributeService();

  async getAttributes(req: Request, res: Response) {
    try {
      const result = await this.productAttributeService.getAttributes(req.query);
      res.json(result);
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'An unknown error occurred' });
      }
    }
  }

  async createAttribute(req: Request, res: Response) {
    try {
      const result = await this.productAttributeService.createAttribute(req.body || {})
      res.json(result)
    } catch (error) {
      res.status(500).json({ message: (error as any)?.message || 'Create attribute failed' })
    }
  }

  async updateAttribute(req: Request, res: Response) {
    try {
      const { id } = req.params as { id: string }
      const result = await this.productAttributeService.updateAttribute(id, req.body || {})
      res.json(result)
    } catch (error) {
      res.status(500).json({ message: (error as any)?.message || 'Update attribute failed' })
    }
  }

  async deleteAttribute(req: Request, res: Response) {
    try {
      const { id } = req.params as { id: string }
      const result = await this.productAttributeService.deleteAttribute(id)
      res.json(result)
    } catch (error) {
      res.status(500).json({ message: (error as any)?.message || 'Delete attribute failed' })
    }
  }

  async getAttributeValues(req: Request, res: Response) {
    try {
      const { id } = req.params as { id: string }
      const result = await this.productAttributeService.getAttributeValues(id, req.query)
      res.json(result)
    } catch (error) {
      res.status(500).json({ message: (error as any)?.message || 'Get attribute values failed' })
    }
  }

  async createAttributeValues(req: Request, res: Response) {
    try {
      const { id } = req.params as { id: string }
      const { values } = (req.body || {}) as { values: Array<{ name: string; code?: string; sortOrder?: number; isActive?: boolean }> }
      const result = await this.productAttributeService.createAttributeValues(id, values || [])
      res.json(result)
    } catch (error) {
      res.status(500).json({ message: (error as any)?.message || 'Create attribute values failed' })
    }
  }

  async updateAttributeValue(req: Request, res: Response) {
    try {
      const { valueId } = req.params as { valueId: string }
      const payload = req.body || {}
      const result = await this.productAttributeService.updateAttributeValue(valueId, payload)
      res.json(result)
    } catch (error) {
      res.status(500).json({ message: (error as any)?.message || 'Update attribute value failed' })
    }
  }

  async deleteAttributeValue(req: Request, res: Response) {
    try {
      const { valueId } = req.params as { valueId: string }
      const result = await this.productAttributeService.deleteAttributeValue(valueId)
      res.json(result)
    } catch (error) {
      res.status(500).json({ message: (error as any)?.message || 'Delete attribute value failed' })
    }
  }
}

export const productAttributeController = new ProductAttributeController();
