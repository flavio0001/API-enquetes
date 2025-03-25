import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import DashboardStats from '../../components/admin/DashboardStats';
import DashboardCharts from '../../components/admin/DashboardCharts';
import Spinner from '../../components/ui/Spinner';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/admin/stats');
        setStats(response.data);
      } catch (err) {
        console.error('Erro ao buscar estatísticas:', err);
        setError('Não foi possível carregar as estatísticas do sistema.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Verificar se o usuário é administrador
  if (!user || !user.isAdmin) {
    return <Navigate to="/login" replace />;
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <Spinner size="lg" />
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <p className="text-red-700">{error}</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="py-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard Administrativo</h1>
        
        {stats && <DashboardStats stats={stats} />}
        
        <div className="mt-8">
          {stats && <DashboardCharts stats={stats} />}
        </div>
      </div>
    </AdminLayout>
  );
}