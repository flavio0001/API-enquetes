import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import EnqueteCard from '../components/enquetes/EnqueteCard';
import FormField from '../components/ui/FormField';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function ProfilePage() {
  const { user, updateUserInfo } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userEnquetes, setUserEnquetes] = useState([]);
  const [userVotes, setUserVotes] = useState([]);
  
  const [editingProfile, setEditingProfile] = useState(false);
  const [username, setUsername] = useState(user?.username || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updateError, setUpdateError] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        // Buscar enquetes criadas pelo usuário
        const enquetesResponse = await api.get('/api/enquetes');
        setUserEnquetes(enquetesResponse.data);
        
        // Buscar votos do usuário - desativado temporariamente
        // const votesResponse = await api.get('/api/votos/meus');
        // setUserVotes(votesResponse.data);
        setUserVotes([]);
        
      } catch (err) {
        console.error('Erro ao buscar dados do usuário:', err);
        setError('Não foi possível carregar seus dados. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdateError('');
    setUpdateSuccess('');
    
    // Validar campos quando está alterando a senha
    if (newPassword) {
      if (!currentPassword) {
        setUpdateError('A senha atual é obrigatória para definir uma nova senha');
        return;
      }
      
      if (newPassword.length < 6) {
        setUpdateError('A nova senha deve ter pelo menos 6 caracteres');
        return;
      }
      
      if (newPassword !== confirmPassword) {
        setUpdateError('As senhas não conferem');
        return;
      }
    }
    
    try {
      setUpdating(true);
      
      const updateData = {
        username: username.trim()
      };
      
      if (newPassword) {
        updateData.currentPassword = currentPassword;
        updateData.newPassword = newPassword;
      }
      
      // Atualizar perfil do usuário
      const response = await api.put('/api/users/profile', updateData);
      
      // Atualizar informações do usuário no contexto de autenticação
      if (typeof updateUserInfo === 'function' && response.data && response.data.user) {
        updateUserInfo(response.data.user);
      }
      
      setUpdateSuccess('Perfil atualizado com sucesso!');
      setEditingProfile(false);
      
      // Limpar campos de senha
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
    } catch (err) {
      console.error('Erro ao atualizar perfil:', err);
      setUpdateError(err.response?.data?.message || 'Erro ao atualizar perfil. Tente novamente.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <Spinner size="lg" />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <p className="text-red-700">{error}</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Meu Perfil</h1>
            
            {updateSuccess && (
              <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
                <p className="text-green-700">{updateSuccess}</p>
              </div>
            )}
            
            {editingProfile ? (
              <form onSubmit={handleUpdateProfile}>
                {updateError && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                    <p className="text-red-700">{updateError}</p>
                  </div>
                )}
                
                <FormField
                  label="Nome de usuário"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
                
                <div className="mt-6">
                  <h3 className="text-lg font-medium text-gray-800 mb-3">Alterar senha (opcional)</h3>
                  
                  <FormField
                    label="Senha atual"
                    type="password"
                    id="currentPassword"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                  
                  <FormField
                    label="Nova senha"
                    type="password"
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  
                  <FormField
                    label="Confirmar nova senha"
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEditingProfile(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={updating}
                  >
                    {updating ? <Spinner size="sm" className="mr-2" /> : null}
                    {updating ? 'Salvando...' : 'Salvar alterações'}
                  </Button>
                </div>
              </form>
            ) : (
              <div>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-gray-700"><strong>Nome:</strong> {user?.username}</p>
                    <p className="text-gray-700"><strong>Email:</strong> {user?.email}</p>
                    <p className="text-gray-700"><strong>Tipo de conta:</strong> {user?.role || 'Usuário'}</p>
                  </div>
                  
                  <Button
                    onClick={() => setEditingProfile(true)}
                    variant="outline"
                  >
                    Editar perfil
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Minhas enquetes</h2>
          
          {userEnquetes.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <p className="text-gray-700">Você ainda não criou nenhuma enquete.</p>
              <Link to="/enquetes/criar" className="mt-4 inline-block">
                <Button>Criar minha primeira enquete</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {userEnquetes.map(enquete => (
                <EnqueteCard key={enquete.id} enquete={enquete} />
              ))}
            </div>
          )}
        </div>
        
        {userVotes.length > 0 && (
          <div className="mt-8 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Meus votos recentes</h2>
            
            <div className="bg-white rounded-lg shadow-md divide-y">
              {userVotes.map(vote => (
                <div key={vote.id} className="p-4">
                  <Link 
                    to={`/enquetes/${vote.enqueteId}`}
                    className="text-blue-600 hover:underline font-medium"
                  >
                    {vote.enquete?.titulo || 'Enquete'}
                  </Link>
                  <p className="text-gray-700 mt-1">
                    Você votou em: <span className="font-medium">{vote.opcao?.texto || 'Opção não disponível'}</span>
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(vote.criadoEm).toLocaleDateString('pt-BR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}