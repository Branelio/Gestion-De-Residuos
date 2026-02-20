import { useState, useEffect } from 'react';
import { reportService, WasteReport, ReportStats } from '@/infrastructure/services/reportService';
import './ReportsPage.css';

const typeLabels: Record<string, string> = {
    OVERFLOW: '🗑️ Contenedor Lleno',
    ILLEGAL_DUMP: '🚫 Basurero Ilegal',
    DAMAGED_CONTAINER: '🔧 Punto Crítico',
    MISSED_COLLECTION: '📅 Recolección Perdida',
    DANGEROUS: '⚠️ Residuo Peligroso',
};

const statusLabels: Record<string, string> = {
    PENDING: 'Pendiente',
    IN_PROGRESS: 'En Proceso',
    RESOLVED: 'Resuelto',
    REJECTED: 'Rechazado',
};

const statusColors: Record<string, string> = {
    PENDING: '#F59E0B',
    IN_PROGRESS: '#3B82F6',
    RESOLVED: '#10B981',
    REJECTED: '#EF4444',
};

export default function ReportsPage() {
    const [reports, setReports] = useState<WasteReport[]>([]);
    const [stats, setStats] = useState<ReportStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<string>('ALL');
    const [filterType, setFilterType] = useState<string>('ALL');
    const [selectedReport, setSelectedReport] = useState<WasteReport | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        const [reportsData, statsData] = await Promise.all([
            reportService.getAll(),
            reportService.getStats(),
        ]);
        setReports(reportsData);
        setStats(statsData);
        setLoading(false);
    };

    const filteredReports = reports.filter(report => {
        const matchesStatus = filterStatus === 'ALL' || report.status === filterStatus;
        const matchesType = filterType === 'ALL' || report.type === filterType;
        return matchesStatus && matchesType;
    });

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('es-EC', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Cargando reportes...</p>
            </div>
        );
    }

    return (
        <div className="reports-page">
            {/* Header */}
            <header className="page-header">
                <div className="header-content">
                    <h1>📋 Dashboard de Reportes</h1>
                    <p>Gestiona y monitorea las incidencias reportadas por ciudadanos</p>
                </div>
                <button className="refresh-btn" onClick={loadData}>
                    🔄 Actualizar
                </button>
            </header>

            {/* Stats Cards */}
            {stats && (
                <div className="stats-grid">
                    <div className="stat-card total">
                        <span className="stat-value">{stats.total}</span>
                        <span className="stat-label">Total Reportes</span>
                    </div>
                    <div className="stat-card pending">
                        <span className="stat-value">{stats.pending}</span>
                        <span className="stat-label">Pendientes</span>
                    </div>
                    <div className="stat-card progress">
                        <span className="stat-value">{stats.inProgress}</span>
                        <span className="stat-label">En Proceso</span>
                    </div>
                    <div className="stat-card resolved">
                        <span className="stat-value">{stats.resolved}</span>
                        <span className="stat-label">Resueltos</span>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="filters-bar">
                <div className="filter-group">
                    <label>Estado:</label>
                    <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                        <option value="ALL">Todos</option>
                        <option value="PENDING">Pendiente</option>
                        <option value="IN_PROGRESS">En Proceso</option>
                        <option value="RESOLVED">Resuelto</option>
                        <option value="REJECTED">Rechazado</option>
                    </select>
                </div>
                <div className="filter-group">
                    <label>Tipo:</label>
                    <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                        <option value="ALL">Todos</option>
                        <option value="OVERFLOW">Contenedor Lleno</option>
                        <option value="ILLEGAL_DUMP">Basurero Ilegal</option>
                        <option value="DAMAGED_CONTAINER">Punto Crítico</option>
                        <option value="MISSED_COLLECTION">Recolección Perdida</option>
                        <option value="DANGEROUS">Residuo Peligroso</option>
                    </select>
                </div>
                <span className="filter-results">{filteredReports.length} reportes encontrados</span>
            </div>

            {/* Reports Table */}
            <div className="table-container">
                <table className="reports-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Tipo</th>
                            <th>Descripción</th>
                            <th>Ubicación</th>
                            <th>Estado</th>
                            <th>Fecha</th>
                            <th>Foto</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredReports.map((report) => (
                            <tr key={report.id}>
                                <td className="id-cell">#{report.id.slice(-6)}</td>
                                <td className="type-cell">{typeLabels[report.type] || report.type}</td>
                                <td className="desc-cell" title={report.description}>
                                    {report.description.length > 50
                                        ? report.description.slice(0, 50) + '...'
                                        : report.description}
                                </td>
                                <td className="location-cell">
                                    📍 {report.coordinates.latitude.toFixed(4)},{' '}
                                    {report.coordinates.longitude.toFixed(4)}
                                </td>
                                <td>
                                    <span
                                        className="status-badge"
                                        style={{ backgroundColor: statusColors[report.status] }}
                                    >
                                        {statusLabels[report.status]}
                                    </span>
                                </td>
                                <td className="date-cell">{formatDate(report.createdAt)}</td>
                                <td className="photo-cell">
                                    {report.photoUrl ? (
                                        <a href={report.photoUrl} target="_blank" rel="noreferrer">
                                            📷 Ver
                                        </a>
                                    ) : (
                                        <span className="no-photo">Sin foto</span>
                                    )}
                                </td>
                                <td className="actions-cell">
                                    <button
                                        className="action-btn view"
                                        onClick={() => setSelectedReport(report)}
                                    >
                                        👁️
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {filteredReports.length === 0 && (
                    <div className="no-results">
                        <p>No se encontraron reportes con los filtros seleccionados</p>
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            {selectedReport && (
                <div className="modal-overlay" onClick={() => setSelectedReport(null)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close" onClick={() => setSelectedReport(null)}>
                            ✕
                        </button>
                        <h2>Detalle del Reporte</h2>

                        <div className="detail-grid">
                            <div className="detail-item">
                                <label>ID:</label>
                                <span>{selectedReport.id}</span>
                            </div>
                            <div className="detail-item">
                                <label>Tipo:</label>
                                <span>{typeLabels[selectedReport.type]}</span>
                            </div>
                            <div className="detail-item">
                                <label>Estado:</label>
                                <span
                                    className="status-badge"
                                    style={{ backgroundColor: statusColors[selectedReport.status] }}
                                >
                                    {statusLabels[selectedReport.status]}
                                </span>
                            </div>
                            <div className="detail-item">
                                <label>Puntos:</label>
                                <span>🏆 +{selectedReport.pointsAwarded}</span>
                            </div>
                            <div className="detail-item full-width">
                                <label>Descripción:</label>
                                <p>{selectedReport.description}</p>
                            </div>
                            <div className="detail-item">
                                <label>Dirección:</label>
                                <span>{selectedReport.address}</span>
                            </div>
                            <div className="detail-item">
                                <label>Coordenadas:</label>
                                <span>
                                    {selectedReport.coordinates.latitude.toFixed(6)},{' '}
                                    {selectedReport.coordinates.longitude.toFixed(6)}
                                </span>
                            </div>
                            <div className="detail-item">
                                <label>Creado:</label>
                                <span>{formatDate(selectedReport.createdAt)}</span>
                            </div>
                            {selectedReport.photoUrl && (
                                <div className="detail-item full-width">
                                    <label>Foto:</label>
                                    <img
                                        src={selectedReport.photoUrl}
                                        alt="Reporte"
                                        className="report-image"
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            // Fallback: Si falla la carga, intentar reemplazar el host por localhost si estamos en dev
                                            // O mostrar una imagen placeholder
                                            if (!target.src.includes('placeholder')) {
                                                // Si la URL es de una IP local que no es alcanzable, intentar localhost (caso común dev)
                                                /*
                                                const url = new URL(target.src);
                                                if (url.hostname !== 'localhost') {
                                                    url.hostname = 'localhost';
                                                    target.src = url.toString();
                                                } else {
                                                    target.style.display = 'none'; // ocultar si falla todo
                                                }
                                                */
                                                target.onerror = null; // prevenir loop
                                                target.src = 'https://via.placeholder.com/400x300?text=Error+Cargando+Imagen';
                                            }
                                        }}
                                    />
                                    <p className="debug-url" style={{ fontSize: '0.8em', color: '#999', marginTop: '5px' }}>
                                        URL: {selectedReport.photoUrl}
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="modal-actions">
                            <a
                                href={`https://www.google.com/maps?q=${selectedReport.coordinates.latitude},${selectedReport.coordinates.longitude}`}
                                target="_blank"
                                rel="noreferrer"
                                className="btn btn-primary"
                            >
                                🗺️ Ver en Mapa
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
