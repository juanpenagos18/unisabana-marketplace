import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/layout/Layout';

const HomePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <Layout user={user} onLogout={handleLogout}>
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <h2 className="text-3xl font-bold text-center"
          style={{ color: 'var(--color-primary)', fontFamily: 'Playfair Display, serif' }}>
          Bienvenido, {user?.name?.split(' ')[0]} 👋
        </h2>
        <p className="text-gray-500 text-center max-w-md">
          Aquí encontrarás productos publicados por la comunidad de La Sabana.
          Los módulos de productos y compras estarán disponibles próximamente.
        </p>
        <div className="flex gap-3 mt-4">
          <button onClick={() => navigate('/profile')} className="btn-secondary">
            Ver mi perfil
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default HomePage;
