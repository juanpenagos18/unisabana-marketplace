import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import AuthSelectPage    from './pages/AuthSelectPage';
import RegisterPage      from './pages/RegisterPage';
import LoginPage         from './pages/LoginPage';
import HomePage          from './pages/HomePage';
import ProfilePage       from './pages/ProfilePage';
import NewProductPage    from './pages/NewProductPage';    // T18
import ProductDetailPage from './pages/ProductDetailPage'; // T24
import MyProductsPage    from './pages/MyProductsPage';    // T26
import EditProductPage   from './pages/EditProductPage';   // T25

const PrivateRoute = ({ children }) => {
  const { token, loading } = useAuth();
  if (loading) return null;
  return token ? children : <Navigate to="/" replace />;
};

function App() {
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/"         element={<AuthSelectPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/login"    element={<LoginPage />} />

      {/* Rutas privadas — requieren sesión */}
      <Route path="/home"     element={<PrivateRoute><HomePage /></PrivateRoute>} />
      <Route path="/profile"  element={<PrivateRoute><ProfilePage /></PrivateRoute>} />

      {/* Módulo 3 — Productos */}
      <Route path="/products/new"       element={<PrivateRoute><NewProductPage /></PrivateRoute>} />
      <Route path="/products/:id"       element={<ProductDetailPage />} />
      <Route path="/products/:id/edit"  element={<PrivateRoute><EditProductPage /></PrivateRoute>} />
      <Route path="/my-products"        element={<PrivateRoute><MyProductsPage /></PrivateRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
