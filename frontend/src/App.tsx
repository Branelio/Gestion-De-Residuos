import { Routes, Route } from 'react-router-dom';
import MainLayout from '@/presentation/layouts/MainLayout';
import HomePage from '@/presentation/pages/HomePage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} />
      </Route>
    </Routes>
  );
}

export default App;
