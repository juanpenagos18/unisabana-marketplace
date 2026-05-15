import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRoute = ({ children }) => {
  const { user, token, loading } = useAuth();
  const location = useLocation();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => setReady(true), 80);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  if (loading || !ready) {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: 'var(--color-bg)' }}>
        <div className="w-8 h-8 border-4 rounded-full animate-spin"
          style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  // No logueado — manda al login guardando que quería ir a /admin
  if (!token) {
    return <Navigate to={`/login?redirect=${location.pathname}`} replace />;
  }

  // Logueado pero no es admin
  if (user?.role !== 'admin') {
    return <Navigate to="/home" replace />;
  }

  return children;
};

export default AdminRoute;
