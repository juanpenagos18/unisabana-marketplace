import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer
      className="w-full mt-auto py-6 px-4 text-center text-sm"
      style={{
        backgroundColor: 'var(--color-primary)',
        color: 'rgba(255,255,255,0.7)',
      }}
    >
      <p className="font-medium text-white mb-1">UniSabana MarketPlace</p>
      <p className="text-xs">
        © {new Date().getFullYear()} Universidad de La Sabana — Solo para uso institucional
      </p>
      <div className="flex justify-center gap-4 mt-3 text-xs">
        <Link to="/terms" className="hover:text-white transition-colors">Términos</Link>
        <Link to="/privacy" className="hover:text-white transition-colors">Privacidad</Link>
        <a href="mailto:soporte@unisabana.edu.co" className="hover:text-white transition-colors">
          Soporte
        </a>
      </div>
    </footer>
  );
};

export default Footer;