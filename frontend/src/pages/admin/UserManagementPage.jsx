import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import UserTable from '../../components/admin/UserTable';
import Spinner from '../../components/ui/Spinner';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function UserManagementPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/api/users?page=${page}&limit=10`);
        
        if (response.data.items) {
          setUsers(response.data.items);
          setTotalPages(response.data.totalPages || 1);
        } else {
          setUsers(response.data);
        }
      } catch (err) {
        console.error('Erro ao buscar usuários:', err);
        setError('Não foi possível carregar a lista de usuários.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [page]);

  // Verificar se o usuário é administrador
  if (!user || !user.isAdmin) {
    return <Navigate to="/login" replace />;
  }

  const handleUpdateUserRole = async (userId, roleId) => {
    try {
      await api.put(`/api/users/${userId}/role`, { tipoId: roleId });
      
      // Atualizar a lista de usuários após a mudança
      setUsers(prevUsers => prevUsers.map(u => {
        if (u.id === userId) {
          return { ...u, tipoId: roleId };
        }
        return u;
      }));
      
    } catch (err) {
      console.error('Erro ao atualizar função do usuário:', err);
      alert('Não foi possível atualizar a função do usuário.');
    }
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      await api.put(`/api/users/${userId}/status`, { ativo: !currentStatus });
      
      // Atualizar a lista de usuários após a mudança
      setUsers(prevUsers => prevUsers.map(u => {
        if (u.id === userId) {
          return { ...u, ativo: !currentStatus };
        }
        return u;
      }));
      
    } catch (err) {
      console.error('Erro ao atualizar status do usuário:', err);
      alert('Não foi possível atualizar o status do usuário.');
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <Spinner size="lg" />
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <p className="text-red-700">{error}</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="py-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Gerenciamento de Usuários</h1>
        
        <UserTable 
          users={users} 
          onUpdateRole={handleUpdateUserRole} 
          onToggleStatus={handleToggleUserStatus}
          currentUser={user}
        />
        
        {totalPages > 1 && (
          <div className="mt-6 flex justify-between items-center">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className={`px-4 py-2 rounded ${
                page === 1 
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              Anterior
            </button>
            
            <span className="text-gray-600">
              Página {page} de {totalPages}
            </span>
            
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className={`px-4 py-2 rounded ${
                page === totalPages 
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              Próxima
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}