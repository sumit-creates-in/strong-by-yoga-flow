
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useTeachers as useTeachersContext } from '@/contexts/TeacherContext';

const TeacherProfile = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { bookSession, getTeacher } = useTeachersContext();
  const teacher = id ? getTeacher(id) : null;

  const handleBookSession = async (sessionData: any) => {
    try {
      const booking = bookSession(sessionData);
      // Redirect to booking confirmation page
      navigate('/booking-confirmation');
    } catch (error) {
      console.error('Booking failed:', error);
      // Handle error
    }
  };

  if (!teacher) {
    return (
      <Layout>
        <div className="container mx-auto p-4">
          <h1 className="text-2xl font-bold mb-4">Teacher not found</h1>
          <p>The teacher you are looking for does not exist.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-4">{teacher.name}</h1>
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <img 
              src={teacher.image || "/placeholder.svg"} 
              alt={teacher.name} 
              className="w-full h-64 object-cover rounded-lg mb-4"
            />
            <h2 className="text-xl font-semibold mb-2">{teacher.title}</h2>
            <p className="mb-4">{teacher.bio}</p>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-4">Book a Session</h2>
            {/* Booking form would go here */}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TeacherProfile;
