import { Router } from 'express'
import { authenticateToken } from '../../../shared/middleware/auth'
import { ManufacturingOrderController } from './manufacturing-order.controller'

const router: import('express').Router = Router()
const controller = new ManufacturingOrderController()

router.use(authenticateToken)

router.post('/from-plan', controller.createFromPlan.bind(controller))
router.get('/', controller.getManufacturingOrders.bind(controller))
router.get('/:id', controller.getManufacturingOrderById.bind(controller))
router.post('/:id/confirm', controller.confirm.bind(controller))
router.post('/:id/cancel', controller.cancel.bind(controller))
router.post('/:id/generate-work-orders', controller.generateWorkOrders.bind(controller))
router.get('/:id/work-orders', controller.getWorkOrders.bind(controller))
router.delete('/:id', controller.remove.bind(controller))

export default router