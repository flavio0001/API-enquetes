import React from 'react';

export default function DashboardStats({ stats }) {
  const cards = [
    { title: 'Total de Usuários', value: stats.totalUsers, color: 'blue' },
    { title: 'Enquetes Ativas', value: stats.activePolls, color: 'green' },
    { title: 'Total de Votos', value: stats.totalVotes, color: 'indigo' },
    { title: 'Comentários', value: stats.totalComments, color: 'pink' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card) => (
        <div 
          key={card.title} 
          className={`bg-white overflow-hidden shadow rounded-lg border-b-4 border-${card.color}-500`}
        >
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-gray-500 text-sm">{card.title}</p>
                <p className={`text-2xl font-bold text-${card.color}-600`}>
                  {card.value.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}