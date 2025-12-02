import { Router } from 'express';
import userStatusRouter from './user-status';
import supplierCategoryRouter from './supplier-category';

const router: import('express').Router = Router();

router.use(userStatusRouter);
router.use(supplierCategoryRouter);

export default router;