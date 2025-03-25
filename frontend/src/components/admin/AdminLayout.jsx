import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function AdminLayout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  
  const navigation = [
    { name: 'Dashboard', href: '/admin', current: location.pathname === '/admin' },
    { name: 'Usuários', href: '/admin/users', current: location.pathname === '/admin/users' },
    { name: 'Enquetes', href: '/admin/enquetes', current: location.pathname === '/admin/enquetes' },
    { name: 'Comentários', href: '/admin/comentarios', current: location.pathname === '/admin/comentarios' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Barra superior */}
      <nav className="bg-blue-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="text-white text-xl font-bold">
                Sistema de Enquetes
              </Link>
            </div>
            <div className="flex items-center">
              <span className="text-white mr-4">
                Olá, {user?.username || 'Administrador'}
              </span>
              <button
                onClick={logout}
                className="px-3 py-1 bg-red-700 text-white rounded-md hover:bg-red-800"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Barra lateral */}
        <div className="w-64 bg-white shadow-md min-h-screen">
          <div className="p-6">
            <p className="text-lg font-semibold text-gray-600">Área Administrativa</p>
          </div>
          <nav className="mt-2">
            <ul className="space-y-1">
              {navigation.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className={`block px-6 py-3 ${
                      item.current
                        ? 'bg-blue-100 text-blue-800 border-l-4 border-blue-600'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
              <li className="mt-6">
                <Link
                  to="/"
                  className="block px-6 py-3 text-gray-600 hover:bg-gray-50"
                >
                  Voltar ao site
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        {/* Conteúdo principal */}
        <div className="flex-1 px-6 py-4">
          {children}
        </div>
      </div>
    </div>
  );
}