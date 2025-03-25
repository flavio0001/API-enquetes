import React, { useState } from 'react';
import Button from '../ui/Button';
import api from '../../services/api';

export default function CommentItem({ comment, currentUser, onDelete, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.texto);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');

  // Formatador de data
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('pt-BR', options);
  };

  // Funções para edição
  const handleEdit = () => {
    setIsEditing(true);
    setEditText(comment.texto);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setError('');
  };

  const handleSaveEdit = async () => {
    if (!editText.trim()) {
      setError('O comentário não pode estar vazio');
      return;
    }

    try {
      const response = await api.put(`/api/comentarios/${comment.id}`, {
        texto: editText.trim()
      });

      setIsEditing(false);
      setError('');
      
      if (onUpdate) {
        onUpdate(response.data);
      }
    } catch (err) {
      console.error('Erro ao atualizar comentário:', err);
      setError(err.response?.data?.message || 'Erro ao atualizar comentário');
    }
  };

  // Função para exclusão
  const handleDelete = async () => {
    if (!window.confirm('Tem certeza que deseja excluir este comentário?')) {
      return;
    }

    setIsDeleting(true);

    try {
      await api.delete(`/api/comentarios/${comment.id}`);
      
      if (onDelete) {
        onDelete(comment.id);
      }
    } catch (err) {
      console.error('Erro ao excluir comentário:', err);
      alert(err.response?.data?.message || 'Erro ao excluir comentário');
    } finally {
      setIsDeleting(false);
    }
  };

  // Verificar se o usuário atual é o autor do comentário
  const isOwner = currentUser && comment.user && currentUser.id === comment.user.id;

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 mb-4">
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-2 mb-3">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center">
          <div className="font-medium text-gray-800">
            {comment.user?.username || 'Usuário anônimo'}
          </div>
          <span className="mx-2 text-gray-400">•</span>
          <div className="text-sm text-gray-500">
            {formatDate(comment.criadoEm)}
          </div>
          {comment.editadoEm && comment.editadoEm !== comment.criadoEm && (
            <span className="ml-2 text-xs text-gray-400">
              (editado)
            </span>
          )}
        </div>

        {isOwner && (
          <div className="flex space-x-2">
            {!isEditing && (
              <>
                <button 
                  onClick={handleEdit}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Editar
                </button>
                <button 
                  onClick={handleDelete}
                  className="text-sm text-red-600 hover:text-red-800"
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Excluindo...' : 'Excluir'}
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {isEditing ? (
        <div>
          <textarea
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
            rows={3}
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
          />
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCancelEdit}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSaveEdit}
            >
              Salvar
            </Button>
          </div>
        </div>
      ) : (
        <div className="text-gray-700 whitespace-pre-line">
          {comment.texto}
        </div>
      )}
    </div>
  );
}