import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import api from '../../services/api';
import Button from '../ui/Button';

// Importações de estilos do Swiper
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

export default function EnqueteCarousel() {
  const [enquetes, setEnquetes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEnquetes = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/enquetes/public?limit=10');
        setEnquetes(response.data);
      } catch (err) {
        setError('Não foi possível carregar as enquetes');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEnquetes();
  }, []);

  if (loading) {
    return (
      <div className="my-10">
        <h2 className="text-2xl font-bold text-center mb-6">Enquetes Recentes</h2>
        <div className="text-center py-10 bg-white rounded-lg shadow-md max-w-3xl mx-auto">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mb-6"></div>
            <div className="h-10 bg-gray-200 rounded w-32 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-10">
        <h2 className="text-2xl font-bold text-center mb-6">Enquetes Recentes</h2>
        <div className="text-center py-10 bg-white rounded-lg shadow-md max-w-3xl mx-auto">
          <p className="text-red-500">{error}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  if (enquetes.length === 0) {
    return (
      <div className="my-10">
        <h2 className="text-2xl font-bold text-center mb-6">Enquetes Recentes</h2>
        <div className="text-center py-10 bg-white rounded-lg shadow-md max-w-3xl mx-auto">
          <p>Nenhuma enquete disponível no momento.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="my-10">
      <h2 className="text-2xl font-bold text-center mb-6">Enquetes Recentes</h2>
      
      <div className="max-w-3xl mx-auto">
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={30}
          slidesPerView={1}
          navigation
          pagination={{ clickable: true }}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          className="rounded-lg shadow-md"
        >
          {enquetes.map((enquete) => (
            <SwiperSlide key={enquete.id}>
              <div className="bg-white p-8 rounded-lg text-center">
                <h3 className="text-xl font-semibold mb-3">{enquete.titulo}</h3>
                <p className="text-gray-600 mb-4">{enquete.descricao}</p>
                
                <div className="flex justify-between items-center mb-4 text-sm text-gray-500">
                  <span>
                    Criado por: {enquete.autor.username}
                  </span>
                  <span>
                    {enquete.opcoes.length} opções disponíveis
                  </span>
                </div>
                
                <Link to={`/enquetes/${enquete.id}`}>
                  <Button>Ver detalhes</Button>
                </Link>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
}