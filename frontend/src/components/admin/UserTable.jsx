import React, { useState } from 'react';
import Button from '../ui/Button';

export default function UserTable({ users, onUpdateRole, onToggleStatus, currentUser }) {
  const [selectedUser, setSelectedUser] = useState(null);
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Função para retornar o nome do tipo/papel do usuário
  const getRoleName = (tipoId) => {
    const roles = {
      1: 'Administrador',
      2: 'Cliente',
      3: 'Moderador'
    };
    return roles[tipoId] || 'Desconhecido';
  };
  
  // Função para retornar a cor do badge de status
  const getStatusColor = (ativo) => {
    return ativo 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Usuário
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Função
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Criado em
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {user.username}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">
                    {user.email}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    {getRoleName(user.tipoId)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(user.ativo)}`}>
                    {user.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(user.criadoEm)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedUser(user)}
                    >
                      Editar
                    </Button>
                    
                    {/* Não permitir desativar o próprio usuário */}
                    {currentUser.id !== user.id && (
                      <Button
                        size="sm"
                        variant={user.ativo ? 'danger' : 'success'}
                        onClick={() => onToggleStatus(user.id, user.ativo)}
                      >
                        {user.ativo ? 'Desativar' : 'Ativar'}
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Modal para editar função do usuário */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Editar função do usuário: {selectedUser.username}
            </h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Função do usuário
              </label>
              <select
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                value={selectedUser.tipoId}
                onChange={(e) => setSelectedUser({
                  ...selectedUser,
                  tipoId: parseInt(e.target.value)
                })}
              >
                <option value={1}>Administrador</option>
                <option value={2}>Cliente</option>
                <option value={3}>Moderador</option>
              </select>
            </div>
            
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setSelectedUser(null)}
              >
                Cancelar
              </Button>
              <Button
                onClick={() => {
                  onUpdateRole(selectedUser.id, selectedUser.tipoId);
                  setSelectedUser(null);
                }}
              >
                Salvar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}