import React from 'react';
import CommentItem from './CommentItem';

export default function CommentsList({ comments, currentUser, enqueteId, setComments }) {
  // Função para atualizar um comentário na lista
  const handleUpdateComment = (updatedComment) => {
    setComments(prevComments => 
      // Garantir que prevComments seja sempre um array
      (Array.isArray(prevComments) ? prevComments : []).map(comment => 
        comment.id === updatedComment.id ? updatedComment : comment
      )
    );
  };

  // Função para remover um comentário da lista
  const handleDeleteComment = (commentId) => {
    setComments(prevComments => 
      // Garantir que prevComments seja sempre um array
      (Array.isArray(prevComments) ? prevComments : []).filter(comment => comment.id !== commentId)
    );
  };

  // Verificação adicional para garantir que comments seja um array
  const safeComments = Array.isArray(comments) ? comments : [];

  if (!safeComments || safeComments.length === 0) {
    return (
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-center">
        <p className="text-gray-700">Ainda não há comentários. Seja o primeiro a comentar!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {safeComments.map(comment => (
        <CommentItem 
          key={comment.id} 
          comment={comment}
          currentUser={currentUser}
          onDelete={handleDeleteComment}
          onUpdate={handleUpdateComment}
        />
      ))}
    </div>
  );
}