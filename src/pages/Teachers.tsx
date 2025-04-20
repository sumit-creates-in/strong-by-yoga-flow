
import React from 'react';
import Layout from '@/components/Layout';
import { useNavigate } from 'react-router-dom';
import TeacherShowcase from '@/components/TeacherShowcase';

const Teachers = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Our Teachers</h1>
        <TeacherShowcase />
      </div>
    </Layout>
  );
};

export default Teachers;
