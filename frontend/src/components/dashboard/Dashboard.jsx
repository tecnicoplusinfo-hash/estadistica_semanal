import { useState, useEffect } from 'react';
import { statisticsApi, localsApi } from '../../services/api';
import { getRecentWeeks } from '../../utils/weekHelper';
import './Dashboard.css';

export function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [weeks, setWeeks] = useState([]);
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [locals, setLocals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [selectedWeek]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [weeksData, localsData, summaryData] = await Promise.all([
        statisticsApi.getWeeks(),
        localsApi.list(),
        statisticsApi.getSummary(
          selectedWeek ? { weekNumber: selectedWeek.weekNumber, year: selectedWeek.year } : {}
        )
      ]);

      setWeeks(weeksData);
      setLocals(localsData);
      setSummary(summaryData);

      if (!selectedWeek && weeksData.length > 0) {
        setSelectedWeek(weeksData[0]);
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Cargando dashboard...</div>;
  }

  const getTypeLabel = (type) => {
    const labels = {
      SERVICIOS: 'Servicios',
      RESENAS: 'Reseñas',
      PAGINAS: 'Páginas',
      TARJETAS: 'Tarjetas',
      LLAVES: 'Llaves'
    };
    return labels[type] || type;
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p>Resumen de estadísticas semanales</p>
        </div>
        <div className="week-selector">
          <select
            value={selectedWeek ? `${selectedWeek.year}-${selectedWeek.weekNumber}` : ''}
            onChange={(e) => {
              const [year, weekNumber] = e.target.value.split('-').map(Number);
              const week = weeks.find(w => w.weekNumber === weekNumber && w.year === year);
              setSelectedWeek(week);
            }}
          >
            {weeks.map(week => (
              <option key={`${week.year}-${week.weekNumber}`} value={`${week.year}-${week.weekNumber}`}>
                {week.label} {week.isCurrent ? '(Actual)' : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {summary && (
        <>
          <div className="stats-grid">
            <div className="stat-card stat-card-primary">
              <div className="stat-icon">📊</div>
              <div className="stat-info">
                <div className="stat-value">{summary.total}</div>
                <div className="stat-label">Total Registros</div>
              </div>
            </div>

            {Object.entries(summary.byType).map(([type, data]) => (
              <div key={type} className="stat-card">
                <div className="stat-icon">{getTypeIcon(type)}</div>
                <div className="stat-info">
                  <div className="stat-value">{data.quantity}</div>
                  <div className="stat-label">{getTypeLabel(type)}</div>
                  <div className="stat-sub">{data.count} registros</div>
                </div>
              </div>
            ))}
          </div>

          <div className="dashboard-sections">
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Por Local</h2>
              </div>
              <div className="locals-stats">
                {Object.entries(summary.byLocal).length > 0 ? (
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Local</th>
                        <th>Cantidad</th>
                        <th>Registros</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(summary.byLocal)
                        .sort(([, a], [, b]) => b.quantity - a.quantity)
                        .map(([local, data]) => (
                          <tr key={local}>
                            <td>{local}</td>
                            <td><strong>{data.quantity}</strong></td>
                            <td>{data.count}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="empty-state">No hay datos para mostrar</div>
                )}
              </div>
            </div>

            {summary.byUser && Object.keys(summary.byUser).length > 0 && (
              <div className="card">
                <div className="card-header">
                  <h2 className="card-title">Por Usuario</h2>
                </div>
                <div className="users-stats">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Usuario</th>
                        <th>Cantidad</th>
                        <th>Registros</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(summary.byUser)
                        .sort(([, a], [, b]) => b.quantity - a.quantity)
                        .map(([user, data]) => (
                          <tr key={user}>
                            <td>{user}</td>
                            <td><strong>{data.quantity}</strong></td>
                            <td>{data.count}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function getTypeIcon(type) {
  const icons = {
    SERVICIOS: '🔧',
    RESENAS: '⭐',
    PAGINAS: '📄',
    TARJETAS: '💳',
    LLAVES: '🔑'
  };
  return icons[type] || '📊';
}
