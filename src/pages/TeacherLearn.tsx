
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useTeachers } from '@/contexts/TeacherContext';
import Layout from '@/components/Layout';

const TeacherLearn = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { teachers } = useTeachers();
  
  const teacher = id ? teachers.find(t => t.id === id) : undefined;
  
  if (!teacher && id) {
    return (
      <Layout>
        <div className="container mx-auto py-8">
          <Button 
            variant="ghost" 
            className="mb-6" 
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-4">Teacher not found</h1>
            <p className="text-gray-600 mb-8">The teacher you're looking for doesn't exist or has been removed.</p>
            <Button onClick={() => navigate('/teachers')}>
              View All Teachers
            </Button>
          </div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="container mx-auto py-8">
        <Button 
          variant="ghost" 
          className="mb-6" 
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="relative">
            <div className="bg-gradient-to-r from-yoga-blue to-yoga-light-blue h-40"></div>
            <div className="absolute left-8 bottom-0 transform translate-y-1/2 flex">
              <div className="w-32 h-32 rounded-full border-4 border-white bg-white overflow-hidden">
                <img 
                  src={teacher?.avatarUrl || "/placeholder.svg"} 
                  alt={teacher?.name || "Teacher"} 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
          
          <div className="pt-20 pb-8 px-8">
            <h1 className="text-3xl font-bold mb-1">{teacher?.name || "About Our Teacher"}</h1>
            <p className="text-yoga-blue font-medium mb-6">{teacher?.title}</p>
            
            <div className="space-y-6">
              <section>
                <h2 className="text-2xl font-semibold mb-4">Professional Background</h2>
                <p className="mb-4 text-gray-700">{teacher?.bio}</p>
                <p className="text-gray-700">
                  With {teacher?.experience} years of teaching experience, I have helped hundreds of students transform their practice
                  and achieve their wellness goals. I've led over {teacher?.totalSessions} sessions, ranging from one-on-one
                  therapeutic work to group classes and workshops.
                </p>
              </section>
              
              <section>
                <h2 className="text-2xl font-semibold mb-4">Teaching Philosophy</h2>
                <p className="text-gray-700">
                  I believe yoga is for everybody and every body. My approach is inclusive, compassionate, and focused on
                  helping each student discover their own path to wellness. I emphasize proper alignment, mindful movement,
                  and the integration of breath with movement to create a practice that nurtures both body and mind.
                </p>
              </section>
              
              <section>
                <h2 className="text-2xl font-semibold mb-4">Certifications & Training</h2>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  {teacher?.certifications.map((cert, index) => (
                    <li key={index}>{cert}</li>
                  ))}
                  <li>200+ hours of continuing education in therapeutic applications</li>
                  <li>Meditation teacher training with renowned masters</li>
                </ul>
              </section>
              
              <section>
                <h2 className="text-2xl font-semibold mb-4">Areas of Expertise</h2>
                <div className="flex flex-wrap gap-2">
                  {teacher?.expertise.map((exp, index) => (
                    <span 
                      key={index}
                      className="px-3 py-1 bg-yoga-light-yellow rounded-full text-sm"
                    >
                      {exp}
                    </span>
                  ))}
                </div>
              </section>
              
              <div className="border-t border-gray-200 pt-6 mt-8">
                <Button
                  onClick={() => navigate(`/teachers/${teacher?.id}`)}
                  className="bg-yoga-blue hover:bg-yoga-blue/90 text-white"
                >
                  View Full Profile & Book a Session
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TeacherLearn;
