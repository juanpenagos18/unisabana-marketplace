import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Guard: solo usuarios con role='admin' pueden ver estas rutas
const AdminRoute = ({ children }) => {
  const { user, token, loading } = useAuth();
  if (loading) return null;
  if (!token)            return <Navigate to="/login" replace />;
  if (user?.role !== 'admin') return <Navigate to="/home" replace />;
  return children;
};

export default AdminRoute;
