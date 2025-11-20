import { Router } from 'express';
import { ProductVariantsController } from './product-variants.controller';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { ProductVariantsService } from './product-variants.service';

const router: import('express').Router = Router({ mergeParams: true });
const variantsDir = path.resolve(process.cwd(), 'uploads/variants');
try { fs.mkdirSync(variantsDir, { recursive: true }); } catch {}
const upload = multer({ storage: multer.diskStorage({ destination: variantsDir, filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`) }) });
const productVariantsService = new ProductVariantsService();
const productVariantsController = new ProductVariantsController(productVariantsService);

router.post('/generate', productVariantsController.generateVariants);
router.post('/batch', productVariantsController.batchCreateVariants);
router.get('/', productVariantsController.getVariants);
router.patch('/:variantId', productVariantsController.updateVariant);
router.delete('/:variantId', productVariantsController.deleteVariant);
// 变体库存
router.get('/:variantId/stock', productVariantsController.getVariantStock);
router.post('/:variantId/stock/adjust', productVariantsController.adjustVariantStock);
// 变体图片
router.get('/:variantId/images', productVariantsController.listVariantImages);
router.post('/:variantId/images', upload.single('image'), productVariantsController.uploadVariantImage);
router.delete('/:variantId/images/:imageId', productVariantsController.deleteVariantImage);

export default router;
