import React from 'react';
import { useParams } from 'react-router-dom';
import { useTeachers } from '@/contexts/TeacherContext';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from '@/components/ui/button';
import { Star, Clock, Video, PhoneCall, MessageSquare } from 'lucide-react';

const TeacherDetail = () => {
  const { id } = useParams();
  const { getTeacher } = useTeachers();
  const teacher = getTeacher(id || '');
  
  if (!teacher) {
    return (
      <Layout>
        <div>Teacher not found</div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <Card className="w-full max-w-4xl mx-auto">
          <CardHeader>
            <div className="flex items-center space-x-4">
              <Avatar className="w-24 h-24">
                <AvatarImage src={teacher.avatarUrl} alt={teacher.name} />
                <AvatarFallback>{teacher.name.slice(0, 2)}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl font-bold">{teacher.name}</CardTitle>
                <CardDescription>{teacher.title}</CardDescription>
                <div className="flex items-center mt-2">
                  <Star className="text-yellow-500 w-4 h-4 mr-1" />
                  <span>{teacher.rating} ({teacher.reviewCount} reviews)</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p>{teacher.fullBio}</p>
            
            <LastReviewSection teacher={teacher} />
            
            <ReviewsSection teacher={teacher} />
            
            <SessionTypesSection teacher={teacher} />
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

const LastReviewSection = ({ teacher }: { teacher: Teacher }) => (
  <div className="mt-4">
    <h3 className="text-lg font-medium">Recent Review</h3>
    <div className="bg-gray-50 p-3 mt-2 rounded-md">
      <p className="text-sm text-gray-700">
        {teacher.reviews && teacher.reviews.length > 0 
          ? teacher.reviews[0].comment 
          : "No reviews yet"}
      </p>
      {teacher.lastReviewDate && (
        <p className="text-xs text-gray-500 mt-1">{new Date(teacher.lastReviewDate).toLocaleDateString()}</p>
      )}
    </div>
  </div>
);

const ReviewsSection = ({ teacher }: { teacher: Teacher }) => {
  const reviews = teacher.reviews || [];
  
  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Reviews ({reviews.length || 0})</h2>
      </div>
      
      {reviews && reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review, index) => (
            // Render reviews
            <div key={index}>Review item</div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center py-4">No reviews yet.</p>
      )}
    </div>
  );
};

const SessionTypesSection = ({ teacher }: { teacher: Teacher }) => {
  const handleSessionSelect = (session: any) => {
    // Handle session selection logic
    console.log('Selected session:', session);
  };
  
  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold mb-4">Session Types</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teacher.sessionTypes.map(session => (
          <SessionTypeCard 
            key={session.id} 
            session={session} 
            onSelect={() => handleSessionSelect(session)} 
          />
        ))}
      </div>
    </div>
  );
};

const SessionTypeCard = ({ session, onSelect }: { session: SessionType, onSelect: () => void }) => (
  <div className="border rounded-lg p-4 hover:border-yoga-blue cursor-pointer" onClick={onSelect}>
    <div className="flex justify-between">
      <h3 className="font-medium">{session.name}</h3>
      <span className="font-bold">${session.price}</span>
    </div>
    
    <div className="flex items-center mt-2 text-sm text-gray-600">
      <Clock className="w-4 h-4 mr-1" />
      <span>{session.duration} minutes</span>
    </div>
    
    <div className="mt-2 text-sm">
      <span className="inline-flex items-center px-2 py-1 rounded-full bg-gray-100 text-gray-800">
        {session.type === 'video' && <Video className="w-3 h-3 mr-1" />}
        {session.type === 'call' && <PhoneCall className="w-3 h-3 mr-1" />}
        {session.type === 'chat' && <MessageSquare className="w-3 h-3 mr-1" />}
        {session.type || 'Video Call'}
      </span>
    </div>
    
    {session.description && (
      <p className="mt-2 text-sm text-gray-600">{session.description}</p>
    )}
  </div>
);

export default TeacherDetail;
