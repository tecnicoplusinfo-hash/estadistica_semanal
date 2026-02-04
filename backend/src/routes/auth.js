import express from 'express';
import {
  login,
  register,
  getProfile
} from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Registro (solo para crear el primer admin)
router.post('/register', register);

// Login
router.post('/login', login);

// Perfil del usuario actual
router.get('/profile', authenticateToken, getProfile);

export default router;
