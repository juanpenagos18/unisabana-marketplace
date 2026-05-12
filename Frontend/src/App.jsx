import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import AuthSelectPage  from './pages/AuthSelectPage';
import RegisterPage    from './pages/RegisterPage';
import LoginPage       from './pages/LoginPage';
import HomePage        from './pages/HomePage';
import ProfilePage     from './pages/ProfilePage';

// Protege rutas que requieren sesión activa
const PrivateRoute = ({ children }) => {
  const { token, loading } = useAuth();
  if (loading) return null;
  return token ? children : <Navigate to="/" replace />;
};

function App() {
  return (
    <Routes>
      <Route path="/"         element={<AuthSelectPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/login"    element={<LoginPage />} />
      <Route path="/home"     element={<PrivateRoute><HomePage /></PrivateRoute>} />
      <Route path="/profile"  element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
      <Route path="*"         element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
