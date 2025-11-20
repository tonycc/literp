import { Router } from 'express'
import { authenticateToken } from '../../../shared/middleware/auth'
import { MaterialIssueController } from './material-issue.controller'

const router: import('express').Router = Router()
const controller = new MaterialIssueController()

router.use(authenticateToken)

router.get('/orders', controller.list.bind(controller))
router.get('/orders/:id', controller.getById.bind(controller))
router.post('/work-orders/:id', controller.createForWorkOrder.bind(controller))
router.patch('/work-orders/:id/issue', controller.issueAll.bind(controller))
router.patch('/orders/:id/items/:itemId/issue', controller.issueItem.bind(controller))

export default router