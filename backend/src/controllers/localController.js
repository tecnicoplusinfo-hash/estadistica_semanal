import prisma from '../config/database.js';

/**
 * Listar todos los locales
 */
export async function listLocals(req, res) {
  try {
    const locals = await prisma.local.findMany({
      where: { active: true },
      orderBy: { name: 'asc' }
    });

    res.json(locals);
  } catch (error) {
    console.error('Error al listar locales:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
}

/**
 * Listar todos los locales (incluyendo inactivos, solo ADMIN)
 */
export async function listAllLocals(req, res) {
  try {
    const locals = await prisma.local.findMany({
      include: {
        _count: {
          select: { statistics: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    res.json(locals);
  } catch (error) {
    console.error('Error al listar locales:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
}

/**
 * Crear nuevo local (solo ADMIN)
 */
export async function createLocal(req, res) {
  try {
    const { name } = req.body;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: 'El nombre es requerido' });
    }

    const existingLocal = await prisma.local.findUnique({
      where: { name: name.trim() }
    });

    if (existingLocal) {
      return res.status(400).json({ error: 'El local ya existe' });
    }

    const local = await prisma.local.create({
      data: { name: name.trim() }
    });

    res.status(201).json(local);
  } catch (error) {
    console.error('Error al crear local:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
}

/**
 * Editar local (solo ADMIN)
 */
export async function updateLocal(req, res) {
  try {
    const { id } = req.params;
    const { name, active } = req.body;

    const local = await prisma.local.findUnique({
      where: { id }
    });

    if (!local) {
      return res.status(404).json({ error: 'Local no encontrado' });
    }

    const updateData = {};
    if (name) updateData.name = name.trim();
    if (typeof active === 'boolean') updateData.active = active;

    const updatedLocal = await prisma.local.update({
      where: { id },
      data: updateData
    });

    res.json(updatedLocal);
  } catch (error) {
    console.error('Error al actualizar local:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
}

/**
 * Eliminar local (solo ADMIN)
 */
export async function deleteLocal(req, res) {
  try {
    const { id } = req.params;

    // Verificar si tiene estadísticas asociadas
    const statsCount = await prisma.statistic.count({
      where: { localId: id }
    });

    if (statsCount > 0) {
      return res.status(400).json({
        error: `No se puede eliminar el local porque tiene ${statsCount} estadísticas asociadas`
      });
    }

    await prisma.local.delete({
      where: { id }
    });

    res.json({ message: 'Local eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar local:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
}
