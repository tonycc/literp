import { Router } from 'express';
import { authenticateToken } from '../../../shared/middleware/auth';
import { CustomerPriceListController } from './customer-price-list.controller';

const router: import('express').Router = Router();
const controller = new CustomerPriceListController();

router.use(authenticateToken);

router.get('/', controller.getList.bind(controller));
router.get('/:id', controller.getById.bind(controller));
router.post('/', controller.create.bind(controller));
router.put('/:id', controller.update.bind(controller));
router.delete('/:id', controller.remove.bind(controller));

export default router;