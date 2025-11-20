import { Router } from 'express'
import { authenticateToken } from '../../../shared/middleware/auth'
import { ProductionReportController } from './production-report.controller'

const router: import('express').Router = Router()
const controller = new ProductionReportController()

router.use(authenticateToken)

router.get('/reports', controller.list.bind(controller))
router.get('/reports/:id', controller.getById.bind(controller))
router.post('/reports', controller.create.bind(controller))

export default router