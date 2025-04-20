
import React from 'react';
import { useParams } from 'react-router-dom';

// Import necessary components and types
import Layout from '@/components/Layout';
import { useTeachers } from '@/contexts/TeacherContext';

// Define any missing types
interface Teacher {
  id: string;
  name: string;
  title: string;
  bio: string;
  image?: string;
  availability?: any[];
  rating?: number;
  sessionTypes?: SessionType[];
  reviews?: any[];
  lastReviewDate?: string;
}

interface SessionType {
  id: string;
  name: string;
  duration: number;
  price: number;
  credits: number;
  description?: string;
}

const TeacherDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { getTeacher } = useTeachers();
  
  // Get teacher data from context using ID from URL
  const teacher: Teacher | null = id ? getTeacher(id) : null;
  
  if (!teacher) {
    return (
      <Layout>
        <div className="container mx-auto p-4">
          <h2 className="text-2xl font-bold">Teacher not found</h2>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-semibold mb-6">{teacher.name}</h1>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <img 
              src={teacher.image || "/placeholder.svg"} 
              alt={teacher.name} 
              className="w-full h-64 object-cover rounded-md mb-4"
            />
            
            <h2 className="text-xl font-semibold mb-2">{teacher.title}</h2>
            <p className="text-gray-700 mb-6">{teacher.bio}</p>
            
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Specialties</h3>
              <div className="flex flex-wrap gap-2">
                {/* Specialties would be listed here */}
                <span className="bg-yoga-light-blue text-yoga-blue px-3 py-1 rounded-full text-sm">
                  Vinyasa Flow
                </span>
                <span className="bg-yoga-light-blue text-yoga-blue px-3 py-1 rounded-full text-sm">
                  Meditation
                </span>
              </div>
            </div>
          </div>
          
          <div>
            <h2 className="text-2xl font-semibold mb-4">Book a Session</h2>
            
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Available Session Types</h3>
              
              {teacher.sessionTypes && teacher.sessionTypes.map(sessionType => (
                <div 
                  key={sessionType.id} 
                  className="border p-4 rounded-md hover:border-yoga-blue transition-colors"
                >
                  <div className="flex justify-between mb-2">
                    <h4 className="font-medium">{sessionType.name}</h4>
                    <span className="text-yoga-blue font-semibold">{sessionType.credits} credits</span>
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-2">
                    {sessionType.duration} minutes
                  </div>
                  
                  <p className="text-sm text-gray-700 mb-4">{sessionType.description}</p>
                  
                  <button className="bg-yoga-blue hover:bg-yoga-blue-dark text-white px-4 py-2 rounded-md w-full">
                    Book Now
                  </button>
                </div>
              ))}
              
              {(!teacher.sessionTypes || teacher.sessionTypes.length === 0) && (
                <p className="text-gray-500">No session types available for this teacher.</p>
              )}
            </div>
            
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-2">Reviews</h3>
              
              {teacher.reviews && teacher.reviews.length > 0 ? (
                <div className="space-y-4">
                  {/* Reviews would be listed here */}
                  <p className="text-sm text-gray-600">
                    Last review: {teacher.lastReviewDate ? new Date(teacher.lastReviewDate).toLocaleDateString() : 'No reviews yet'}
                  </p>
                  <p>Rating: {teacher.rating}/5 ({teacher.reviews.length} reviews)</p>
                </div>
              ) : (
                <p className="text-gray-500">No reviews yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TeacherDetail;
