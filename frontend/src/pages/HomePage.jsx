// src/pages/HomePage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Button from '../components/ui/Button';
import EnqueteCarousel from '../components/enquetes/EnqueteCarousel';
import { useAuth } from '../context/AuthContext';

export default function HomePage() {
 const { isAuthenticated } = useAuth();
 
 return (
   <Layout>
     <div className="max-w-4xl mx-auto">
       <div className="text-center py-12">
         <h1 className="text-4xl font-bold text-gray-900 mb-4">
           Bem-vindo ao Sistema de Enquetes
         </h1>
         
         <p className="text-xl text-gray-600 mb-8">
           Crie enquetes, vote e compartilhe suas opiniões com a comunidade.
         </p>
         
         <div className="flex justify-center space-x-4">
           <Link to="/enquetes">
             <Button size="lg">Ver enquetes</Button>
           </Link>
           
           {isAuthenticated ? (
             <Link to="/enquetes/criar">
               <Button variant="outline" size="lg">
                 Criar enquete
               </Button>
             </Link>
           ) : (
             <Link to="/login">
               <Button variant="outline" size="lg">
                 Entrar
               </Button>
             </Link>
           )}
         </div>
       </div>
       
       <EnqueteCarousel />
       
       <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
         <div className="bg-white p-6 rounded-lg shadow-md">
           <h3 className="text-xl font-semibold text-gray-800 mb-3">
             Crie enquetes
           </h3>
           <p className="text-gray-600">
             Desenvolva pesquisas e enquetes personalizadas sobre qualquer tema de seu interesse.
           </p>
         </div>
         
         <div className="bg-white p-6 rounded-lg shadow-md">
           <h3 className="text-xl font-semibold text-gray-800 mb-3">
             Vote em enquetes
           </h3>
           <p className="text-gray-600">
             Participe das enquetes criadas pela comunidade e compartilhe sua opinião.
           </p>
         </div>
         
         <div className="bg-white p-6 rounded-lg shadow-md">
           <h3 className="text-xl font-semibold text-gray-800 mb-3">
             Veja os resultados
           </h3>
           <p className="text-gray-600">
             Acompanhe os resultados das enquetes em tempo real através de gráficos e estatísticas.
           </p>
         </div>
       </div>
     </div>
   </Layout>
 );
}