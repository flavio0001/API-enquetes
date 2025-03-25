import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0">
            <Link to="/" className="text-xl font-bold text-blue-600">
              Sistema de Enquetes
            </Link>
          </div>

          <nav className="flex space-x-4">
            <Link to="/" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md">
              Início
            </Link>
            <Link to="/enquetes" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md">
              Enquetes
            </Link>
            
            {isAuthenticated ? (
              <>
                {/* Link para área administrativa (apenas para administradores) */}
                {user.isAdmin && (
                  <Link to="/admin" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md">
                    Administração
                  </Link>
                )}
                
                <Link to="/profile" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md">
                  Perfil ({user?.username})
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                >
                  Sair
                </Button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md">
                  Entrar
                </Link>
                <Link to="/register" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md">
                  Registrar
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}