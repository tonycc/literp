import { Router } from 'express'
import { authenticateToken } from '../../../shared/middleware/auth'
import { SupplierController } from './supplier.controller'

const router: import('express').Router = Router()
const controller = new SupplierController()

router.use(authenticateToken)

router.get('/', (req, res, next) => controller.getSuppliers(req, res, next))
router.get('/:id', (req, res, next) => controller.getSupplierById(req, res, next))
router.post('/', (req, res, next) => controller.createSupplier(req, res, next))
router.put('/:id', (req, res, next) => controller.updateSupplier(req, res, next))
router.delete('/:id', (req, res, next) => controller.deleteSupplier(req, res, next))

export default router