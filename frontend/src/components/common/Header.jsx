import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Header.css';

export function Header() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="header-logo">
          📊 Estadística Semanal
        </Link>

        <nav className="header-nav">
          <Link to="/" className="header-link">Dashboard</Link>
          {isAdmin() && (
            <>
              <Link to="/statistics" className="header-link">Estadísticas</Link>
              <Link to="/users" className="header-link">Usuarios</Link>
              <Link to="/locals" className="header-link">Locales</Link>
            </>
          )}
          {!isAdmin() && (
            <Link to="/statistics" className="header-link">Mis Estadísticas</Link>
          )}
        </nav>

        <div className="header-user">
          <span className="header-username">{user?.name}</span>
          <span className={`badge badge-${user?.role?.toLowerCase()}`}>
            {user?.role === 'ADMIN' ? 'Admin' : 'Trabajador'}
          </span>
          <button onClick={handleLogout} className="btn-logout">
            Salir
          </button>
        </div>
      </div>
    </header>
  );
}
