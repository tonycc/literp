import { Router } from 'express';

const router: import('express').Router = Router();

router.get('/user-status', (req, res) => {
  res.json({
    success: true,
    data: {
      data: [
        { label: '启用', value: 'true', status: 'Success' },
        { label: '禁用', value: 'false', status: 'Default' },
      ]
    },
    message: '',
    timestamp: Date.now(),
  });
});

export default router;
