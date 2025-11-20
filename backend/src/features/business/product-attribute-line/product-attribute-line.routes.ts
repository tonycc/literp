import { Router } from 'express'
import { ProductAttributeLineService } from './product-attribute-line.service'
import { ProductAttributeLineController } from './product-attribute-line.controller'

const router: import('express').Router = Router({ mergeParams: true })
const service = new ProductAttributeLineService()
const controller = new ProductAttributeLineController(service)

router.get('/', controller.list)
router.post('/save', controller.save)
router.post('/', controller.create)
router.patch('/:lineId', controller.update)
router.delete('/:lineId', controller.delete)

export default router
