import { Routes, Route } from 'react-router-dom';
import MainLayout from '@/presentation/layouts/MainLayout';
import HomePage from '@/presentation/pages/HomePage';
import ReportsPage from '@/presentation/pages/ReportsPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="reports" element={<ReportsPage />} />
      </Route>
    </Routes>
  );
}

export default App;
