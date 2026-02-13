import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';
import App from './App.jsx';
import { LoginPage } from './pages/LoginPage';
import { Dashboard } from './pages/Dashboard';
import { DashboardLayout } from './pages/DashboardLayout';
import { CreateJoinMeeting } from './pages/CreateJoinMeeting';
import { History } from './pages/History';
import { isAuthenticated } from './services/authService';

function ProtectedRoute({ children }) {
  if (!isAuthenticated()) return <Navigate to="/login" replace />;
  return children;
}

function PublicRoute({ children }) {
  if (isAuthenticated()) return <Navigate to="/" replace />;
  return children;
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />

        <Route path="/" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="create-join" element={<CreateJoinMeeting />} />
          <Route path="history" element={<History />} />
        </Route>

        <Route path="/room/:roomId" element={<ProtectedRoute><App /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
