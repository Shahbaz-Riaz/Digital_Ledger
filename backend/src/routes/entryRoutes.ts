import { Router } from 'express';
import { listEntries, createEntry, updateEntry, deleteEntry, exportCsv } from '../controllers/entryController';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router({ mergeParams: true });

router.get('/', asyncHandler(listEntries));
router.post('/', asyncHandler(createEntry));
router.patch('/:entryId', asyncHandler(updateEntry));
router.delete('/:entryId', asyncHandler(deleteEntry));
router.get('/export/csv', asyncHandler(exportCsv));

export default router;
