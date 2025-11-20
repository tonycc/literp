/**
 * 产品属性路由
 */

import express from 'express';
import { productAttributeController } from './product-attribute.controller';

const router: import('express').Router = express.Router();

router.get('/', productAttributeController.getAttributes.bind(productAttributeController));
router.post('/', productAttributeController.createAttribute.bind(productAttributeController));
router.patch('/:id', productAttributeController.updateAttribute.bind(productAttributeController));
router.delete('/:id', productAttributeController.deleteAttribute.bind(productAttributeController));
router.get('/:id/values', productAttributeController.getAttributeValues.bind(productAttributeController));
router.post('/:id/values', productAttributeController.createAttributeValues.bind(productAttributeController));
router.patch('/values/:valueId', productAttributeController.updateAttributeValue.bind(productAttributeController));
router.delete('/values/:valueId', productAttributeController.deleteAttributeValue.bind(productAttributeController));

export default router;
