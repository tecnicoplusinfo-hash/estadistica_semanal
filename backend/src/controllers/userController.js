import prisma from '../config/database.js';
import bcrypt from 'bcryptjs';

/**
 * Listar todos los usuarios (solo ADMIN)
 */
export async function listUsers(req, res) {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        active: true,
        createdAt: true,
        _count: {
          select: { statistics: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    res.json(users);
  } catch (error) {
    console.error('Error al listar usuarios:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
}

/**
 * Crear nuevo usuario (solo ADMIN)
 */
export async function createUser(req, res) {
  try {
    const { email, password, name, role = 'TRABAJADOR' } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, contraseña y nombre son requeridos' });
    }

    if (!['ADMIN', 'TRABAJADOR'].includes(role.toUpperCase())) {
      return res.status(400).json({ error: 'Rol inválido' });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: role.toUpperCase()
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        active: true,
        createdAt: true
      }
    });

    res.status(201).json(user);
  } catch (error) {
    console.error('Error al crear usuario:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
}

/**
 * Editar usuario (solo ADMIN)
 */
export async function updateUser(req, res) {
  try {
    const { id } = req.params;
    const { email, name, role, active } = req.body;

    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const updateData = {};
    if (email) updateData.email = email;
    if (name) updateData.name = name;
    if (role) updateData.role = role.toUpperCase();
    if (typeof active === 'boolean') updateData.active = active;

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        active: true,
        updatedAt: true
      }
    });

    res.json(updatedUser);
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
}

/**
 * Cambiar contraseña de usuario (solo ADMIN)
 */
export async function changePassword(req, res) {
  try {
    const { id } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ error: 'Contraseña es requerida' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id },
      data: { password: hashedPassword }
    });

    res.json({ message: 'Contraseña actualizada correctamente' });
  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
}

/**
 * Desactivar usuario (solo ADMIN)
 */
export async function deactivateUser(req, res) {
  try {
    const { id } = req.params;

    if (id === req.user.id) {
      return res.status(400).json({ error: 'No puedes desactivarte a ti mismo' });
    }

    const user = await prisma.user.update({
      where: { id },
      data: { active: false },
      select: {
        id: true,
        email: true,
        name: true,
        active: true
      }
    });

    res.json(user);
  } catch (error) {
    console.error('Error al desactivar usuario:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
}

/**
 * Activar usuario (solo ADMIN)
 */
export async function activateUser(req, res) {
  try {
    const { id } = req.params;

    const user = await prisma.user.update({
      where: { id },
      data: { active: true },
      select: {
        id: true,
        email: true,
        name: true,
        active: true
      }
    });

    res.json(user);
  } catch (error) {
    console.error('Error al activar usuario:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
}

/**
 * Obtener estadísticas de un usuario específico (solo ADMIN)
 */
export async function getUserStatistics(req, res) {
  try {
    const { id } = req.params;
    const { weekNumber, year, type } = req.query;

    const where = { userId: id };

    if (weekNumber && year) {
      where.weekNumber = parseInt(weekNumber);
      where.year = parseInt(year);
    }

    if (type) {
      where.type = type.toUpperCase();
    }

    const statistics = await prisma.statistic.findMany({
      where,
      include: {
        local: {
          select: { id: true, name: true }
        }
      },
      orderBy: [
        { year: 'desc' },
        { weekNumber: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    res.json(statistics);
  } catch (error) {
    console.error('Error al obtener estadísticas del usuario:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
}
