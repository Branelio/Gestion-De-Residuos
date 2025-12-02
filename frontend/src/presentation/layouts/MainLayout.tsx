import { Outlet } from 'react-router-dom';
import Header from '@/presentation/components/Header';

function MainLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}

export default MainLayout;
