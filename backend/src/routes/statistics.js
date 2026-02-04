import express from 'express';
import {
  listStatistics,
  createStatistic,
  updateStatistic,
  deleteStatistic,
  getSummary,
  getWeeks
} from '../controllers/statisticController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Listar estadísticas con filtros
router.get('/', listStatistics);

// Obtener resumen agregado
router.get('/summary', getSummary);

// Obtener lista de semanas
router.get('/weeks', getWeeks);

// Crear nueva estadística
router.post('/', createStatistic);

// Editar estadística
router.put('/:id', updateStatistic);

// Eliminar estadística
router.delete('/:id', deleteStatistic);

export default router;
