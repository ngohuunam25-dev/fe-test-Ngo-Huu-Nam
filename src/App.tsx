import { Navigate, Route, Routes } from 'react-router-dom';

import MainLayout from './layouts/MainLayout';

import DashboardPage from './pages/DashboardPage';
import TaskPage from './pages/TaskPage';

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Auth routes */}
      <Route path="/" element={<MainLayout />}>
        {/* Protected routes */}
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/tasks" element={<TaskPage />} />
      </Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
