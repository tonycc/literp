import { Router } from 'express'
import { authenticateToken } from '../../../shared/middleware/auth'
import { WorkOrderController } from './work-order.controller'

const router: import('express').Router = Router()
const controller = new WorkOrderController()

router.use(authenticateToken)

router.get('/', controller.list.bind(controller))
router.post('/', controller.create.bind(controller))
router.patch('/:id/status', controller.updateStatus.bind(controller))
router.delete('/:id', controller.delete.bind(controller))

export default router