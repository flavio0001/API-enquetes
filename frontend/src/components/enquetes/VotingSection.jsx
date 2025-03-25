// Arquivo: src/components/enquetes/VotingSection.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../ui/Button';
import Spinner from '../ui/Spinner';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function VotingSection({ enquete, userVote, setUserVote, setEnquete }) {
  const [selectedOption, setSelectedOption] = useState(userVote ? userVote.opcaoId : null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const sortedOptions = [...(enquete.opcoes || [])].sort((a, b) => {
    if (userVote || enquete.mostrarResultados) {
      return (b._count?.votosRegistro || 0) - (a._count?.votosRegistro || 0);
    }
    return 0;
  });

  const calculatePercentage = (option) => {
    const totalVotos = enquete.opcoes.reduce((sum, op) => sum + (op._count?.votosRegistro || 0), 0);
    if (!totalVotos) return 0;
    return Math.round(((option._count?.votosRegistro || 0) * 100) / totalVotos);
  };

  const isEnqueteClosed = () => {
    return enquete.dataFim && new Date(enquete.dataFim) < new Date();
  };

  const handleVote = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { message: 'Faça login para votar na enquete.' } });
      return;
    }

    if (!selectedOption) {
      setError('Selecione uma opção para votar.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      
      // URL corrigida para corresponder exatamente à rota do back-end
      const response = await api.post(`/api/enquetes/opcoes/${selectedOption}/votar`);
      console.log('Resposta do voto:', response.data);

      setUserVote(response.data);
      
      setEnquete(prev => {
        const updatedOptions = prev.opcoes.map(option => {
          if (response.data.action === 'created' && option.id === selectedOption) {
            return { 
              ...option, 
              _count: { 
                votosRegistro: (option._count?.votosRegistro || 0) + 1 
              }
            };
          } else if (response.data.action === 'removed' && option.id === response.data.opcaoId) {
            return { 
              ...option, 
              _count: { 
                votosRegistro: Math.max(0, (option._count?.votosRegistro || 0) - 1) 
              }
            };
          }
          return option;
        });
        
        return {
          ...prev,
          opcoes: updatedOptions
        };
      });
      
      setSubmitting(false);
    } catch (err) {
      console.error('Erro ao votar:', err);
      let errorMessage = 'Não foi possível registrar seu voto. Tente novamente.';
      
      if (err.response) {
        errorMessage = `${err.response.data?.message || `Erro ${err.response.status}`}`;
        console.log('Detalhes do erro:', err.response.data);
      }
      
      setError(errorMessage);
      setSubmitting(false);
    }
  };

  const renderProgressBar = (option) => {
    const percentage = calculatePercentage(option);
    
    return (
      <div className="mt-1 relative pt-1">
        <div className="flex mb-2 items-center justify-between">
          <div>
            <span className="text-xs font-semibold inline-block text-blue-600">
              {percentage}%
            </span>
          </div>
          <div className="text-right">
            <span className="text-xs font-semibold inline-block text-blue-600">
              {option._count?.votosRegistro || 0} {(option._count?.votosRegistro || 0) === 1 ? 'voto' : 'votos'}
            </span>
          </div>
        </div>
        <div className="overflow-hidden h-2 text-xs flex rounded bg-blue-200">
          <div 
            style={{ width: `${percentage}%` }}
            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
          ></div>
        </div>
      </div>
    );
  };

  const renderOptions = () => {
    if (userVote || isEnqueteClosed() || enquete.mostrarResultados) {
      return (
        <div className="space-y-4">
          {sortedOptions.map(option => (
            <div 
              key={option.id} 
              className={`p-4 rounded-lg border ${
                userVote && userVote.opcaoId === option.id 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200'
              }`}
            >
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="font-medium">{option.texto}</p>
                  {renderProgressBar(option)}
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {sortedOptions.map(option => (
          <div 
            key={option.id}
            className={`p-4 rounded-lg border cursor-pointer ${
              selectedOption === option.id 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setSelectedOption(option.id)}
          >
            <div className="flex items-center">
              <input
                type="radio"
                id={`option-${option.id}`}
                name="enquete-option"
                value={option.id}
                checked={selectedOption === option.id}
                onChange={() => setSelectedOption(option.id)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <label 
                htmlFor={`option-${option.id}`}
                className="ml-3 block cursor-pointer"
              >
                {option.texto}
              </label>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">
        {userVote || isEnqueteClosed() || enquete.mostrarResultados 
          ? 'Resultados' 
          : 'Vote na enquete'
        }
      </h2>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {renderOptions()}

      {!userVote && !isEnqueteClosed() && !enquete.mostrarResultados && (
        <div className="mt-6">
          <Button
            onClick={handleVote}
            disabled={submitting || !selectedOption}
            className="w-full"
          >
            {submitting ? <Spinner size="sm" className="mr-2" /> : null}
            {submitting ? 'Enviando...' : 'Votar'}
          </Button>
        </div>
      )}

      {userVote && (
        <div className="mt-4 text-center text-sm text-gray-600">
          Você já votou nesta enquete. Obrigado por participar!
        </div>
      )}

      {isEnqueteClosed() && (
        <div className="mt-4 text-center text-sm text-gray-600">
          Esta enquete está encerrada. Não é mais possível votar.
        </div>
      )}
    </div>
  );
}