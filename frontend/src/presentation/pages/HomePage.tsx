import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Navigation, Award, AlertTriangle, CheckCircle, Clock, TrendingUp } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

interface Stats {
  collectionPoints: number;
  pendingReports: number;
  resolvedReports: number;
  totalReports: number;
}

function HomePage() {
  const [stats, setStats] = useState<Stats>({
    collectionPoints: 0,
    pendingReports: 0,
    resolvedReports: 0,
    totalReports: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch collection points stats
      const pointsRes = await fetch(`${API_BASE_URL}/collection-points/stats/summary`);
      const pointsData = await pointsRes.json();

      // Fetch reports
      const reportsRes = await fetch(`${API_BASE_URL}/waste-reports`);
      const reportsData = await reportsRes.json();

      const reports = reportsData.data || [];

      setStats({
        collectionPoints: pointsData.data?.total || 0,
        totalReports: reports.length,
        pendingReports: reports.filter((r: any) => r.status === 'PENDING').length,
        resolvedReports: reports.filter((r: any) => r.status === 'RESOLVED').length,
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError('Error al cargar estadísticas');
      // Use demo data on error
      setStats({
        collectionPoints: 22,
        totalReports: 0,
        pendingReports: 0,
        resolvedReports: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg shadow-lg p-8 text-white">
        <h2 className="text-3xl font-bold mb-2">
          🌿 Bienvenido a Latacunga Limpia
        </h2>
        <p className="text-primary-100 text-lg">
          Sistema de geolocalización para gestión inteligente de residuos
        </p>
        <div className="mt-6 flex gap-4 flex-wrap">
          <Link
            to="/reports"
            className="bg-white text-primary-600 px-6 py-3 rounded-lg font-semibold hover:bg-primary-50 transition shadow-md"
          >
            📋 Ver Reportes
          </Link>
          <button
            onClick={fetchStats}
            className="bg-primary-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-400 transition border border-primary-400"
          >
            🔄 Actualizar Datos
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center gap-3">
            <MapPin className="w-8 h-8 text-blue-500" />
            <div>
              <p className="text-3xl font-bold text-gray-800">
                {loading ? '...' : stats.collectionPoints}
              </p>
              <p className="text-gray-600 text-sm">Puntos de Acopio</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-indigo-500">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-indigo-500" />
            <div>
              <p className="text-3xl font-bold text-gray-800">
                {loading ? '...' : stats.totalReports}
              </p>
              <p className="text-gray-600 text-sm">Total Reportes</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
          <div className="flex items-center gap-3">
            <Clock className="w-8 h-8 text-yellow-500" />
            <div>
              <p className="text-3xl font-bold text-gray-800">
                {loading ? '...' : stats.pendingReports}
              </p>
              <p className="text-gray-600 text-sm">Pendientes</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-green-500" />
            <div>
              <p className="text-3xl font-bold text-gray-800">
                {loading ? '...' : stats.resolvedReports}
              </p>
              <p className="text-gray-600 text-sm">Resueltos</p>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          {error} - Mostrando datos de ejemplo
        </div>
      )}

      {/* Features Grid */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-blue-100 p-3 rounded-full">
              <MapPin className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold">Puntos Cercanos</h3>
          </div>
          <p className="text-gray-600">
            Encuentra el basurero o punto de acopio más cercano a tu ubicación en tiempo real.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-green-100 p-3 rounded-full">
              <Navigation className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold">Reportar Incidencias</h3>
          </div>
          <p className="text-gray-600">
            Reporta contenedores llenos o botaderos ilegales desde la app móvil.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-yellow-100 p-3 rounded-full">
              <Award className="w-6 h-6 text-yellow-600" />
            </div>
            <h3 className="text-lg font-semibold">Gana Puntos</h3>
          </div>
          <p className="text-gray-600">
            Acumula puntos canjeables por descuentos en tasas municipales.
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4">⚡ Acciones Rápidas</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <Link
            to="/reports"
            className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition border border-gray-200"
          >
            <div className="bg-indigo-100 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-800">Dashboard de Reportes</h4>
              <p className="text-sm text-gray-600">Ver todos los reportes y estadísticas</p>
            </div>
          </Link>

          <a
            href={API_BASE_URL.replace('/api', '/api-docs')}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition border border-gray-200"
          >
            <div className="bg-purple-100 p-3 rounded-lg">
              <Navigation className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-800">API Documentation</h4>
              <p className="text-sm text-gray-600">Ver documentación de Swagger</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
