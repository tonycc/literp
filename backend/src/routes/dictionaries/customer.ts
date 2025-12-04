import { Router } from 'express';
import { CustomerCategory, CustomerStatus, CreditLevel } from '@zyerp/shared';

const router: import('express').Router = Router();

// 客户分类字典
router.get('/customer-category', (req, res) => {
  res.json({
    success: true,
    data: {
      data: [
        { label: '企业客户', value: CustomerCategory.ENTERPRISE, status: 'Processing' },
        { label: '个人客户', value: CustomerCategory.INDIVIDUAL, status: 'Success' },
        { label: '政府机关', value: CustomerCategory.GOVERNMENT, status: 'Error' },
        { label: '事业单位', value: CustomerCategory.INSTITUTION, status: 'Warning' },
      ]
    },
    message: '',
    timestamp: Date.now(),
  });
});

// 客户状态字典
router.get('/customer-status', (req, res) => {
  res.json({
    success: true,
    data: {
      data: [
        { label: '正常', value: CustomerStatus.ACTIVE, status: 'Success' },
        { label: '停用', value: CustomerStatus.INACTIVE, status: 'Default' },
        { label: '暂停', value: CustomerStatus.SUSPENDED, status: 'Warning' },
        { label: '黑名单', value: CustomerStatus.BLACKLISTED, status: 'Error' },
      ]
    },
    message: '',
    timestamp: Date.now(),
  });
});

// 信用等级字典
router.get('/customer-credit-level', (req, res) => {
  res.json({
    success: true,
    data: {
      data: [
        { label: 'AAA级', value: CreditLevel.AAA, status: 'Success' },
        { label: 'AA级', value: CreditLevel.AA, status: 'Success' },
        { label: 'A级', value: CreditLevel.A, status: 'Processing' },
        { label: 'BBB级', value: CreditLevel.BBB, status: 'Processing' },
        { label: 'BB级', value: CreditLevel.BB, status: 'Warning' },
        { label: 'B级', value: CreditLevel.B, status: 'Warning' },
        { label: 'C级', value: CreditLevel.C, status: 'Error' },
      ]
    },
    message: '',
    timestamp: Date.now(),
  });
});

export default router;
