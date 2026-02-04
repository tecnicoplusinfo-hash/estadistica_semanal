import { useState, useEffect } from 'react';
import { usersApi } from '../../services/api';
import { ProtectedRoute } from '../common/ProtectedRoute';
import './UserManagement.css';

export function UserManagement() {
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'TRABAJADOR'
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await usersApi.list();
      setUsers(data);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      if (editingUser) {
        await usersApi.update(editingUser.id, {
          email: formData.email,
          name: formData.name,
          role: formData.role
        });
      } else {
        await usersApi.create(formData);
      }

      setFormData({ email: '', password: '', name: '', role: 'TRABAJADOR' });
      setShowForm(false);
      setEditingUser(null);
      loadUsers();
    } catch (err) {
      setError(err.message || 'Error al guardar');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      password: '',
      name: user.name,
      role: user.role
    });
    setShowForm(true);
  };

  const handleToggleActive = async (user) => {
    try {
      if (user.active) {
        await usersApi.deactivate(user.id);
      } else {
        await usersApi.activate(user.id);
      }
      loadUsers();
    } catch (error) {
      alert(error.message || 'Error al cambiar estado');
    }
  };

  const handlePasswordReset = async (user) => {
    const newPassword = prompt('Nueva contraseña para ' + user.name + ':');
    if (!newPassword) return;

    try {
      await usersApi.changePassword(user.id, newPassword);
      alert('Contraseña actualizada');
    } catch (error) {
      alert(error.message || 'Error al cambiar contraseña');
    }
  };

  return (
    <div className="user-management">
      <div className="page-header">
        <div>
          <h1>Gestión de Usuarios</h1>
          <p>Administrar usuarios y roles</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditingUser(null); }} className="btn-primary">
          + Nuevo Usuario
        </button>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => { setShowForm(false); setEditingUser(null); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}</h2>
              <button onClick={() => { setShowForm(false); setEditingUser(null); }} className="btn-close">×</button>
            </div>

            <form onSubmit={handleSubmit}>
              {error && <div className="form-error">{error}</div>}

              <div className="form-group">
                <label className="form-label">Nombre *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Rol *</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  required
                >
                  <option value="TRABAJADOR">Trabajador</option>
                  <option value="ADMIN">Administrador</option>
                </select>
              </div>

              {!editingUser && (
                <div className="form-group">
                  <label className="form-label">Contraseña *</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required={!editingUser}
                    minLength="6"
                  />
                </div>
              )}

              <div className="form-actions">
                <button type="button" onClick={() => { setShowForm(false); setEditingUser(null); }} className="btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? 'Guardando...' : (editingUser ? 'Actualizar' : 'Crear')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="loading">Cargando usuarios...</div>
      ) : (
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Registros</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td><strong>{user.name}</strong></td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`badge badge-${user.role.toLowerCase()}`}>
                      {user.role === 'ADMIN' ? 'Admin' : 'Trabajador'}
                    </span>
                  </td>
                  <td>
                    <span className={`badge badge-${user.active ? 'active' : 'inactive'}`}>
                      {user.active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td>{user._count?.statistics || 0}</td>
                  <td>
                    <div className="action-buttons">
                      <button onClick={() => handleEdit(user)} className="btn-secondary btn-sm">
                        Editar
                      </button>
                      <button onClick={() => handlePasswordReset(user)} className="btn-secondary btn-sm">
                        Contraseña
                      </button>
                      <button
                        onClick={() => handleToggleActive(user)}
                        className={`btn-sm ${user.active ? 'btn-danger' : 'btn-success'}`}
                      >
                        {user.active ? 'Desactivar' : 'Activar'}
                      </button>
                    </div>
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
