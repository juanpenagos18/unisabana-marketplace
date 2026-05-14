import React from 'react';
import Header from "../Header";
import Footer from "../Footer";

/**
 * Layout global — envuelve todas las páginas con Header + Footer.
 * T5: header azul consistente, contenedor blanco, mobile-first.
 */
const Layout = ({ children, user, onLogout }) => {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: 'var(--color-bg)' }}
    >
      <Header user={user} onLogout={onLogout} />
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
