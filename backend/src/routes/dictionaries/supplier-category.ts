import { Router } from 'express';
import { SupplierCategory } from '@zyerp/shared';

const router: import('express').Router = Router();

router.get('/supplier-category', (req, res) => {
  res.json({
    success: true,
    data: {
      data: [
        { label: '制造商', value: SupplierCategory.MANUFACTURER, status: 'Processing' },
        { label: '分销商', value: SupplierCategory.DISTRIBUTOR, status: 'Success' },
        { label: '服务商', value: SupplierCategory.SERVICE, status: 'Warning' },
        { label: '其他', value: SupplierCategory.OTHER, status: 'Default' },
      ]
    },
    message: '',
    timestamp: Date.now(),
  });
});

export default router;
