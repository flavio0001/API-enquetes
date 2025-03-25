import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../ui/Button';

export default function EnqueteDetails({ enquete, isOwner }) {
  const navigate = useNavigate();
  
  // Formatador de data
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('pt-BR', options);
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
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-start">
        <h1 className="text-2xl font-bold text-gray-800">{enquete.titulo}</h1>
        
        {enquete.dataFim && (
          <span 
            className={`text-sm font-medium px-3 py-1 rounded-full ${
              new Date(enquete.dataFim) < new Date() 
                ? 'bg-red-100 text-red-800' 
                : 'bg-blue-100 text-blue-800'
            }`}
          >
            {new Date(enquete.dataFim) < new Date() 
              ? 'Encerrada' 
              : `Encerra em ${Math.ceil((new Date(enquete.dataFim) - new Date()) / (1000 * 60 * 60 * 24))} dias`
            }
          </span>
        )}
      </div>
      
      <div className="mt-2 flex items-center text-sm text-gray-600">
        <span>Criado por: {getUserName()}</span>
        <span className="mx-2">•</span>
        <span>{formatDate(enquete.criadoEm)}</span>
      </div>
      
      {enquete.descricao && (
        <div className="mt-4 text-gray-700">
          <p>{enquete.descricao}</p>
        </div>
      )}
      
      <div className="mt-6 flex items-center text-sm text-gray-600">
        <span>{enquete.totalVotos || 0} {(enquete.totalVotos === 1) ? 'voto' : 'votos'} no total</span>
      </div>
      
      {isOwner && (
        <div className="mt-6 flex justify-end space-x-3">
          <Button 
            variant="outline" 
            onClick={() => navigate(`/enquetes/${enquete.id}/editar`)}
          >
            Editar Enquete
          </Button>
          
          <Button 
            variant="danger"
            onClick={() => {
              if (window.confirm('Tem certeza que deseja excluir esta enquete?')) {
                // Lógica para excluir a enquete
              }
            }}
          >
            Excluir
          </Button>
        </div>
      )}
    </div>
  );
}