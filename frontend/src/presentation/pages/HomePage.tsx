import { MapPin, Navigation, Award } from 'lucide-react';

function HomePage() {
  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          Bienvenido a Latacunga Limpia
        </h2>
        <p className="text-gray-600">
          Sistema de geolocalización para identificar puntos de acopio y basureros más cercanos en tiempo real.
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-primary-100 p-3 rounded-full">
              <MapPin className="w-6 h-6 text-primary-600" />
            </div>
            <h3 className="text-lg font-semibold">Puntos Cercanos</h3>
          </div>
          <p className="text-gray-600">
            Encuentra el basurero o punto de acopio más cercano a tu ubicación en tiempo real.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-primary-100 p-3 rounded-full">
              <Navigation className="w-6 h-6 text-primary-600" />
            </div>
            <h3 className="text-lg font-semibold">Reporta Residuos</h3>
          </div>
          <p className="text-gray-600">
            Reporta contenedores llenos o botaderos ilegales y ayuda a mantener Latacunga limpia.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-primary-100 p-3 rounded-full">
              <Award className="w-6 h-6 text-primary-600" />
            </div>
            <h3 className="text-lg font-semibold">Gana Puntos</h3>
          </div>
          <p className="text-gray-600">
            Acumula puntos limpios canjeables por descuentos en tasas municipales.
          </p>
        </div>
      </div>

      {/* Map Placeholder */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4">Mapa Interactivo</h3>
        <div className="bg-gray-200 rounded-lg h-96 flex items-center justify-center">
          <p className="text-gray-500">El mapa se cargará aquí con Leaflet</p>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4 text-center">
          <p className="text-3xl font-bold text-primary-600">24</p>
          <p className="text-gray-600 text-sm">Puntos de Acopio</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 text-center">
          <p className="text-3xl font-bold text-primary-600">156</p>
          <p className="text-gray-600 text-sm">Reportes Activos</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 text-center">
          <p className="text-3xl font-bold text-primary-600">8</p>
          <p className="text-gray-600 text-sm">Rutas Optimizadas</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 text-center">
          <p className="text-3xl font-bold text-primary-600">1.2k</p>
          <p className="text-gray-600 text-sm">Usuarios Activos</p>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
