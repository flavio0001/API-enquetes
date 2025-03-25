import React from 'react';

export default function DashboardCharts({ stats }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Atividade Recente</h2>
        <div className="space-y-4">
          <div className="flex justify-between">
            <p className="text-gray-600">Novos usuários hoje</p>
            <p className="font-semibold">{stats.newUsersToday}</p>
          </div>
          <div className="flex justify-between">
            <p className="text-gray-600">Enquetes criadas hoje</p>
            <p className="font-semibold">{stats.newPollsToday}</p>
          </div>
          <div className="flex justify-between">
            <p className="text-gray-600">Votos registrados hoje</p>
            <p className="font-semibold">{stats.votesToday}</p>
          </div>
          <div className="flex justify-between">
            <p className="text-gray-600">Comentários de hoje</p>
            <p className="font-semibold">{stats.commentsToday}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Distribuição de Usuários</h2>
        <div className="space-y-4">
          {stats.userTypes?.map((type) => (
            <div key={type.id} className="space-y-2">
              <div className="flex justify-between">
                <p className="text-gray-600">{type.nome}</p>
                <p className="font-semibold">{type.count} ({type.percentage}%)</p>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full" 
                  style={{ width: `${type.percentage}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}