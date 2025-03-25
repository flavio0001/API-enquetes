import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../ui/Button';

export default function EnqueteCard({ enquete }) {
  // Formatador de data
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('pt-BR', options);
  };
  
  // Calcula o tempo restante da enquete (usando o campo dataFim)
  const getRemainingTime = () => {
    if (!enquete.dataFim) return null;
    
    const now = new Date();
    const endDate = new Date(enquete.dataFim);
    
    if (endDate <= now) {
      return 'Encerrada';
    }
    
    const diffTime = Math.abs(endDate - now);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays === 1 
      ? 'Encerra amanhã' 
      : `Encerra em ${diffDays} dias`;
  };
  
  // Extrair nome do usuário de diferentes possibilidades
  const getUserName = () => {
    // Verifica autor
    if (enquete.autor?.username) return enquete.autor.username;
    
    // Verifica user
    if (enquete.user?.username) return enquete.user.username;
    
    // Verifica username direto
    if (enquete.username) return enquete.username;
    
    return 'Usuário anônimo';
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="p-5">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold text-gray-800">
            {enquete.titulo}
          </h3>
          
          {enquete.dataFim && (
            <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
              {getRemainingTime()}
            </span>
          )}
        </div>
        
        <p className="text-gray-600 text-sm mt-2">
          Criado por: {getUserName()}
        </p>
        
        <p className="text-gray-600 text-sm">
          {formatDate(enquete.criadoEm)}
        </p>
        
        {enquete.descricao && (
          <p className="mt-3 text-gray-700">
            {enquete.descricao.length > 100 
              ? `${enquete.descricao.substring(0, 100)}...` 
              : enquete.descricao
            }
          </p>
        )}
        
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
          <span className="text-sm text-gray-600">
            {enquete.totalVotos || 0} {(enquete.totalVotos === 1) ? 'voto' : 'votos'}
          </span>
          
          <div className="flex space-x-2">
            <Link to={`/enquetes/${enquete.id}`}>
              <Button variant="outline" size="sm">
                Ver detalhes
              </Button>
            </Link>
            
            <Link to={`/enquetes/${enquete.id}`}>
              <Button size="sm">
                Votar
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}