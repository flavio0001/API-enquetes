import React from 'react';
import Layout from '../components/layout/Layout';
import EnqueteForm from '../components/enquetes/EnqueteForm';

export default function CreateEnquetePage() {
  return (
    <Layout>
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Criar Nova Enquete
        </h1>
        
        <EnqueteForm />
      </div>
    </Layout>
  );
}