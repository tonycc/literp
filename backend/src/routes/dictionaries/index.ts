import { Router } from 'express';
import userStatusRouter from './user-status';
import supplierCategoryRouter from './supplier-category';
import customerRouter from './customer';

const router: import('express').Router = Router();

router.use(userStatusRouter);
router.use(supplierCategoryRouter);
router.use(customerRouter);

export default router;