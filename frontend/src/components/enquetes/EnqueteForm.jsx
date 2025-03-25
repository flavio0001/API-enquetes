import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../ui/Button';
import FormField from '../ui/FormField';
import Spinner from '../ui/Spinner';
import api from '../../services/api';

export default function EnqueteForm({ editMode = false, enqueteData = null }) {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const [titulo, setTitulo] = useState(editMode && enqueteData ? enqueteData.titulo : '');
  const [descricao, setDescricao] = useState(editMode && enqueteData ? enqueteData.descricao : '');
  const [dataEncerramento, setDataEncerramento] = useState(
    editMode && enqueteData && enqueteData.dataFim 
      ? new Date(enqueteData.dataFim).toISOString().split('T')[0] 
      : ''
  );
  const [mostrarResultados, setMostrarResultados] = useState(
    editMode && enqueteData ? enqueteData.mostrarResultados : false
  );
  
  // Opções de resposta
  const [opcoes, setOpcoes] = useState(
    editMode && enqueteData && enqueteData.opcoes 
      ? enqueteData.opcoes 
      : [{ id: 'temp-1', texto: '' }, { id: 'temp-2', texto: '' }]
  );

  // Validar o formulário
  const validateForm = () => {
    if (!titulo.trim()) {
      setError('O título da enquete é obrigatório');
      return false;
    }

    if (titulo.trim().length < 5) {
      setError('O título deve ter pelo menos 5 caracteres');
      return false;
    }

    if (opcoes.length < 2) {
      setError('A enquete precisa ter pelo menos 2 opções');
      return false;
    }

    const validOptions = opcoes.filter(op => op.texto.trim());
    if (validOptions.length < 2) {
      setError('Pelo menos 2 opções precisam ter texto');
      return false;
    }

    // Verificar opções duplicadas
    const textos = validOptions.map(op => op.texto.trim());
    const textosSemDuplicados = [...new Set(textos)];
    if (textosSemDuplicados.length !== textos.length) {
      setError('Não são permitidas opções duplicadas');
      return false;
    }

    return true;
  };

  // Adicionar nova opção
  const addOption = () => {
    setOpcoes([...opcoes, { id: `temp-${Date.now()}`, texto: '' }]);
  };

  // Remover opção
  const removeOption = (index) => {
    if (opcoes.length <= 2) {
      setError('A enquete precisa ter pelo menos 2 opções');
      return;
    }
    
    const newOptions = [...opcoes];
    newOptions.splice(index, 1);
    setOpcoes(newOptions);
  };

  // Atualizar texto da opção
  const updateOptionText = (index, texto) => {
    const newOptions = [...opcoes];
    newOptions[index] = { ...newOptions[index], texto };
    setOpcoes(newOptions);
  };

  // Enviar formulário
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) return;
    
    setSubmitting(true);
    
    try {
      // Filtrar opções vazias
      const validOptions = opcoes
        .filter(op => op.texto.trim())
        .map(op => ({
          ...(editMode && !op.id.startsWith('temp-') ? { id: op.id } : {}),
          texto: op.texto.trim()
        }));
      
      // Preparar dados para envio - MAPEADOS PARA O VALIDADOR
      const formData = {
        titulo: titulo.trim(),
        descricao: descricao.trim() || "Sem descrição", // Torna descrição obrigatória
        opcoes: validOptions,
        mostrarResultados: mostrarResultados,
        // Renomear dataEncerramento para dataFim
        dataFim: dataEncerramento 
          ? new Date(dataEncerramento).toISOString() 
          : new Date(Date.now() + 30*24*60*60*1000).toISOString() // 30 dias no futuro como padrão
      };
      
      // Log para debug
      console.log("Dados enviados para a API:", JSON.stringify(formData));
      
      if (editMode) {
        await api.put(`/api/enquetes/${enqueteData.id}`, formData);
        navigate(`/enquetes/${enqueteData.id}`);
      } else {
        const response = await api.post('/api/enquetes', formData);
        navigate(`/enquetes/${response.data.id}`);
      }
    } catch (err) {
      console.error('Erro ao salvar enquete:', err);
      if (err.response && err.response.data) {
        console.error('Detalhes do erro:', err.response.data);
        
        // Se houver erros específicos, mostre-os
        if (err.response.data.errors && err.response.data.errors.length > 0) {
          setError(`${err.response.data.message}: ${err.response.data.errors.join(', ')}`);
        } else {
          setError(err.response.data.message || 'Erro ao salvar enquete');
        }
      } else {
        setError('Erro ao salvar enquete. Tente novamente.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}
      
      <FormField
        label="Título da enquete"
        id="titulo"
        value={titulo}
        onChange={(e) => setTitulo(e.target.value)}
        placeholder="Digite o título da sua enquete (mínimo 5 caracteres)"
        required
      />
      
      <div className="mb-4">
        <label 
          htmlFor="descricao" 
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Descrição <span className="text-red-500">*</span>
        </label>
        <textarea
          id="descricao"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          placeholder="Descreva sua enquete"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
          required
        />
      </div>
      
      <div className="mb-4">
        <label 
          htmlFor="dataEncerramento" 
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Data de encerramento <span className="text-red-500">*</span>
        </label>
        <input
          id="dataEncerramento"
          type="date"
          value={dataEncerramento}
          onChange={(e) => setDataEncerramento(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="mt-1 text-sm text-gray-500">
          Se não for definida, será configurada para 30 dias a partir de hoje.
        </p>
      </div>
      
      <div className="mb-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="mostrarResultados"
            checked={mostrarResultados}
            onChange={(e) => setMostrarResultados(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label 
            htmlFor="mostrarResultados" 
            className="ml-2 block text-sm font-medium text-gray-700"
          >
            Mostrar resultados antes do usuário votar
          </label>
        </div>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Opções da enquete <span className="text-red-500">*</span>
        </label>
        
        <div className="space-y-3">
          {opcoes.map((option, index) => (
            <div key={option.id || index} className="flex items-center">
              <input
                type="text"
                value={option.texto}
                onChange={(e) => updateOptionText(index, e.target.value)}
                placeholder={`Opção ${index + 1}`}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <button
                type="button"
                onClick={() => removeOption(index)}
                className="ml-2 p-2 text-red-600 hover:text-red-800"
                aria-label="Remover opção"
              >
                &times;
              </button>
            </div>
          ))}
        </div>
        
        <button
          type="button"
          onClick={addOption}
          className="mt-3 text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          + Adicionar outra opção
        </button>
        
        <p className="mt-1 text-sm text-gray-500">
          Adicione pelo menos duas opções diferentes.
        </p>
      </div>
      
      <div className="flex justify-end space-x-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate(-1)}
        >
          Cancelar
        </Button>
        
        <Button
          type="submit"
          disabled={submitting}
        >
          {submitting ? <Spinner size="sm" className="mr-2" /> : null}
          {submitting 
            ? (editMode ? 'Salvando...' : 'Criando...') 
            : (editMode ? 'Salvar alterações' : 'Criar enquete')
          }
        </Button>
      </div>
    </form>
  );
}