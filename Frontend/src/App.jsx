import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import AuthSelectPage    from './pages/AuthSelectPage';
import RegisterPage      from './pages/RegisterPage';
import LoginPage         from './pages/LoginPage';
import HomePage          from './pages/HomePage';
import ProfilePage       from './pages/ProfilePage';
import NewProductPage    from './pages/NewProductPage';
import ProductDetailPage from './pages/ProductDetailPage';
import MyProductsPage    from './pages/MyProductsPage';
import EditProductPage   from './pages/EditProductPage';
import CartPage          from './pages/CartPage';      // T35
import OrdersPage        from './pages/OrdersPage';    // T39

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

      <Route path="/home"    element={<PrivateRoute><HomePage /></PrivateRoute>} />
      <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />

      <Route path="/products/new"      element={<PrivateRoute><NewProductPage /></PrivateRoute>} />
      <Route path="/products/:id"      element={<ProductDetailPage />} />
      <Route path="/products/:id/edit" element={<PrivateRoute><EditProductPage /></PrivateRoute>} />
      <Route path="/my-products"       element={<PrivateRoute><MyProductsPage /></PrivateRoute>} />

      <Route path="/cart"   element={<PrivateRoute><CartPage /></PrivateRoute>} />
      <Route path="/orders" element={<PrivateRoute><OrdersPage /></PrivateRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
