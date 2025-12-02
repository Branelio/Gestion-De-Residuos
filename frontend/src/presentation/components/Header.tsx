import { MapPin, Menu } from 'lucide-react';

function Header() {
  return (
    <header className="bg-primary-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="w-8 h-8" />
          <div>
            <h1 className="text-2xl font-bold">Latacunga Limpia</h1>
            <p className="text-sm text-primary-100">Gestión Inteligente de Residuos</p>
          </div>
        </div>
        
        <button className="p-2 hover:bg-primary-700 rounded-lg transition">
          <Menu className="w-6 h-6" />
        </button>
      </div>
    </header>
  );
}

export default Header;
