import { Router } from 'express'
import { authenticateToken } from '../../../shared/middleware/auth'
import { SupplierPriceController } from './supplier-price.controller'

const router: import('express').Router = Router()
const controller = new SupplierPriceController()

router.use(authenticateToken)

router.get('/', (req, res, next) => controller.getList(req, res, next))
router.get('/:id', (req, res, next) => controller.getById(req, res, next))
router.post('/', (req, res, next) => controller.create(req, res, next))
router.put('/:id', (req, res, next) => controller.update(req, res, next))
router.delete('/:id', (req, res, next) => controller.delete(req, res, next))

export default router