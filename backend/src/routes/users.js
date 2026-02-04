import express from 'express';
import {
  listUsers,
  createUser,
  updateUser,
  changePassword,
  deactivateUser,
  activateUser,
  getUserStatistics
} from '../controllers/userController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Todas las rutas requieren rol de ADMIN
router.use(requireAdmin);

// Listar todos los usuarios
router.get('/', listUsers);

// Crear nuevo usuario
router.post('/', createUser);

// Editar usuario
router.put('/:id', updateUser);

// Cambiar contraseña de usuario
router.put('/:id/password', changePassword);

// Desactivar usuario
router.patch('/:id/deactivate', deactivateUser);

// Activar usuario
router.patch('/:id/activate', activateUser);

// Obtener estadísticas de un usuario
router.get('/:id/statistics', getUserStatistics);

export default router;
