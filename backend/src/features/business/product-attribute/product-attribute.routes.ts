/**
 * 产品属性路由
 */

import express from 'express';
import { productAttributeController } from './product-attribute.controller';

const router: import('express').Router = express.Router();

router.get('/', productAttributeController.getAttributes.bind(productAttributeController));
router.get('/:id/values', productAttributeController.getAttributeValues.bind(productAttributeController));
router.post('/', productAttributeController.createAttribute.bind(productAttributeController));
router.patch('/:id', productAttributeController.updateAttribute.bind(productAttributeController));
router.delete('/:id', productAttributeController.deleteAttribute.bind(productAttributeController));

export default router;
