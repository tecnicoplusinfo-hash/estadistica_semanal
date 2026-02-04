import prisma from '../config/database.js';
import { getCurrentWeek, getWeekRange, getRecentWeeks } from '../utils/weekHelper.js';

/**
 * Listar estadísticas con filtros
 */
export async function listStatistics(req, res) {
  try {
    const {
      weekNumber,
      year,
      userId,
      localId,
      type,
      pageType
    } = req.query;

    const where = {};

    // TRABAJADOR solo ve sus propias estadísticas
    if (req.user.role === 'TRABAJADOR') {
      where.userId = req.user.id;
    } else if (userId) {
      // ADMIN puede filtrar por usuario
      where.userId = userId;
    }

    if (localId) where.localId = localId;
    if (type) where.type = type.toUpperCase();
    if (pageType) where.pageType = pageType.toUpperCase();

    if (weekNumber && year) {
      where.weekNumber = parseInt(weekNumber);
      where.year = parseInt(year);
    }

    const statistics = await prisma.statistic.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
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
    console.error('Error al listar estadísticas:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
}

/**
 * Crear nueva estadística
 */
export async function createStatistic(req, res) {
  try {
    const { localId, type, quantity, pageType } = req.body;

    if (!localId || !type || quantity === undefined) {
      return res.status(400).json({
        error: 'Local, tipo y cantidad son requeridos'
      });
    }

    if (quantity < 0) {
      return res.status(400).json({ error: 'La cantidad no puede ser negativa' });
    }

    const validTypes = ['SERVICIOS', 'RESENAS', 'PAGINAS', 'TARJETAS', 'LLAVES'];
    if (!validTypes.includes(type.toUpperCase())) {
      return res.status(400).json({ error: 'Tipo de estadística inválido' });
    }

    // Para PAGINAS, pageType es requerido
    const typeUpper = type.toUpperCase();
    if (typeUpper === 'PAGINAS' && !pageType) {
      return res.status(400).json({ error: 'Para PÁGINAS debe especificar el subtipo' });
    }

    const validPageTypes = ['DIRECTORIOS', 'PAGINAS', 'OTROS'];
    if (pageType && !validPageTypes.includes(pageType.toUpperCase())) {
      return res.status(400).json({ error: 'Subtipo de página inválido' });
    }

    // Verificar que el local existe
    const local = await prisma.local.findUnique({
      where: { id: localId }
    });

    if (!local) {
      return res.status(404).json({ error: 'Local no encontrado' });
    }

    // Calcular semana actual
    const { weekNumber, year } = getCurrentWeek();

    const statistic = await prisma.statistic.create({
      data: {
        userId: req.user.id,
        localId,
        type: typeUpper,
        quantity: parseInt(quantity),
        pageType: pageType ? pageType.toUpperCase() : null,
        weekNumber,
        year
      },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        local: {
          select: { id: true, name: true }
        }
      }
    });

    res.status(201).json(statistic);
  } catch (error) {
    console.error('Error al crear estadística:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
}

/**
 * Actualizar estadística
 */
export async function updateStatistic(req, res) {
  try {
    const { id } = req.params;
    const { quantity, localId } = req.body;

    const statistic = await prisma.statistic.findUnique({
      where: { id }
    });

    if (!statistic) {
      return res.status(404).json({ error: 'Estadística no encontrada' });
    }

    // TRABAJADOR solo puede editar sus propias estadísticas
    if (req.user.role === 'TRABAJADOR' && statistic.userId !== req.user.id) {
      return res.status(403).json({
        error: 'No puedes editar estadísticas de otros usuarios'
      });
    }

    const updateData = {};
    if (quantity !== undefined) {
      if (quantity < 0) {
        return res.status(400).json({ error: 'La cantidad no puede ser negativa' });
      }
      updateData.quantity = parseInt(quantity);
    }
    if (localId) updateData.localId = localId;

    const updatedStatistic = await prisma.statistic.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        local: {
          select: { id: true, name: true }
        }
      }
    });

    res.json(updatedStatistic);
  } catch (error) {
    console.error('Error al actualizar estadística:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
}

/**
 * Eliminar estadística
 */
export async function deleteStatistic(req, res) {
  try {
    const { id } = req.params;

    const statistic = await prisma.statistic.findUnique({
      where: { id }
    });

    if (!statistic) {
      return res.status(404).json({ error: 'Estadística no encontrada' });
    }

    // TRABAJADOR solo puede eliminar sus propias estadísticas
    if (req.user.role === 'TRABAJADOR' && statistic.userId !== req.user.id) {
      return res.status(403).json({
        error: 'No puedes eliminar estadísticas de otros usuarios'
      });
    }

    await prisma.statistic.delete({
      where: { id }
    });

    res.json({ message: 'Estadística eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar estadística:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
}

/**
 * Obtener resumen de estadísticas (agregadas)
 */
export async function getSummary(req, res) {
  try {
    const {
      weekNumber,
      year,
      userId,
      localId,
      type
    } = req.query;

    const where = {};

    // TRABAJADOR solo ve sus propias estadísticas
    if (req.user.role === 'TRABAJADOR') {
      where.userId = req.user.id;
    } else if (userId) {
      where.userId = userId;
    }

    if (localId) where.localId = localId;
    if (type) where.type = type.toUpperCase();

    if (weekNumber && year) {
      where.weekNumber = parseInt(weekNumber);
      where.year = parseInt(year);
    }

    // Obtener estadísticas agrupadas
    const statistics = await prisma.statistic.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true }
        },
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

    // Agrupar por tipo y local
    const summary = {
      byType: {},
      byLocal: {},
      byUser: {},
      total: 0,
      weekInfo: weekNumber && year ? {
        weekNumber: parseInt(weekNumber),
        year: parseInt(year)
      } : getCurrentWeek()
    };

    statistics.forEach(stat => {
      // Por tipo
      if (!summary.byType[stat.type]) {
        summary.byType[stat.type] = { count: 0, quantity: 0 };
      }
      summary.byType[stat.type].count++;
      summary.byType[stat.type].quantity += stat.quantity;

      // Por local
      if (!summary.byLocal[stat.local.name]) {
        summary.byLocal[stat.local.name] = { count: 0, quantity: 0 };
      }
      summary.byLocal[stat.local.name].count++;
      summary.byLocal[stat.local.name].quantity += stat.quantity;

      // Por usuario (solo ADMIN ve esto)
      if (req.user.role === 'ADMIN') {
        if (!summary.byUser[stat.user.name]) {
          summary.byUser[stat.user.name] = { count: 0, quantity: 0 };
        }
        summary.byUser[stat.user.name].count++;
        summary.byUser[stat.user.name].quantity += stat.quantity;
      }

      summary.total += stat.quantity;
    });

    res.json(summary);
  } catch (error) {
    console.error('Error al obtener resumen:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
}

/**
 * Obtener lista de semanas disponibles para filtros
 */
export async function getWeeks(req, res) {
  try {
    const weeks = getRecentWeeks(26); // Últimos 6 meses
    res.json(weeks);
  } catch (error) {
    console.error('Error al obtener semanas:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
}
