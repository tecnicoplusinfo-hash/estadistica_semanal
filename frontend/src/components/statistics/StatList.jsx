import { useState, useEffect } from 'react';
import { statisticsApi, localsApi, usersApi } from '../../services/api';
import { STAT_TYPES, PAGE_TYPES } from '../../utils/weekHelper';
import './StatList.css';

export function StatList() {
  const [statistics, setStatistics] = useState([]);
  const [locals, setLocals] = useState([]);
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({
    weekNumber: '',
    year: '',
    localId: '',
    type: '',
    userId: ''
  });
  const [loading, setLoading] = useState(true);
  const { isAdmin } = useAuth();

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== '')
      );

      const [statsData, localsData] = await Promise.all([
        statisticsApi.list(params),
        localsApi.list()
      ]);

      setStatistics(statsData);
      setLocals(localsData);

      if (isAdmin()) {
        const usersData = await usersApi.list();
        setUsers(usersData);
      }
    } catch (error) {
      console.error('Error loading statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar esta estadística?')) return;

    try {
      await statisticsApi.delete(id);
      setStatistics(statistics.filter(s => s.id !== id));
    } catch (error) {
      alert(error.message || 'Error al eliminar');
    }
  };

  const getTypeLabel = (type) => {
    return STAT_TYPES.find(t => t.value === type)?.label || type;
  };

  const getLocalName = (localId) => {
    return locals.find(l => l.id === localId)?.name || localId;
  };

  const getUserName = (userId) => {
    return users.find(u => u.id === userId)?.name || userId;
  };

  return (
    <div className="stat-list">
      <div className="stat-filters">
        <h3>Filtros</h3>
        <div className="filter-grid">
          <div className="form-group">
            <label className="form-label">Semana</label>
            <input
              type="number"
              placeholder="Ej: 5"
              value={filters.weekNumber}
              onChange={(e) => setFilters({ ...filters, weekNumber: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Año</label>
            <input
              type="number"
              placeholder="Ej: 2024"
              value={filters.year}
              onChange={(e) => setFilters({ ...filters, year: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Local</label>
            <select
              value={filters.localId}
              onChange={(e) => setFilters({ ...filters, localId: e.target.value })}
            >
              <option value="">Todos</option>
              {locals.map(local => (
                <option key={local.id} value={local.id}>{local.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Tipo</label>
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            >
              <option value="">Todos</option>
              {STAT_TYPES.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
          {isAdmin() && (
            <div className="form-group">
              <label className="form-label">Usuario</label>
              <select
                value={filters.userId}
                onChange={(e) => setFilters({ ...filters, userId: e.target.value })}
              >
                <option value="">Todos</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>{user.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>
        <button
          onClick={() => setFilters({ weekNumber: '', year: '', localId: '', type: '', userId: '' })}
          className="btn-secondary btn-sm"
        >
          Limpiar filtros
        </button>
      </div>

      {loading ? (
        <div className="loading">Cargando...</div>
      ) : statistics.length === 0 ? (
        <div className="empty-state">No hay estadísticas que mostrar</div>
      ) : (
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                {isAdmin() && <th>Usuario</th>}
                <th>Tipo</th>
                <th>Cantidad</th>
                <th>Local</th>
                <th>Semana</th>
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {statistics.map(stat => (
                <tr key={stat.id}>
                  {isAdmin() && <td>{getUserName(stat.userId)}</td>}
                  <td>
                    <span className="stat-type-badge" style={{ background: getStatTypeColor(stat.type) }}>
                      {getTypeLabel(stat.type)}
                    </span>
                    {stat.pageType && (
                      <span className="page-type-badge">{stat.pageType}</span>
                    )}
                  </td>
                  <td><strong>{stat.quantity}</strong></td>
                  <td>{getLocalName(stat.localId)}</td>
                  <td>Sem {stat.weekNumber} ({stat.year})</td>
                  <td>{new Date(stat.createdAt).toLocaleDateString('es-ES')}</td>
                  <td>
                    <button
                      onClick={() => handleDelete(stat.id)}
                      className="btn-danger btn-sm"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function getStatTypeColor(type) {
  const colors = {
    SERVICIOS: '#2563eb',
    RESENAS: '#22c55e',
    PAGINAS: '#f59e0b',
    TARJETAS: '#8b5cf6',
    LLAVES: '#ef4444'
  };
  return colors[type] || '#64748b';
}

// Import useAuth at the top
import { useAuth } from '../../context/AuthContext';
