import { useState, useEffect } from 'react';
import { localsApi } from '../../services/api';
import './LocalManagement.css';

export function LocalManagement() {
  const [locals, setLocals] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingLocal, setEditingLocal] = useState(null);
  const [formData, setFormData] = useState({ name: '', active: true });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadLocals();
  }, []);

  const loadLocals = async () => {
    try {
      const data = await localsApi.listAll();
      setLocals(data);
    } catch (error) {
      console.error('Error loading locals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      if (editingLocal) {
        await localsApi.update(editingLocal.id, formData);
      } else {
        await localsApi.create(formData.name);
      }

      setFormData({ name: '', active: true });
      setShowForm(false);
      setEditingLocal(null);
      loadLocals();
    } catch (err) {
      setError(err.message || 'Error al guardar');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (local) => {
    setEditingLocal(local);
    setFormData({ name: local.name, active: local.active });
    setShowForm(true);
  };

  const handleDelete = async (local) => {
    if (!confirm(`¿Eliminar "${local.name}"?`)) return;

    try {
      await localsApi.delete(local.id);
      loadLocals();
    } catch (error) {
      alert(error.message || 'Error al eliminar');
    }
  };

  const handleToggleActive = async (local) => {
    try {
      await localsApi.update(local.id, { active: !local.active });
      loadLocals();
    } catch (error) {
      alert(error.message || 'Error al cambiar estado');
    }
  };

  return (
    <div className="local-management">
      <div className="page-header">
        <div>
          <h1>Gestión de Locales</h1>
          <p>Administrar locales disponibles</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditingLocal(null); }} className="btn-primary">
          + Nuevo Local
        </button>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => { setShowForm(false); setEditingLocal(null); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingLocal ? 'Editar Local' : 'Nuevo Local'}</h2>
              <button onClick={() => { setShowForm(false); setEditingLocal(null); }} className="btn-close">×</button>
            </div>

            <form onSubmit={handleSubmit}>
              {error && <div className="form-error">{error}</div>}

              <div className="form-group">
                <label className="form-label">Nombre del Local *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: Mi Local"
                  required
                />
              </div>

              {editingLocal && (
                <div className="form-group">
                  <label className="form-label">Estado</label>
                  <select
                    value={formData.active ? 'true' : 'false'}
                    onChange={(e) => setFormData({ ...formData, active: e.target.value === 'true' })}
                  >
                    <option value="true">Activo</option>
                    <option value="false">Inactivo</option>
                  </select>
                </div>
              )}

              <div className="form-actions">
                <button type="button" onClick={() => { setShowForm(false); setEditingLocal(null); }} className="btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? 'Guardando...' : (editingLocal ? 'Actualizar' : 'Crear')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="loading">Cargando locales...</div>
      ) : (
        <div className="locals-grid">
          {locals.map(local => (
            <div key={local.id} className={`local-card ${!local.active ? 'local-card-inactive' : ''}`}>
              <div className="local-card-header">
                <h3>{local.name}</h3>
                <span className={`badge badge-${local.active ? 'active' : 'inactive'}`}>
                  {local.active ? 'Activo' : 'Inactivo'}
                </span>
              </div>
              <div className="local-card-stats">
                <span>{local._count?.statistics || 0} registros</span>
              </div>
              <div className="local-card-actions">
                <button onClick={() => handleEdit(local)} className="btn-secondary btn-sm">
                  Editar
                </button>
                <button
                  onClick={() => handleToggleActive(local)}
                  className={`btn-sm ${local.active ? 'btn-warning' : 'btn-success'}`}
                >
                  {local.active ? 'Desactivar' : 'Activar'}
                </button>
                <button onClick={() => handleDelete(local)} className="btn-danger btn-sm" disabled={local._count?.statistics > 0}>
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
