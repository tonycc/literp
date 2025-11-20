import { Router } from 'express';
import { authenticateToken } from '../../../shared/middleware/auth';
import { CustomerController } from './customer.controller';

const router: import('express').Router = Router();
const controller = new CustomerController();

router.use(authenticateToken);

router.get('/', controller.getCustomers.bind(controller));
router.get('/options', controller.getCustomerOptions.bind(controller));
router.get('/:id', controller.getCustomerById.bind(controller));
router.post('/', controller.createCustomer.bind(controller));
router.put('/:id', controller.updateCustomer.bind(controller));
router.delete('/:id', controller.deleteCustomer.bind(controller));

export default router;