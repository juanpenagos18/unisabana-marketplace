import React from 'react';
import Header from './Header';
import Footer from '../components/Footer';

const Layout = ({ children, user, onLogout, onSearch }) => {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--color-bg)' }}>
      <Header user={user} onLogout={onLogout} onSearch={onSearch} />
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
