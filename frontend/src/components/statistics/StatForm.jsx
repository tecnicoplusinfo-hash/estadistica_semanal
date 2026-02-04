import { useState, useEffect } from 'react';
import { statisticsApi, localsApi } from '../../services/api';
import { STAT_TYPES, PAGE_TYPES } from '../../utils/weekHelper';
import './StatForm.css';

export function StatForm({ onSuccess, type: defaultType }) {
  const [formData, setFormData] = useState({
    localId: '',
    type: defaultType || '',
    quantity: '',
    pageType: ''
  });
  const [locals, setLocals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadLocals();
  }, []);

  useEffect(() => {
    if (defaultType) {
      setFormData(prev => ({ ...prev, type: defaultType }));
    }
  }, [defaultType]);

  const loadLocals = async () => {
    try {
      const data = await localsApi.list();
      setLocals(data);
    } catch (error) {
      console.error('Error loading locals:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.localId || !formData.type || !formData.quantity) {
      setError('Todos los campos son obligatorios');
      return;
    }

    if (formData.type === 'PAGINAS' && !formData.pageType) {
      setError('Para páginas debes seleccionar un subtipo');
      return;
    }

    setLoading(true);

    try {
      await statisticsApi.create({
        localId: formData.localId,
        type: formData.type,
        quantity: parseInt(formData.quantity),
        pageType: formData.type === 'PAGINAS' ? formData.pageType : null
      });

      setFormData({
        localId: '',
        type: defaultType || '',
        quantity: '',
        pageType: ''
      });

      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || 'Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  const currentType = STAT_TYPES.find(t => t.value === formData.type);

  return (
    <div className="stat-form-card card">
      <div className="card-header">
        <h2 className="card-title">Registrar Estadística</h2>
      </div>

      <form onSubmit={handleSubmit}>
        {error && (
          <div className="form-error" style={{ padding: '12px', background: '#fee2e2', borderRadius: '6px', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Local *</label>
          <select
            value={formData.localId}
            onChange={(e) => setFormData({ ...formData, localId: e.target.value })}
            required
          >
            <option value="">Seleccionar local...</option>
            {locals.map(local => (
              <option key={local.id} value={local.id}>{local.name}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Tipo *</label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value, pageType: '' })}
            required
            disabled={!!defaultType}
          >
            <option value="">Seleccionar tipo...</option>
            {STAT_TYPES.map(type => (
              <option key={type.value} value={type.value}>
                {getStatTypeIcon(type.value)} {type.label}
              </option>
            ))}
          </select>
        </div>

        {formData.type === 'PAGINAS' && (
          <div className="form-group">
            <label className="form-label">Subtipo de Página *</label>
            <select
              value={formData.pageType}
              onChange={(e) => setFormData({ ...formData, pageType: e.target.value })}
              required
            >
              <option value="">Seleccionar subtipo...</option>
              {PAGE_TYPES.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Cantidad *</label>
          <input
            type="number"
            min="0"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
            placeholder="0"
            required
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar Estadística'}
          </button>
        </div>
      </form>

      {currentType && (
        <div className="form-preview">
          Registrando: <strong>{currentType.label}</strong>
          {formData.pageType && ` (${formData.pageType})`}
          {formData.quantity && `: ${formData.quantity}`}
        </div>
      )}
    </div>
  );
}

function getStatTypeIcon(type) {
  const icons = {
    SERVICIOS: '🔧',
    RESENAS: '⭐',
    PAGINAS: '📄',
    TARJETAS: '💳',
    LLAVES: '🔑'
  };
  return icons[type] || '';
}
