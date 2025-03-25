import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import EnqueteDetails from '../components/enquetes/EnqueteDetails';
import VotingSection from '../components/enquetes/VotingSection';
import CommentsList from '../components/comentarios/CommentsList';
import CommentForm from '../components/comentarios/CommentForm';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function EnqueteDetailPage() {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  
  const [enquete, setEnquete] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userVote, setUserVote] = useState(null);
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);

  useEffect(() => {
    const fetchEnquete = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/api/enquetes/${id}`);
        const enqueteData = response.data;
        setEnquete(enqueteData);

        if (isAuthenticated) {
          try {
            const voteResponse = await api.get(`/api/enquetes/${id}/meu-voto`);
            if (voteResponse.data) {
              const votedOption = enqueteData.opcoes.find(
                opcao => opcao.id === voteResponse.data.opcaoId
              );
              if (votedOption) {
                setUserVote(voteResponse.data);
              }
            }
          } catch (voteError) {
            // Erro 404 é esperado quando o usuário não votou
            if (voteError.response?.status !== 404) {
              console.error('Erro ao verificar voto:', voteError);
            }
          }
        }
      } catch (err) {
        console.error('Erro ao buscar enquete:', err);
        setError('Não foi possível carregar os detalhes da enquete.');
      } finally {
        setLoading(false);
      }
    };

    fetchEnquete();
  }, [id, isAuthenticated]);

  useEffect(() => {
    const fetchComments = async () => {
      if (!enquete) return;
      
      try {
        setLoadingComments(true);
        const response = await api.get(`/api/comentarios/enquete/${id}?page=1&limit=20`);
        
        const commentsData = Array.isArray(response.data) 
          ? response.data 
          : (response.data.items || []);
        
        setComments(commentsData);
      } catch (err) {
        console.error('Erro ao buscar comentários:', err);
      } finally {
        setLoadingComments(false);
      }
    };

    fetchComments();
  }, [id, enquete]);

  const handleAddComment = (newComment) => {
    setComments(prevComments => [newComment, ...(Array.isArray(prevComments) ? prevComments : [])]);
  };

  const isOwner = enquete && user && enquete.userId === user.id;

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <Spinner size="lg" />
        </div>
      </Layout>
    );
  }

  if (error || !enquete) {
    return (
      <Layout>
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <p className="text-red-700">{error || 'Enquete não encontrada'}</p>
          <Link to="/enquetes" className="mt-4 inline-block">
            <Button variant="outline">Voltar para enquetes</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <Link to="/enquetes" className="text-blue-600 hover:underline inline-block mb-6">
          &larr; Voltar para enquetes
        </Link>
        
        <EnqueteDetails enquete={enquete} isOwner={isOwner} />
        
        <div className="mt-8">
          <VotingSection 
            enquete={enquete} 
            userVote={userVote} 
            setUserVote={setUserVote}
            setEnquete={setEnquete}
          />
        </div>
        
        <div className="mt-12">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Comentários</h2>
          
          {isAuthenticated ? (
            <CommentForm enqueteId={id} onCommentAdded={handleAddComment} />
          ) : (
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
              <p className="text-gray-700">
                <Link to="/login" className="text-blue-600 hover:underline">Faça login</Link> para participar da discussão.
              </p>
            </div>
          )}
          
          {loadingComments ? (
            <div className="flex justify-center my-8">
              <Spinner />
            </div>
          ) : comments.length > 0 ? (
            <CommentsList comments={comments} currentUser={user} enqueteId={id} setComments={setComments} />
          ) : (
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-center">
              <p className="text-gray-700">
                Ainda não há comentários. Seja o primeiro a comentar!
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}