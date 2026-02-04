import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { Header } from './components/common/Header';
import { LoginForm } from './components/auth/LoginForm';
import { Dashboard } from './components/dashboard/Dashboard';
import { StatList } from './components/statistics/StatList';
import { StatForm } from './components/statistics/StatForm';
import { UserManagement } from './components/users/UserManagement';
import { LocalManagement } from './components/locals/LocalManagement';
import './App.css';

function AppContent() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <p>Cargando...</p>
      </div>
    );
  }

  return (
    <div className="app">
      {isAuthenticated && <Header />}

      <main className={isAuthenticated ? 'main-content' : ''}>
        <Routes>
          <Route path="/login" element={
            isAuthenticated ? <Navigate to="/" replace /> : <LoginForm />
          } />

          <Route path="/" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />

          <Route path="/statistics" element={
            <ProtectedRoute>
              <div className="page-container">
                <div className="page-header-centered">
                  <h1>Estadísticas</h1>
                </div>
                <div className="stats-page-grid">
                  <StatForm onSuccess={() => window.location.reload()} />
                  <StatList />
                </div>
              </div>
            </ProtectedRoute>
          } />

          <Route path="/users" element={
            <ProtectedRoute requireAdmin>
              <UserManagement />
            </ProtectedRoute>
          } />

          <Route path="/locals" element={
            <ProtectedRoute requireAdmin>
              <LocalManagement />
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
