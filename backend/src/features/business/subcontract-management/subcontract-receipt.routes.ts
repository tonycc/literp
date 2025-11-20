import { Router } from 'express'
import { authenticateToken } from '../../../shared/middleware/auth'
import { SubcontractReceiptController } from './subcontract-receipt.controller'

const router: import('express').Router = Router()
const controller = new SubcontractReceiptController()

router.use(authenticateToken)

router.get('/', controller.list.bind(controller))
router.get('/:id', controller.getById.bind(controller))
router.post('/', controller.create.bind(controller))
router.patch('/:id/status', controller.updateStatus.bind(controller))

export default router
