import express from 'express';
import {
  listLocals,
  listAllLocals,
  createLocal,
  updateLocal,
  deleteLocal
} from '../controllers/localController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Listar locales activos (cualquier usuario autenticado)
router.get('/', authenticateToken, listLocals);

// Rutas de ADMIN
router.get('/all', authenticateToken, requireAdmin, listAllLocals);
router.post('/', authenticateToken, requireAdmin, createLocal);
router.put('/:id', authenticateToken, requireAdmin, updateLocal);
router.delete('/:id', authenticateToken, requireAdmin, deleteLocal);

export default router;
