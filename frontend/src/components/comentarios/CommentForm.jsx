import React, { useState } from 'react';
import Button from '../ui/Button';
import Spinner from '../ui/Spinner';
import api from '../../services/api';

export default function CommentForm({ enqueteId, onCommentAdded, replyTo = null, onCancelReply = null }) {
  const [texto, setTexto] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!texto.trim()) {
      setError('O comentário não pode estar vazio');
      return;
    }
    
    setSubmitting(true);
    setError('');
    
    try {
      const response = await api.post('/api/comentarios', {
        enqueteId,
        texto: texto.trim(),
        ...(replyTo ? { parentId: replyTo } : {})
      });
      
      setTexto('');
      
      if (onCommentAdded) {
        onCommentAdded(response.data);
      }
      
      if (onCancelReply) {
        onCancelReply();
      }
      
    } catch (err) {
      console.error('Erro ao adicionar comentário:', err);
      setError(err.response?.data?.message || 'Não foi possível adicionar o comentário. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}
      
      <div className="mb-4">
        <label htmlFor="comment" className="sr-only">Seu comentário</label>
        <textarea
          id="comment"
          rows={replyTo ? 3 : 4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={replyTo ? "Escreva sua resposta..." : "Escreva seu comentário..."}
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          required
        />
      </div>
      
      <div className="flex justify-end space-x-3">
        {replyTo && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancelReply}
          >
            Cancelar
          </Button>
        )}
        
        <Button
          type="submit"
          disabled={submitting}
        >
          {submitting ? <Spinner size="sm" className="mr-2" /> : null}
          {submitting ? 'Enviando...' : (replyTo ? 'Responder' : 'Comentar')}
        </Button>
      </div>
    </form>
  );
}