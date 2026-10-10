import { Router } from 'express';
import { listAccounts, createAccount, updateAccount, deleteAccount } from '../controllers/accountController';
import { asyncHandler } from '../middleware/errorHandler';
import entryRoutes from './entryRoutes';

const router = Router();

router.get('/', asyncHandler(listAccounts));
router.post('/', asyncHandler(createAccount));
router.patch('/:id', asyncHandler(updateAccount));
router.delete('/:id', asyncHandler(deleteAccount));

// Entries are always scoped to an account: /api/accounts/:accountId/entries
router.use('/:accountId/entries', entryRoutes);

export default router;
