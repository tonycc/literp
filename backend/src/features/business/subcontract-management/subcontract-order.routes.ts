import { Router } from 'express'
import { authenticateToken } from '../../../shared/middleware/auth'
import { SubcontractOrderController } from './subcontract-order.controller'

const router: import('express').Router = Router()
const controller = new SubcontractOrderController()

router.use(authenticateToken)

router.get('/', controller.list.bind(controller))
router.get('/:id', controller.getById.bind(controller))
router.post('/', controller.create.bind(controller))
router.post('/generate-by-work-orders', controller.generateByWorkOrders.bind(controller))
router.patch('/:id/status', controller.updateStatus.bind(controller))
router.delete('/:id', controller.delete.bind(controller))

export default router
