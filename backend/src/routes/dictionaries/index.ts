import { Router } from 'express';
import userStatusRouter from './user-status';

const router: import('express').Router = Router();

router.use(userStatusRouter);

export default router;