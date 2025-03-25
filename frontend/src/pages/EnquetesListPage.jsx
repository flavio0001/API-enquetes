import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import EnqueteCard from '../components/enquetes/EnqueteCard';
import Spinner from '../components/ui/Spinner';
import api from '../services/api';

export default function EnquetesListPage() {
  const [enquetes, setEnquetes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchEnquetes = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/api/enquetes/public?page=${page}&limit=10`);
        
        setEnquetes(response.data.items || response.data);
        
        // Se a API retornar informações de paginação
        if (response.data.totalPages) {
          setTotalPages(response.data.totalPages);
        }
      } catch (err) {
        console.error('Erro ao buscar enquetes:', err);
        setError('Não foi possível carregar as enquetes. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };
    fetchEnquetes();
  }, [page]);

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Enquetes Disponíveis
        </h1>
        {loading ? (
          <div className="flex justify-center my-12">
            <Spinner size="lg" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border-l-4 border-red-500 p-4">
            <p className="text-red-700">{error}</p>
          </div>
        ) : enquetes.length === 0 ? (
          <div className="bg-gray-50 p-6 text-center rounded-lg border border-gray-200">
            <p className="text-gray-700">
              Não há enquetes disponíveis no momento.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enquetes.map((enquete) => (
                <EnqueteCard key={enquete.id} enquete={enquete} />
              ))}
            </div>
            {totalPages > 1 && (
              <div className="flex justify-between items-center mt-8">
                <button
                  onClick={handlePreviousPage}
                  disabled={page === 1}
                  className={`px-4 py-2 rounded ${
                    page === 1
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  Anterior
                </button>
                
                <span className="text-gray-700">
                  Página {page} de {totalPages}
                </span>
                
                <button
                  onClick={handleNextPage}
                  disabled={page === totalPages}
                  className={`px-4 py-2 rounded ${
                    page === totalPages
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  Próxima
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}